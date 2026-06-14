from datetime import date, timedelta

from flask import Blueprint, abort, flash, g, redirect, render_template, request, url_for

from ... import config
from ...db.accounts import add_family_member, set_person_photo
from ...db.models import FamilyRelationType, Person
from ...db.queries import get_documents_for_person, get_persons_for_user
from ...db.repository import parse_date
from ..auth import current_user, login_required

family_bp = Blueprint("family", __name__, url_prefix="/family")


@family_bp.route("/")
@login_required
def list_family():
    user = current_user()
    persons = get_persons_for_user(g.db, user.id)
    return render_template("family/list.html", persons=persons)


@family_bp.route("/<int:person_id>")
@login_required
def person_detail(person_id):
    user = current_user()
    person = g.db.get(Person, person_id)
    if person is None or person.user_id != user.id:
        abort(404)

    documents = get_documents_for_person(g.db, person_id)
    today = date.today()
    soon_cutoff = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)
    return render_template(
        "family/detail.html", person=person, documents=documents, today=today, soon_cutoff=soon_cutoff
    )


@family_bp.route("/add", methods=["GET", "POST"])
@login_required
def add_family():
    user = current_user()
    relation_types = (
        g.db.query(FamilyRelationType)
        .filter(FamilyRelationType.is_active.is_(True), FamilyRelationType.code != "SELF")
        .order_by(FamilyRelationType.name)
        .all()
    )

    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        relation_type_code = request.form.get("relation_type_code", "")
        date_of_birth = parse_date(request.form.get("date_of_birth") or None)

        if not full_name or not relation_type_code:
            flash("Name and relation are required.", "error")
            return render_template("family/add.html", relation_types=relation_types)

        owner = next((p for p in get_persons_for_user(g.db, user.id) if p.is_primary), None)
        if owner is None:
            abort(500)

        try:
            member, _ = add_family_member(g.db, owner.id, full_name, relation_type_code, date_of_birth)
        except ValueError as exc:
            flash(str(exc), "error")
            return render_template("family/add.html", relation_types=relation_types)

        photo = request.files.get("photo")
        if photo and photo.filename:
            try:
                set_person_photo(g.db, member, photo)
            except ValueError as exc:
                flash(str(exc), "error")

        flash("Family member added.", "success")
        return redirect(url_for("family.list_family"))

    return render_template("family/add.html", relation_types=relation_types)


@family_bp.route("/<int:person_id>/photo", methods=["POST"])
@login_required
def upload_photo(person_id):
    user = current_user()
    person = g.db.get(Person, person_id)
    if person is None or person.user_id != user.id:
        abort(404)

    file = request.files.get("photo")
    if file is None or file.filename == "":
        flash("Please choose an image to upload.", "error")
        return redirect(url_for("family.person_detail", person_id=person.id))

    try:
        set_person_photo(g.db, person, file)
    except ValueError as exc:
        flash(str(exc), "error")
        return redirect(url_for("family.person_detail", person_id=person.id))

    flash("Photo updated.", "success")
    return redirect(url_for("family.person_detail", person_id=person.id))
