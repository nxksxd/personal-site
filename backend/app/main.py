import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import Base, engine, get_db
from .models import User
from .routers import auth, categories, dashboard, posts, projects, socials, uploads
from .seed import seed_content


def _resolve_data_dir() -> str:
    """Resolve writable data directory (same logic as database.py)."""
    preferred = os.getenv("DATA_DIR", "/data")
    for directory in (preferred, os.path.join(os.getcwd(), "data")):
        try:
            os.makedirs(directory, exist_ok=True)
            return directory
        except OSError:
            continue
    return os.path.join(os.getcwd(), "data")


DATA_DIR = _resolve_data_dir()
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(_: FastAPI):
    db = next(get_db())
    try:
        seed_content(db)
    finally:
        db.close()
    yield


app = FastAPI(title="nxksxd personal site API", version="1.0.0", lifespan=lifespan)

_origins_env = os.getenv("CORS_ORIGINS", "*")
allow_origins = ["*"] if _origins_env.strip() == "*" else [
    o.strip() for o in _origins_env.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


root = APIRouter(prefix="/api", tags=["meta"])


@root.get("/health")
def health():
    return {"status": "ok"}


@root.post("/reset", status_code=204)
def reset_content(
    _: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    seed_content(db, force=True)


app.include_router(root)
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(projects.router)
app.include_router(socials.router)
app.include_router(categories.router)
app.include_router(uploads.router)
app.include_router(dashboard.router)

# Serve uploaded files as static
if os.path.isdir(UPLOADS_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


# Optionally serve the built frontend (single-origin deployment). Activated only
# when FRONTEND_DIST points to an existing build, so local dev is unaffected.
_frontend_dist = os.getenv(
    "FRONTEND_DIST",
    os.path.join(os.path.dirname(__file__), "..", "..", "dist"),
)
if os.path.isdir(_frontend_dist):
    _index = os.path.join(_frontend_dist, "index.html")
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(_frontend_dist, "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        candidate = os.path.join(_frontend_dist, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(_index)
