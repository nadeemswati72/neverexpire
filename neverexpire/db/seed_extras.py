"""One-off script: adds dummy avatar photos for every person and attaches
placeholder files to ~70% of documents, for UI testing.

Usage: python -m neverexpire.db.seed_extras
"""

import base64
import uuid

from .. import config
from .models import Document, DocumentFile, Person
from .session import SessionLocal

AVATAR_DIR = config.BASE_DIR / "neverexpire" / "web" / "static" / "avatars"

PALETTE = [
    "#5b3cc4", "#1aa7c0", "#e85d75", "#f4a261", "#2a9d8f",
    "#e76f51", "#6a4c93", "#3a86ff", "#ff8fab", "#06a77d",
]

AVATAR_SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
    '<rect width="64" height="64" rx="32" fill="{color}"/>'
    '<text x="32" y="41" font-family="Arial, Helvetica, sans-serif" font-size="24" '
    'font-weight="700" fill="#ffffff" text-anchor="middle">{initials}</text>'
    "</svg>"
)

# 1x1 transparent PNG, used as a stand-in for uploaded scans/photos.
PLACEHOLDER_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


def _initials(full_name: str) -> str:
    parts = full_name.split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return full_name[:2].upper()


def _seed_avatars(session) -> int:
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    updated = 0
    for person in session.query(Person).all():
        if person.photo_path:
            continue
        color = PALETTE[person.id % len(PALETTE)]
        svg = AVATAR_SVG.format(color=color, initials=_initials(person.full_name))
        filename = f"person_{person.id}.svg"
        (AVATAR_DIR / filename).write_text(svg, encoding="utf-8")
        person.photo_path = f"avatars/{filename}"
        updated += 1
    return updated


def _seed_document_files(session) -> int:
    existing_doc_ids = {f.document_id for f in session.query(DocumentFile.document_id).all()}
    added = 0
    for document in session.query(Document).order_by(Document.id).all():
        if document.id in existing_doc_ids:
            continue
        if document.id % 10 in (7, 8, 9):
            continue

        person_dir = config.UPLOAD_DIR / str(document.person_id)
        person_dir.mkdir(parents=True, exist_ok=True)
        original_filename = f"scan_{document.id}.png"
        stored_name = f"{uuid.uuid4().hex}_{original_filename}"
        path = person_dir / stored_name
        path.write_bytes(PLACEHOLDER_PNG)

        session.add(
            DocumentFile(
                document_id=document.id,
                file_path=str(path),
                original_filename=original_filename,
                mime_type="image/png",
                file_size_bytes=path.stat().st_size,
            )
        )
        added += 1
    return added


def run() -> None:
    with SessionLocal() as session:
        avatars = _seed_avatars(session)
        files = _seed_document_files(session)
        session.commit()

    print(f"Avatars created: {avatars}")
    print(f"Document files attached: {files}")


if __name__ == "__main__":
    run()
