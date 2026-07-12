import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import Base, engine, get_db
from .migrate import run_migrations
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
if engine.dialect.name == "sqlite" and "detail_content" not in {column["name"] for column in inspect(engine).get_columns("projects")}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE projects ADD COLUMN detail_content TEXT NOT NULL DEFAULT ''"))

# Reconcile columns on pre-existing tables (persistent /data volume may hold an
# older schema). Prevents "no such column" crashes on restart after a model
# adds fields. Safe no-op when the schema is already current.
try:
    _applied = run_migrations(engine)
    if _applied:
        print(f"[migrate] applied {len(_applied)} column migration(s):")
        for _ddl in _applied:
            print(f"[migrate]   {_ddl}")
except Exception as exc:  # pragma: no cover - defensive, never block startup
    print(f"[migrate] WARNING: auto-migration failed: {exc}")


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
    # Absolute, symlink-resolved root the SPA is allowed to serve from. Used
    # to contain every candidate path and block path-traversal (e.g. a request
    # for "..%2f..%2fetc%2fpasswd" that decodes to "../../etc/passwd").
    _dist_root = os.path.realpath(_frontend_dist)
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(_frontend_dist, "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        candidate = os.path.realpath(os.path.join(_dist_root, full_path))
        # Only serve the file if it resolves to something *inside* the dist
        # root. Anything escaping the root (traversal) falls through to the
        # SPA index instead of leaking arbitrary files from the container.
        if (
            full_path
            and (candidate == _dist_root or candidate.startswith(_dist_root + os.sep))
            and os.path.isfile(candidate)
        ):
            return FileResponse(candidate)
        return FileResponse(_index)
