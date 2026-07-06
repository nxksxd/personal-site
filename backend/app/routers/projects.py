from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Post, Project, User
from ..schemas import ProjectBase, ProjectOut

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.id).all()

    # Count published posts per project in a single grouped query.
    rows = (
        db.query(Post.project_id, func.count(Post.id))
        .filter(Post.status == "published", Post.project_id.isnot(None))
        .group_by(Post.project_id)
        .all()
    )
    counts = {row[0]: row[1] for row in rows}

    result = []
    for p in projects:
        out = ProjectOut.model_validate(p)
        out.post_count = counts.get(p.id, 0)
        result.append(out)
    return result


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(**body.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    body: ProjectBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")
    for field, value in body.model_dump().items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")
    db.delete(project)
    db.commit()
