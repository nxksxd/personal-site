import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user
from ..database import get_db
from ..models import Post, User
from ..schemas import PostBase, PostOut

router = APIRouter(prefix="/api/posts", tags=["posts"])


def _slugify(text: str) -> str:
    """Simple slug generator: lowercase, replace spaces/special chars with hyphens."""
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def _unique_slug(db: Session, base_slug: str, exclude_id: Optional[int] = None) -> str:
    """Ensure the slug is unique, appending -2, -3, etc. if needed."""
    slug = base_slug
    counter = 2
    while True:
        q = db.query(Post).filter(Post.slug == slug)
        if exclude_id is not None:
            q = q.filter(Post.id != exclude_id)
        if q.first() is None:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


@router.get("", response_model=list[PostOut])
def list_posts(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_id: Optional[int] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Public endpoint — returns only published posts by default."""
    q = db.query(Post).options(joinedload(Post.category))

    # Public: only published unless explicitly filtered
    if status_filter is None:
        q = q.filter(Post.status == "published")
    else:
        q = q.filter(Post.status == status_filter)

    if category_id is not None:
        q = q.filter(Post.category_id == category_id)

    if tag is not None:
        # JSON array contains — SQLite compatible
        q = q.filter(Post.tags.contains(tag))

    return q.order_by(Post.date.desc(), Post.id.desc()).all()


@router.get("/all", response_model=list[PostOut])
def list_all_posts(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_id: Optional[int] = Query(None),
    tag: Optional[str] = Query(None),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Admin endpoint — returns all posts including drafts."""
    q = db.query(Post).options(joinedload(Post.category))

    if status_filter is not None:
        q = q.filter(Post.status == status_filter)

    if category_id is not None:
        q = q.filter(Post.category_id == category_id)

    if tag is not None:
        q = q.filter(Post.tags.contains(tag))

    return q.order_by(Post.date.desc(), Post.id.desc()).all()


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).options(joinedload(Post.category)).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")
    return post


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    body: PostBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc).isoformat()
    data = body.model_dump()

    # Auto-generate slug
    slug = data.get("slug") or _slugify(data["title"])
    data["slug"] = _unique_slug(db, slug)

    data["created_at"] = now
    data["updated_at"] = None

    post = Post(**data)
    db.add(post)
    db.commit()
    db.refresh(post)

    # Reload with relationship
    post = db.query(Post).options(joinedload(Post.category)).filter(Post.id == post.id).first()
    return post


@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    body: PostBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")

    now = datetime.now(timezone.utc).isoformat()
    data = body.model_dump()

    # Auto-generate slug if not provided
    slug = data.get("slug") or _slugify(data["title"])
    data["slug"] = _unique_slug(db, slug, exclude_id=post_id)
    data["updated_at"] = now

    for field, value in data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)

    # Reload with relationship
    post = db.query(Post).options(joinedload(Post.category)).filter(Post.id == post.id).first()
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")
    db.delete(post)
    db.commit()
