"""One-time migration: adds photo_path/is_system/extra_fields/source columns and the
document_field_definitions table to an existing v1 database, preserving existing rows."""

from sqlalchemy import text

from . import models  # noqa: F401  (registers models on Base.metadata)
from .base import Base
from .models import DocumentType, FamilyRelationType
from .seed import DOCUMENT_TYPES, FAMILY_RELATION_TYPES, seed_reference_data
from .session import SessionLocal, engine

NEW_COLUMNS = [
    ("users", "photo_path", "VARCHAR(1024)", None),
    ("persons", "photo_path", "VARCHAR(1024)", None),
    ("document_types", "is_system", "BOOLEAN NOT NULL", "0"),
    ("family_relation_types", "is_system", "BOOLEAN NOT NULL", "0"),
    ("documents", "extra_fields", "TEXT", None),
    ("documents", "source", "VARCHAR(10) NOT NULL", "'upload'"),
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

    # Create new tables (document_field_definitions) without touching existing ones.
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        seed_codes = {code for code, _ in DOCUMENT_TYPES}
        for document_type in session.query(DocumentType).filter(DocumentType.code.in_(seed_codes)):
            document_type.is_system = True

        relation_codes = {code for code, _ in FAMILY_RELATION_TYPES}
        for relation_type in session.query(FamilyRelationType).filter(FamilyRelationType.code.in_(relation_codes)):
            relation_type.is_system = True

        session.commit()

        # Seed the new document_field_definitions demo rows (idempotent).
        seed_reference_data(session)


if __name__ == "__main__":
    run_migration()
    print("Migration complete.")
