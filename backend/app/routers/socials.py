from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Social, User
from ..schemas import SocialBase, SocialOut

router = APIRouter(prefix="/api/socials", tags=["socials"])


@router.get("", response_model=list[SocialOut])
def list_socials(db: Session = Depends(get_db)):
    return db.query(Social).order_by(Social.id).all()


@router.post("", response_model=SocialOut, status_code=status.HTTP_201_CREATED)
def create_social(
    body: SocialBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    social = Social(**body.model_dump())
    db.add(social)
    db.commit()
    db.refresh(social)
    return social


@router.put("/{social_id}", response_model=SocialOut)
def update_social(
    social_id: int,
    body: SocialBase,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    social = db.get(Social, social_id)
    if social is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")
    for field, value in body.model_dump().items():
        setattr(social, field, value)
    db.commit()
    db.refresh(social)
    return social


@router.delete("/{social_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_social(
    social_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    social = db.get(Social, social_id)
    if social is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Не найдено")
    db.delete(social)
    db.commit()
