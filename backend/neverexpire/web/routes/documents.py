import uuid
from datetime import date, timedelta
from pathlib import Path

from flask import Blueprint, g, jsonify, request

from ... import config
from ...db.models import Document, DocumentAccessLog, Person, User
from ...db.queries import get_document, get_documents_for_user
from ...db.repository import (
    add_document_file,
    create_document_from_extraction,
    create_manual_document,
    delete_document,
    get_or_default_document_type,
    parse_date,
)
from ...db.session import get_session
from ...db.sharing import can_user_access_document, get_effective_share
from ...extractor import EXTENSION_MEDIA_TYPES, extract_expiry_info, extract_from_text
from ..jwt_utils import jwt_required
from ..serializers import document_brief, document_detail

documents_bp = Blueprint("documents", __name__)

ALLOWED_UPLOAD_EXTENSIONS = set(EXTENSION_MEDIA_TYPES.keys())


def _doc_owned_by_user(session, doc_id: int, user_id: int) -> Document | None:
    doc = get_document(session, doc_id)
    if doc is None:
        return None
    person = session.get(Person, doc.person_id)
    if person is None or person.user_id != user_id:
        return None
    return doc


def _doc_editable_by_user(session, doc_id: int, user_id: int) -> Document | None:
    """Owner can always edit. Shared users need 'edit' permission."""
    doc = get_document(session, doc_id)
    if doc is None:
        return None
    person = session.get(Person, doc.person_id)
    if person is None:
        return None
    if person.user_id == user_id:
        return doc
    if can_user_access_document(session, user_id, doc_id, "edit"):
        return doc
    return None


def _today_horizon():
    today = date.today()
    return today, today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)


@documents_bp.get("/api/v1/documents")
@jwt_required
def list_documents():
    status_filter = request.args.get("status")
    person_id = request.args.get("person_id", type=int)
    today, horizon = _today_horizon()
    with get_session() as session:
        docs = get_documents_for_user(session, g.current_user_id, status_filter)
        if person_id:
            docs = [d for d in docs if d.person_id == person_id]

        results = []
        for d in docs:
            brief = document_brief(d, today, horizon)
            is_owner = d.person and d.person.user_id == g.current_user_id
            brief["is_owner"] = bool(is_owner)
            if not is_owner:
                share = get_effective_share(session, g.current_user_id, d.id)
                if share:
                    sharer = session.get(User, share["shared_by_user_id"])
                    brief["user_permission"] = share["permission_level"]
                    brief["shared_by_email"] = sharer.email if sharer else None
            results.append(brief)

        return jsonify({"data": results, "error": None})


@documents_bp.post("/api/v1/documents")
@jwt_required
def create_document():
    body = request.get_json(silent=True) or {}
    person_id = body.get("person_id")
    title = (body.get("title") or "").strip()
    doc_type_code = (body.get("document_type_code") or "OTHER").upper()

    if not person_id or not title:
        return jsonify({"data": None, "error": "person_id and title are required"}), 400

    with get_session() as session:
        person = session.get(Person, person_id)
        if person is None or person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Person not found"}), 404

        doc_type = get_or_default_document_type(session, doc_type_code)
        doc = create_manual_document(
            session,
            person_id=person_id,
            document_type=doc_type,
            title=title,
            issued_date=parse_date(body.get("issued_date")),
            expiry_date=parse_date(body.get("expiry_date")),
            document_number=body.get("document_number"),
            issuing_authority=body.get("issuing_authority"),
            holder_name=body.get("holder_name"),
            notes=body.get("notes"),
        )
        today, horizon = _today_horizon()
        doc = get_document(session, doc.id)
        return jsonify({"data": document_brief(doc, today, horizon), "error": None}), 201


@documents_bp.get("/api/v1/documents/<int:doc_id>")
@jwt_required
def get_doc(doc_id: int):
    today, horizon = _today_horizon()
    with get_session() as session:
        doc = get_document(session, doc_id)
        if doc is None:
            return jsonify({"data": None, "error": "Not found"}), 404

        # Check if user owns the document or has read access via sharing
        if not can_user_access_document(session, g.current_user_id, doc_id, "read"):
            return jsonify({"data": None, "error": "Access denied"}), 403

        # Determine user's permission level
        is_owner = doc.person and doc.person.user_id == g.current_user_id
        if is_owner:
            permission_level = "edit"
        else:
            share = get_effective_share(session, g.current_user_id, doc_id)
            permission_level = share["permission_level"] if share else "read"

        response_data = document_detail(doc, today, horizon)
        response_data["user_permission"] = permission_level
        return jsonify({"data": response_data, "error": None})


@documents_bp.put("/api/v1/documents/<int:doc_id>")
@jwt_required
def update_doc(doc_id: int):
    body = request.get_json(silent=True) or {}
    today, horizon = _today_horizon()
    with get_session() as session:
        doc = _doc_editable_by_user(session, doc_id, g.current_user_id)
        if doc is None:
            return jsonify({"data": None, "error": "Not found"}), 404

        if "title" in body and body["title"].strip():
            doc.title = body["title"].strip()
        if "document_type_code" in body:
            doc.document_type = get_or_default_document_type(session, body["document_type_code"])
        if "issued_date" in body:
            doc.issued_date = parse_date(body["issued_date"])
        if "expiry_date" in body:
            doc.expiry_date = parse_date(body["expiry_date"])
        if "document_number" in body:
            doc.document_number = body["document_number"]
        if "issuing_authority" in body:
            doc.issuing_authority = body["issuing_authority"]
        if "holder_name" in body:
            doc.holder_name = body["holder_name"]
        if "notes" in body:
            doc.notes = body["notes"]

        session.commit()
        doc = get_document(session, doc_id)
        return jsonify({"data": document_detail(doc, today, horizon), "error": None})


@documents_bp.delete("/api/v1/documents/<int:doc_id>")
@jwt_required
def delete_doc(doc_id: int):
    with get_session() as session:
        doc = _doc_owned_by_user(session, doc_id, g.current_user_id)
        if doc is None:
            return jsonify({"data": None, "error": "Not found"}), 404
        delete_document(session, doc)
        return jsonify({"data": {"deleted": True}, "error": None})


@documents_bp.post("/api/v1/documents/<int:doc_id>/files")
@jwt_required
def add_file(doc_id: int):
    """Attach a picture/scan to an existing document. Owner only, no AI extraction."""
    if "file" not in request.files:
        return jsonify({"data": None, "error": "file is required"}), 400

    with get_session() as session:
        doc = _doc_owned_by_user(session, doc_id, g.current_user_id)
        if doc is None:
            return jsonify({"data": None, "error": "Not found"}), 404

    file = request.files["file"]
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_EXTENSIONS:
        return jsonify({"data": None, "error": f"Unsupported file type: {suffix}"}), 400

    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest_path = config.UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"
    file.save(dest_path)

    today, horizon = _today_horizon()
    with get_session() as session:
        add_document_file(session, doc_id, dest_path)
        doc = get_document(session, doc_id)
        return jsonify({"data": document_detail(doc, today, horizon), "error": None}), 201


@documents_bp.get("/api/v1/documents/<int:doc_id>/access-log")
@jwt_required
def get_access_log(doc_id: int):
    """Who viewed/downloaded this document. Owner only."""
    with get_session() as session:
        doc = _doc_owned_by_user(session, doc_id, g.current_user_id)
        if doc is None:
            return jsonify({"data": None, "error": "Not found"}), 404

        entries = (
            session.query(DocumentAccessLog)
            .filter_by(document_id=doc_id)
            .order_by(DocumentAccessLog.created_at.desc())
            .limit(50)
            .all()
        )
        data = []
        for entry in entries:
            user = session.get(User, entry.user_id)
            data.append({
                "id": entry.id,
                "user_email": user.email if user else "unknown",
                "action": entry.action,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
            })
        return jsonify({"data": data, "error": None})


@documents_bp.post("/api/v1/documents/extract")
@jwt_required
def extract_only():
    """Upload file, run AI extraction, return fields WITHOUT saving. Frontend pre-fills form."""
    if "file" not in request.files:
        return jsonify({"data": None, "error": "file is required"}), 400

    file = request.files["file"]
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_EXTENSIONS:
        return jsonify({"data": None, "error": f"Unsupported file type: {suffix}"}), 400

    config.STAGING_DIR.mkdir(parents=True, exist_ok=True)
    tmp_path = config.STAGING_DIR / f"{uuid.uuid4().hex}{suffix}"
    file.save(tmp_path)

    try:
        extraction = extract_expiry_info(str(tmp_path))
        return jsonify({
            "data": {
                "document_type": extraction.document_type,
                "title": extraction.title,
                "issued_date": extraction.issued_date,
                "expiry_date": extraction.expiry_date,
                "document_number": extraction.document_number,
                "issuing_authority": extraction.issuing_authority,
                "holder_name": extraction.holder_name,
                "notes": extraction.additional_notes,
                "confidence": extraction.confidence,
                "staging_file": tmp_path.name,
            },
            "error": None,
        })
    except Exception as e:
        tmp_path.unlink(missing_ok=True)
        return jsonify({"data": None, "error": f"Extraction failed: {str(e)}"}), 500


@documents_bp.post("/api/v1/documents/extract-from-text")
@jwt_required
def extract_from_text_only():
    """Parse a typed/dictated description into document fields WITHOUT
    saving — powers the mobile 'voice reminder' Add Document flow."""
    body = request.get_json(silent=True) or {}
    text = (body.get("text") or "").strip()
    if not text:
        return jsonify({"data": None, "error": "text is required"}), 400
    if len(text) > 2000:
        return jsonify({"data": None, "error": "That's too long — try a shorter description"}), 400

    try:
        extraction = extract_from_text(text)
        return jsonify({
            "data": {
                "document_type": extraction.document_type,
                "title": extraction.title,
                "issued_date": extraction.issued_date,
                "expiry_date": extraction.expiry_date,
                "document_number": extraction.document_number,
                "issuing_authority": extraction.issuing_authority,
                "holder_name": extraction.holder_name,
                "notes": extraction.additional_notes,
                "confidence": extraction.confidence,
            },
            "error": None,
        })
    except Exception as e:
        return jsonify({"data": None, "error": f"Could not understand that: {str(e)}"}), 500


@documents_bp.post("/api/v1/documents/upload-and-create")
@jwt_required
def upload_and_create():
    """Upload file + confirmed fields, extract, save document in one shot (mobile flow)."""
    if "file" not in request.files:
        return jsonify({"data": None, "error": "file is required"}), 400

    person_id = request.form.get("person_id", type=int)
    if not person_id:
        return jsonify({"data": None, "error": "person_id is required"}), 400

    with get_session() as session:
        person = session.get(Person, person_id)
        if person is None or person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Person not found"}), 404

    file = request.files["file"]
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_EXTENSIONS:
        return jsonify({"data": None, "error": f"Unsupported file type: {suffix}"}), 400

    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest_path = config.UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"
    file.save(dest_path)

    try:
        extraction = extract_expiry_info(str(dest_path))
    except Exception as e:
        dest_path.unlink(missing_ok=True)
        return jsonify({"data": None, "error": f"Extraction failed: {str(e)}"}), 500

    today, horizon = _today_horizon()
    with get_session() as session:
        confirmed_type_code = request.form.get("document_type_code")
        doc_type = (
            get_or_default_document_type(session, confirmed_type_code)
            if confirmed_type_code
            else None
        )
        doc = create_document_from_extraction(
            session,
            person_id=person_id,
            file_path=dest_path,
            extraction=extraction,
            model_name=config.EXTRACTION_MODEL,
            confirmed_document_type=doc_type,
            confirmed_title=request.form.get("title") or None,
            confirmed_issued_date=parse_date(request.form.get("issued_date")),
            confirmed_expiry_date=parse_date(request.form.get("expiry_date")),
            confirmed_document_number=request.form.get("document_number"),
            confirmed_issuing_authority=request.form.get("issuing_authority"),
            confirmed_holder_name=request.form.get("holder_name"),
            confirmed_notes=request.form.get("notes"),
        )
        doc = get_document(session, doc.id)
        return jsonify({"data": document_detail(doc, today, horizon), "error": None}), 201
