"""Lightweight startup auto-migration for SQLite.

`Base.metadata.create_all()` only creates *missing tables* — it never adds
*missing columns* to a table that already exists. When the persistent /data
volume holds an older schema (e.g. a `posts` table created before the CMS
fields were added), the app crashes on startup with
`sqlite3.OperationalError: no such column: posts.status`.

This module bridges that gap: for every mapped model it inspects the live
table and issues `ALTER TABLE ... ADD COLUMN` for any column the database is
missing. SQLite supports adding columns cheaply, and any column that is part
of a model but absent from the DB is added with a sensible default so existing
rows stay valid. New tables are still handled by create_all(); this only
reconciles columns on tables that already exist.
"""

from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from .database import Base
from . import models  # noqa: F401 - ensure all tables are registered on Base.metadata


def _sqlite_type(column) -> str:
    """Map a SQLAlchemy column type to a SQLite column type keyword."""
    type_name = column.type.__class__.__name__.upper()
    if type_name in ("INTEGER", "BIGINTEGER", "SMALLINTEGER"):
        return "INTEGER"
    if type_name in ("TEXT", "JSON"):
        return "TEXT"
    # STRING, VARCHAR, and anything else default to TEXT in SQLite.
    return "TEXT"


def _default_clause(column) -> str:
    """Build a DEFAULT clause for ADD COLUMN so existing rows stay valid."""
    default = column.default
    if default is not None and default.is_scalar:
        value = default.arg
        if isinstance(value, str):
            return f" DEFAULT '{value}'"
        if isinstance(value, bool):
            return f" DEFAULT {1 if value else 0}"
        if isinstance(value, (int, float)):
            return f" DEFAULT {value}"
    # JSON/list columns: default to an empty JSON array literal.
    if column.type.__class__.__name__.upper() == "JSON":
        return " DEFAULT '[]'"
    # NOT NULL columns without an explicit default need *some* default to be
    # addable to a table that already has rows.
    if not column.nullable:
        col_type = _sqlite_type(column)
        return " DEFAULT 0" if col_type == "INTEGER" else " DEFAULT ''"
    return ""


def run_migrations(engine: Engine) -> list[str]:
    """Add any model columns missing from existing tables. Returns applied DDL."""
    applied: list[str] = []
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                # create_all() will handle brand-new tables.
                continue
            existing_columns = {
                col["name"] for col in inspector.get_columns(table.name)
            }
            for column in table.columns:
                if column.name in existing_columns:
                    continue
                col_type = _sqlite_type(column)
                default = _default_clause(column)
                ddl = (
                    f'ALTER TABLE "{table.name}" '
                    f'ADD COLUMN "{column.name}" {col_type}{default}'
                )
                conn.execute(text(ddl))
                applied.append(ddl)

    return applied
