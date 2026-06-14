import uuid
from pathlib import Path

from flask import Blueprint, jsonify, request

from ... import config, extractor

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@api_bp.route("/extract", methods=["POST"])
def extract():
    """Mobile-facing AI extraction: upload an image/PDF, get back the same
    fields the web "Add Document" flow extracts. No auth, no persistence —
    the mobile app uses this to pre-fill its own Add Document form."""
    file = request.files.get("file")
    if file is None or file.filename == "":
        return jsonify({"error": "No file uploaded."}), 400

    suffix = Path(file.filename).suffix.lower()
    if suffix not in extractor.EXTENSION_MEDIA_TYPES:
        return jsonify({"error": "Unsupported file type."}), 400

    staging_name = f"{uuid.uuid4().hex}{suffix}"
    staging_path = config.STAGING_DIR / staging_name
    file.save(staging_path)

    try:
        extraction = extractor.extract_expiry_info(str(staging_path))
    except Exception as exc:
        return jsonify({"error": f"Extraction failed: {exc}"}), 502
    finally:
        staging_path.unlink(missing_ok=True)

    return jsonify(extraction.model_dump())
