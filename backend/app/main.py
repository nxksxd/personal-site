import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import Base, engine, get_db
from .models import User
from .routers import auth, posts, projects, socials
from .seed import seed_content

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
