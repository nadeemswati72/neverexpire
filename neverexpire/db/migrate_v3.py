"""One-time migration: adds document_number/issuing_authority/holder_name/notes
columns to documents, and watermarked_file_path to document_files, preserving
existing rows."""

from sqlalchemy import text

from . import models  # noqa: F401  (registers models on Base.metadata)
from .base import Base
from .session import engine

NEW_COLUMNS = [
    ("documents", "document_number", "VARCHAR(100)", None),
    ("documents", "issuing_authority", "VARCHAR(255)", None),
    ("documents", "holder_name", "VARCHAR(255)", None),
    ("documents", "notes", "TEXT", None),
    ("document_files", "watermarked_file_path", "VARCHAR(1024)", None),
]


def _column_exists(conn, table: str, column: str) -> bool:
    rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return any(row[1] == column for row in rows)


def run_migration() -> None:
    with engine.begin() as conn:
        for table, column, col_type, default in NEW_COLUMNS:
            if _column_exists(conn, table, column):
                continue
            ddl = f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"
            if default is not None:
                ddl += f" DEFAULT {default}"
            conn.execute(text(ddl))

    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    run_migration()
    print("Migration complete.")
