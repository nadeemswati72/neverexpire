import uuid
from datetime import date, timedelta
from pathlib import Path

from flask import (
    Blueprint,
    abort,
    flash,
    g,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    url_for,
)

from werkzeug.datastructures import ImmutableMultiDict

from ... import config, extractor, watermark
from ...db.models import DocumentFieldDefinition, DocumentType, Person
from ...db.queries import get_document, get_documents_for_user, get_persons_for_user
from ...db.repository import (
    create_document_from_extraction,
    create_manual_document,
    delete_document,
    get_or_default_document_type,
    parse_date,
)
from ..auth import current_user, login_required

documents_bp = Blueprint("documents", __name__, url_prefix="/documents")


def _active_field_definitions(document_type: DocumentType) -> list[DocumentFieldDefinition]:
    return sorted(
        (field for field in document_type.field_definitions if field.is_active),
        key=lambda field: (field.display_order, field.id),
    )


def _extraction_field_definitions(document_type: DocumentType) -> list[DocumentFieldDefinition]:
    return [field for field in _active_field_definitions(document_type) if field.applies_to_extraction]


def _parse_extra_fields(
    field_definitions: list[DocumentFieldDefinition], form: ImmutableMultiDict
) -> dict:
    extra_fields: dict = {}
    for field in field_definitions:
        form_name = f"extra__{field.field_code}"
        if field.data_type == "boolean":
            extra_fields[field.field_code] = form_name in form
            continue

        raw_value = (form.get(form_name) or "").strip()
        if not raw_value:
            continue

        if field.data_type == "number":
            try:
                extra_fields[field.field_code] = float(raw_value) if "." in raw_value else int(raw_value)
            except ValueError:
                continue
        else:
            extra_fields[field.field_code] = raw_value
    return extra_fields


@documents_bp.route("/")
@login_required
def list_documents():
    user = current_user()
    status_filter = request.args.get("filter")
    if status_filter not in ("expiring_soon", "expired", "valid", "no_expiry"):
        status_filter = None
    documents = get_documents_for_user(g.db, user.id, status_filter)
    today = date.today()
    soon_cutoff = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)
    return render_template(
        "documents/list.html",
        documents=documents,
        today=today,
        soon_cutoff=soon_cutoff,
        status_filter=status_filter,
    )


@documents_bp.route("/<int:document_id>")
@login_required
def detail(document_id):
    user = current_user()
    document = get_document(g.db, document_id)
    if document is None or document.person.user_id != user.id:
        abort(404)
    today = date.today()
    soon_cutoff = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)
    return render_template("documents/detail.html", document=document, today=today, soon_cutoff=soon_cutoff)


@documents_bp.route("/<int:document_id>/delete", methods=["POST"])
@login_required
def delete(document_id):
    user = current_user()
    document = get_document(g.db, document_id)
    if document is None or document.person.user_id != user.id:
        abort(404)
    delete_document(g.db, document)
    flash("Document deleted.", "success")
    return redirect(url_for("documents.list_documents"))


@documents_bp.route("/files/<int:document_id>/<int:file_id>")
@login_required
def serve_file(document_id, file_id):
    user = current_user()
    document = get_document(g.db, document_id)
    if document is None or document.person.user_id != user.id:
        abort(404)
    document_file = next((f for f in document.files if f.id == file_id), None)
    if document_file is None:
        abort(404)
    path = Path(document_file.watermarked_file_path or document_file.file_path)
    return send_from_directory(path.parent, path.name)


@documents_bp.route("/add", methods=["GET", "POST"])
@login_required
def add_document():
    user = current_user()
    persons = get_persons_for_user(g.db, user.id)
    document_types = (
        g.db.query(DocumentType)
        .filter_by(is_active=True)
        .order_by(DocumentType.default_name)
        .all()
    )
    field_defs_by_type = {
        document_type.id: _active_field_definitions(document_type) for document_type in document_types
    }
    add_context = {
        "persons": persons,
        "document_types": document_types,
        "field_defs_by_type": field_defs_by_type,
    }

    if request.method == "POST":
        try:
            person_id = int(request.form["person_id"])
        except (KeyError, ValueError):
            abort(400)
        if person_id not in [person.id for person in persons]:
            abort(400)

        file = request.files.get("file")
        if file is None or file.filename == "":
            flash("Please choose a file to upload.", "error")
            return render_template("documents/add.html", **add_context)

        suffix = Path(file.filename).suffix.lower()
        if suffix not in extractor.EXTENSION_MEDIA_TYPES:
            flash("Unsupported file type.", "error")
            return render_template("documents/add.html", **add_context)

        staging_name = f"{uuid.uuid4().hex}{suffix}"
        staging_path = config.STAGING_DIR / staging_name
        file.save(staging_path)

        try:
            extraction = extractor.extract_expiry_info(str(staging_path))
        except Exception as exc:
            staging_path.unlink(missing_ok=True)
            flash(f"Extraction failed: {exc}", "error")
            return render_template("documents/add.html", **add_context)

        suggested = get_or_default_document_type(g.db, extraction.document_type)

        extra_field_values: dict = {}
        extraction_fields = _extraction_field_definitions(suggested)
        if extraction_fields:
            try:
                extra_field_values = extractor.extract_additional_fields(
                    str(staging_path), suggested.default_name, extraction_fields
                )
            except Exception:
                extra_field_values = {}

        session["pending_upload"] = {
            "staging_filename": staging_name,
            "original_filename": file.filename,
            "person_id": person_id,
            "extraction": extraction.model_dump(),
            "extra_field_values": extra_field_values,
        }

        return render_template(
            "documents/review.html",
            extraction=extraction,
            document_types=document_types,
            suggested_type_id=suggested.id,
            person=g.db.get(Person, person_id),
            field_defs_by_type=field_defs_by_type,
            extra_field_values=extra_field_values,
        )

    return render_template("documents/add.html", **add_context)


@documents_bp.route("/add/manual", methods=["POST"])
@login_required
def add_document_manual():
    user = current_user()
    persons = get_persons_for_user(g.db, user.id)

    try:
        person_id = int(request.form["person_id"])
    except (KeyError, ValueError):
        abort(400)
    if person_id not in [person.id for person in persons]:
        abort(400)

    try:
        document_type_id = int(request.form["document_type_id"])
    except (KeyError, ValueError):
        abort(400)
    document_type = g.db.get(DocumentType, document_type_id)
    if document_type is None:
        abort(400)

    title = request.form.get("title", "").strip()
    if not title:
        flash("Title is required.", "error")
        return redirect(url_for("documents.add_document"))

    issued_date = parse_date(request.form.get("issued_date") or None)
    expiry_date = parse_date(request.form.get("expiry_date") or None)
    document_number = request.form.get("document_number", "").strip() or None
    issuing_authority = request.form.get("issuing_authority", "").strip() or None
    holder_name = request.form.get("holder_name", "").strip() or None
    notes = request.form.get("notes", "").strip() or None
    extra_fields = _parse_extra_fields(_active_field_definitions(document_type), request.form)

    document = create_manual_document(
        session=g.db,
        person_id=person_id,
        document_type=document_type,
        title=title,
        issued_date=issued_date,
        expiry_date=expiry_date,
        document_number=document_number,
        issuing_authority=issuing_authority,
        holder_name=holder_name,
        notes=notes,
        extra_fields=extra_fields or None,
    )

    flash("Document saved.", "success")
    return redirect(url_for("documents.detail", document_id=document.id))


@documents_bp.route("/add/confirm", methods=["POST"])
@login_required
def confirm_document():
    user = current_user()
    pending = session.get("pending_upload")
    if pending is None:
        flash("No pending upload found. Please start again.", "error")
        return redirect(url_for("documents.add_document"))

    person = g.db.get(Person, pending["person_id"])
    if person is None or person.user_id != user.id:
        abort(400)

    staging_path = config.STAGING_DIR / pending["staging_filename"]
    if not staging_path.exists():
        flash("Uploaded file is no longer available. Please start again.", "error")
        session.pop("pending_upload", None)
        return redirect(url_for("documents.add_document"))

    extraction = extractor.ExpiryExtraction(**pending["extraction"])

    try:
        document_type_id = int(request.form["document_type_id"])
    except (KeyError, ValueError):
        abort(400)
    document_type = g.db.get(DocumentType, document_type_id)
    if document_type is None:
        abort(400)

    title = request.form.get("title", "").strip()
    issued_date = parse_date(request.form.get("issued_date") or None)
    expiry_date = parse_date(request.form.get("expiry_date") or None)
    document_number = request.form.get("document_number", "").strip() or None
    issuing_authority = request.form.get("issuing_authority", "").strip() or None
    holder_name = request.form.get("holder_name", "").strip() or None
    notes = request.form.get("notes", "").strip() or None
    extra_fields = _parse_extra_fields(_active_field_definitions(document_type), request.form)

    person_dir = config.UPLOAD_DIR / str(person.id)
    person_dir.mkdir(parents=True, exist_ok=True)
    final_path = person_dir / f"{uuid.uuid4().hex}_{pending['original_filename']}"
    staging_path.rename(final_path)
    watermarked_path = watermark.apply_watermark(final_path)

    document = create_document_from_extraction(
        session=g.db,
        person_id=person.id,
        file_path=final_path,
        extraction=extraction,
        model_name=config.EXTRACTION_MODEL,
        confirmed_document_type=document_type,
        confirmed_title=title or None,
        confirmed_issued_date=issued_date,
        confirmed_expiry_date=expiry_date,
        confirmed_document_number=document_number,
        confirmed_issuing_authority=issuing_authority,
        confirmed_holder_name=holder_name,
        confirmed_notes=notes,
        extra_fields=extra_fields or None,
        watermarked_file_path=watermarked_path,
    )

    session.pop("pending_upload", None)
    flash("Document saved.", "success")
    return redirect(url_for("documents.detail", document_id=document.id))
