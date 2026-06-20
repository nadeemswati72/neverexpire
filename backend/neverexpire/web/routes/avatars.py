import uuid
from pathlib import Path

from flask import Blueprint, abort, g, jsonify, request, send_file
from PIL import Image

from ... import config
from ...db.models import Person
from ...db.session import get_session
from ..jwt_utils import jwt_required

avatars_bp = Blueprint("avatars", __name__)

ALLOWED = {".jpg", ".jpeg", ".png", ".webp"}
AVATAR_SIZE = (200, 200)


def _owned(session, person_id: int, user_id: int) -> Person | None:
    p = session.get(Person, person_id)
    return p if p and p.user_id == user_id and p.is_active else None


@avatars_bp.post("/api/v1/family/<int:person_id>/photo")
@jwt_required
def upload_photo(person_id: int):
    if "file" not in request.files:
        return jsonify({"data": None, "error": "file is required"}), 400

    file = request.files["file"]
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED:
        return jsonify({"data": None, "error": f"Unsupported type: {suffix}. Use JPG or PNG."}), 400

    with get_session() as session:
        person = _owned(session, person_id, g.current_user_id)
        if person is None:
            abort(404)

        config.AVATAR_DIR.mkdir(parents=True, exist_ok=True)

        # Delete old avatar if exists
        if person.photo_path:
            old = Path(person.photo_path)
            if old.exists():
                old.unlink(missing_ok=True)

        dest = config.AVATAR_DIR / f"{uuid.uuid4().hex}{suffix}"

        # Resize to square 200×200 and save
        img = Image.open(file.stream).convert("RGB")
        img = _crop_square(img)
        img = img.resize(AVATAR_SIZE, Image.LANCZOS)
        img.save(dest, quality=88)

        person.photo_path = str(dest)
        session.commit()

        return jsonify({"data": {"photo_url": f"/api/v1/family/{person_id}/photo"}, "error": None})


@avatars_bp.get("/api/v1/family/<int:person_id>/photo")
@jwt_required
def serve_photo(person_id: int):
    with get_session() as session:
        person = _owned(session, person_id, g.current_user_id)
        if person is None or not person.photo_path:
            abort(404)
        path = Path(person.photo_path)
        if not path.exists():
            abort(404)
        return send_file(path, mimetype="image/jpeg")


@avatars_bp.delete("/api/v1/family/<int:person_id>/photo")
@jwt_required
def delete_photo(person_id: int):
    with get_session() as session:
        person = _owned(session, person_id, g.current_user_id)
        if person is None:
            abort(404)
        if person.photo_path:
            Path(person.photo_path).unlink(missing_ok=True)
            person.photo_path = None
            session.commit()
        return jsonify({"data": {"deleted": True}, "error": None})


def _crop_square(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))
