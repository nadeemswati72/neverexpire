from datetime import date
from pathlib import Path

from flask import Blueprint, abort, request, send_file
from sqlalchemy.orm import joinedload

from ...db.models import Document, DocumentAccessLog, DocumentFile, Person
from ...db.session import get_session
from ...db.sharing import can_user_access_document, get_effective_share
from ...storage import gdrive_cache_path, get_storage_backend_for_id
from ...watermark import WATERMARKABLE_EXTENSIONS, apply_watermark, watermarked_path_for
from ..jwt_utils import jwt_required
from flask import g

files_bp = Blueprint("files", __name__)


def _materialize_local_path(doc_file: DocumentFile) -> Path | None:
    """
    Return a real local Path for this file, regardless of where it's actually
    stored. Google Drive-backed files get downloaded + decrypted into a local
    cache once (the watermark pipeline needs a real path on disk); local files
    are returned as-is.
    """
    stored = doc_file.file_path
    if not stored.startswith("gdrive:"):
        path = Path(stored)
        return path if path.exists() else None

    suffix = Path(doc_file.original_filename or "").suffix
    cache_path = gdrive_cache_path(stored, suffix)
    if cache_path.exists():
        return cache_path

    try:
        data = get_storage_backend_for_id(stored).get_file(stored)
    except Exception:
        return None

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_bytes(data)
    return cache_path


@files_bp.get("/api/v1/files/<int:file_id>")
@jwt_required
def serve_file(file_id: int):
    as_attachment = request.args.get("download") == "1"

    with get_session() as session:
        doc_file = (
            session.query(DocumentFile)
            .options(joinedload(DocumentFile.document).joinedload(Document.person))
            .filter_by(id=file_id)
            .first()
        )
        if doc_file is None:
            abort(404)

        # Check access: owner or shared user
        person = doc_file.document.person if doc_file.document else None
        if person is None:
            abort(404)

        is_owner = person.user_id == g.current_user_id
        required_permission = "download" if as_attachment else "read"
        has_shared_access = can_user_access_document(
            session, g.current_user_id, doc_file.document_id, required_permission
        )

        if not (is_owner or has_shared_access):
            abort(403)

        # Owner explicitly downloading their own file gets the clean original —
        # it's already theirs, watermarking it protects against nothing. Their
        # in-app preview stays watermarked (a glance over their shoulder still
        # shows a stamped copy). A shared recipient's copy depends on the
        # sharer's per-share choice (defaults to watermarked either way).
        if is_owner:
            will_watermark = not as_attachment
        else:
            effective_share = get_effective_share(session, g.current_user_id, doc_file.document_id)
            will_watermark = effective_share["watermark"] if effective_share else True

        # Log accesses by non-owners so the owner can see who viewed/downloaded their document.
        if not is_owner:
            session.add(DocumentAccessLog(
                document_id=doc_file.document_id,
                user_id=g.current_user_id,
                action="download" if as_attachment else "view",
                watermarked=will_watermark,
            ))
            session.commit()

        file_path = _materialize_local_path(doc_file)
        if file_path is None:
            abort(404)

        suffix = file_path.suffix.lower()

        if suffix in WATERMARKABLE_EXTENSIONS and will_watermark:
            if is_owner:
                wm_path = watermarked_path_for(file_path)
                if not wm_path.exists():
                    wm_path = apply_watermark(file_path) or file_path
            else:
                # Personalized watermark identifies the recipient, so a leaked
                # copy can be traced back to whoever it was shared with.
                tag = str(g.current_user_id)
                wm_path = watermarked_path_for(file_path, tag=tag)
                if not wm_path.exists():
                    subtext = f"Shared with {g.current_user_email} · {date.today().isoformat()}"
                    wm_path = apply_watermark(file_path, subtext=subtext, tag=tag) or file_path
            serve_path = wm_path
        else:
            # Owner's explicit download, or a share the owner marked "no watermark".
            serve_path = file_path

        return send_file(
            serve_path,
            mimetype=_mime(suffix),
            as_attachment=as_attachment,
            download_name=doc_file.original_filename or file_path.name,
        )


def _mime(suffix: str) -> str:
    return {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".webp": "image/webp",
        ".gif": "image/gif", ".pdf": "application/pdf",
    }.get(suffix, "application/octet-stream")
