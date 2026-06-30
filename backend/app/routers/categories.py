import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Category, User
from ..schemas import CategoryBase, CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


def _slugify(text: str) -> str:
    """Simple slug generator: lowercase, replace spaces/special chars with hyphens."""
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    body: CategoryBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    slug = body.slug or _slugify(body.name)

    # Check uniqueness
    existing = db.query(Category).filter(
        (Category.name == body.name) | (Category.slug == slug)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Категория с таким именем или slug уже существует",
        )

    category = Category(
        name=body.name,
        slug=slug,
        color=body.color or "#6366f1",
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    body: CategoryBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена"
        )

    slug = body.slug or _slugify(body.name)

    # Check uniqueness (exclude current)
    existing = db.query(Category).filter(
        Category.id != category_id,
        (Category.name == body.name) | (Category.slug == slug),
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Категория с таким именем или slug уже существует",
        )

    category.name = body.name
    category.slug = slug
    category.color = body.color or "#6366f1"
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена"
        )
    db.delete(category)
    db.commit()
