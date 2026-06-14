from flask import Blueprint, abort, flash, g, redirect, render_template, request, url_for

from ...db.admin_data import (
    create_document_type,
    create_family_relation_type,
    create_field_definition,
    list_document_types,
    list_family_relation_types,
    list_field_definitions,
    set_document_type_active,
    set_family_relation_type_active,
    set_field_definition_active,
    update_document_type_name,
    update_family_relation_type_name,
    update_field_definition,
)
from ...db.models import DocumentType
from ...db.queries import get_admin_summary, list_all_users
from ..auth import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/")
@admin_required
def dashboard():
    summary = get_admin_summary(g.db)
    users = list_all_users(g.db)
    return render_template("admin/dashboard.html", summary=summary, users=users)


# --- Document types -----------------------------------------------------------

@admin_bp.route("/document-types", methods=["GET", "POST"])
@admin_required
def document_types():
    if request.method == "POST":
        try:
            create_document_type(g.db, request.form.get("code", ""), request.form.get("default_name", ""))
            flash("Document type added.", "success")
        except ValueError as exc:
            flash(str(exc), "error")
        return redirect(url_for("admin.document_types"))

    types = list_document_types(g.db)
    return render_template("admin/document_types.html", document_types=types)


@admin_bp.route("/document-types/<int:type_id>/update", methods=["POST"])
@admin_required
def update_document_type(type_id):
    try:
        update_document_type_name(g.db, type_id, request.form.get("default_name", ""))
        flash("Document type updated.", "success")
    except ValueError as exc:
        flash(str(exc), "error")
    return redirect(url_for("admin.document_types"))


@admin_bp.route("/document-types/<int:type_id>/toggle", methods=["POST"])
@admin_required
def toggle_document_type(type_id):
    is_active = request.form.get("is_active") == "1"
    try:
        set_document_type_active(g.db, type_id, is_active)
    except ValueError as exc:
        flash(str(exc), "error")
    return redirect(url_for("admin.document_types"))


# --- Document type field definitions -------------------------------------------

@admin_bp.route("/document-types/<int:type_id>/fields", methods=["GET", "POST"])
@admin_required
def document_type_fields(type_id):
    document_type = g.db.get(DocumentType, type_id)
    if document_type is None:
        abort(404)

    if request.method == "POST":
        try:
            create_field_definition(
                g.db,
                type_id,
                field_code=request.form.get("field_code", ""),
                label=request.form.get("label", ""),
                data_type=request.form.get("data_type", "text"),
                is_required="is_required" in request.form,
                display_order=int(request.form.get("display_order") or 0),
                applies_to_extraction="applies_to_extraction" in request.form,
            )
            flash("Field added.", "success")
        except ValueError as exc:
            flash(str(exc), "error")
        return redirect(url_for("admin.document_type_fields", type_id=type_id))

    fields = list_field_definitions(g.db, type_id)
    return render_template("admin/document_type_fields.html", document_type=document_type, fields=fields)


@admin_bp.route("/document-types/<int:type_id>/fields/<int:field_id>/update", methods=["POST"])
@admin_required
def update_document_type_field(type_id, field_id):
    try:
        update_field_definition(
            g.db,
            field_id,
            label=request.form.get("label", ""),
            data_type=request.form.get("data_type", "text"),
            is_required="is_required" in request.form,
            display_order=int(request.form.get("display_order") or 0),
            applies_to_extraction="applies_to_extraction" in request.form,
        )
        flash("Field updated.", "success")
    except ValueError as exc:
        flash(str(exc), "error")
    return redirect(url_for("admin.document_type_fields", type_id=type_id))


@admin_bp.route("/document-types/<int:type_id>/fields/<int:field_id>/toggle", methods=["POST"])
@admin_required
def toggle_document_type_field(type_id, field_id):
    is_active = request.form.get("is_active") == "1"
    try:
        set_field_definition_active(g.db, field_id, is_active)
    except ValueError as exc:
        flash(str(exc), "error")
    return redirect(url_for("admin.document_type_fields", type_id=type_id))


# --- Family relation types ------------------------------------------------------

@admin_bp.route("/family-relation-types", methods=["GET", "POST"])
@admin_required
def family_relation_types():
    if request.method == "POST":
        try:
            create_family_relation_type(g.db, request.form.get("code", ""), request.form.get("name", ""))
            flash("Family relation type added.", "success")
        except ValueError as exc:
            flash(str(exc), "error")
        return redirect(url_for("admin.family_relation_types"))

    types = list_family_relation_types(g.db)
    return render_template("admin/family_relation_types.html", relation_types=types)


@admin_bp.route("/family-relation-types/<int:type_id>/update", methods=["POST"])
@admin_required
def update_family_relation_type(type_id):
    try:
        update_family_relation_type_name(g.db, type_id, request.form.get("name", ""))
        flash("Family relation type updated.", "success")
    except ValueError as exc:
        flash(str(exc), "error")
    return redirect(url_for("admin.family_relation_types"))


@admin_bp.route("/family-relation-types/<int:type_id>/toggle", methods=["POST"])
@admin_required
def toggle_family_relation_type(type_id):
    is_active = request.form.get("is_active") == "1"
    try:
        set_family_relation_type_active(g.db, type_id, is_active)
    except ValueError as exc:
        flash(str(exc), "error")
    return redirect(url_for("admin.family_relation_types"))
