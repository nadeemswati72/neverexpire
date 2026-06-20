from pathlib import Path

from flask import Blueprint, abort, send_file
from sqlalchemy.orm import joinedload

from ...db.models import Document, DocumentFile, Person
from ...db.session import get_session
from ...watermark import WATERMARKABLE_EXTENSIONS, apply_watermark, watermarked_path_for
from ..jwt_utils import jwt_required
from flask import g

files_bp = Blueprint("files", __name__)


@files_bp.get("/api/v1/files/<int:file_id>")
@jwt_required
def serve_file(file_id: int):
    with get_session() as session:
        doc_file = (
            session.query(DocumentFile)
            .options(joinedload(DocumentFile.document).joinedload(Document.person))
            .filter_by(id=file_id)
            .first()
        )
        if doc_file is None:
            abort(404)

        # Ownership check
        person = doc_file.document.person if doc_file.document else None
        if person is None or person.user_id != g.current_user_id:
            abort(403)

        file_path = Path(doc_file.file_path)
        if not file_path.exists():
            abort(404)

        suffix = file_path.suffix.lower()

        if suffix in WATERMARKABLE_EXTENSIONS:
            wm_path = watermarked_path_for(file_path)
            if not wm_path.exists():
                wm_path = apply_watermark(file_path) or file_path
            serve_path = wm_path
        else:
            serve_path = file_path

        return send_file(
            serve_path,
            mimetype=_mime(suffix),
            as_attachment=False,
            download_name=doc_file.original_filename or file_path.name,
        )


def _mime(suffix: str) -> str:
    return {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".webp": "image/webp",
        ".gif": "image/gif", ".pdf": "application/pdf",
    }.get(suffix, "application/octet-stream")
