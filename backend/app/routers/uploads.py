import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Upload, User
from ..schemas import UploadOut

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _uploads_dir() -> str:
    data_dir = os.getenv("DATA_DIR", "/data")
    # Fallback to local ./data if /data is not writable
    for directory in (data_dir, os.path.join(os.getcwd(), "data")):
        try:
            uploads = os.path.join(directory, "uploads")
            os.makedirs(uploads, exist_ok=True)
            return uploads
        except OSError:
            continue
    # Last resort
    uploads = os.path.join(os.getcwd(), "uploads")
    os.makedirs(uploads, exist_ok=True)
    return uploads


@router.post("", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate content type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип файла: {file.content_type}. "
                   f"Разрешены: {', '.join(sorted(ALLOWED_MIME_TYPES))}",
        )

    # Read file data
    data = await file.read()
    if len(data) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимум: {MAX_SIZE_BYTES // (1024 * 1024)} МБ",
        )

    # Generate unique filename
    original_name = file.filename or "upload"
    ext = ""
    if "." in original_name:
        ext = "." + original_name.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"

    # Save to disk
    uploads_dir = _uploads_dir()
    file_path = os.path.join(uploads_dir, unique_name)
    with open(file_path, "wb") as f:
        f.write(data)

    # Save record
    now = datetime.now(timezone.utc).isoformat()
    upload = Upload(
        filename=unique_name,
        original_name=original_name,
        mime_type=file.content_type or "application/octet-stream",
        size=len(data),
        uploaded_at=now,
        url=f"/uploads/{unique_name}",
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload


@router.get("", response_model=list[UploadOut])
def list_uploads(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Upload).order_by(Upload.id.desc()).all()


@router.delete("/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_upload(
    upload_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = db.get(Upload, upload_id)
    if upload is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Файл не найден"
        )

    # Remove file from disk
    uploads_dir = _uploads_dir()
    file_path = os.path.join(uploads_dir, upload.filename)
    if os.path.isfile(file_path):
        os.remove(file_path)

    db.delete(upload)
    db.commit()
