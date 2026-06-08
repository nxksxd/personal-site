import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _resolve_database_url() -> str:
    """Resolve the SQLite database URL.

    Honors DATABASE_URL if set. Otherwise stores the DB in DATA_DIR
    (default /data, the Fly volume mount) and falls back to a local
    ./data directory when /data is not writable (e.g. local dev).
    """
    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return explicit

    preferred = os.getenv("DATA_DIR", "/data")
    for directory in (preferred, os.path.join(os.getcwd(), "data")):
        try:
            os.makedirs(directory, exist_ok=True)
            test_path = os.path.join(directory, ".write_test")
            with open(test_path, "w") as handle:
                handle.write("ok")
            os.remove(test_path)
            return f"sqlite:///{os.path.join(directory, 'site.db')}"
        except OSError:
            continue

    return "sqlite:///./site.db"


DATABASE_URL = _resolve_database_url()

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
