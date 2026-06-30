from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user
from ..database import get_db
from ..models import Category, Post, Project, Social, Upload, User
from ..schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_posts = db.query(Post).count()
    total_projects = db.query(Project).count()
    total_socials = db.query(Social).count()
    published_posts = db.query(Post).filter(Post.status == "published").count()
    draft_posts = db.query(Post).filter(Post.status == "draft").count()
    total_categories = db.query(Category).count()
    total_uploads = db.query(Upload).count()

    recent_posts = (
        db.query(Post)
        .options(joinedload(Post.category))
        .order_by(Post.date.desc(), Post.id.desc())
        .limit(5)
        .all()
    )

    return DashboardStats(
        total_posts=total_posts,
        total_projects=total_projects,
        total_socials=total_socials,
        published_posts=published_posts,
        draft_posts=draft_posts,
        total_categories=total_categories,
        total_uploads=total_uploads,
        recent_posts=recent_posts,
    )
