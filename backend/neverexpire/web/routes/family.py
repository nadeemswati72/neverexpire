from datetime import datetime

from flask import Blueprint, g, jsonify, request
from sqlalchemy.orm import joinedload

from ...db.accounts import add_family_member
from ...db.models import FamilyRelationType, Person, PersonRelationship
from ...db.queries import get_persons_for_user
from ...db.session import get_session
from ..jwt_utils import jwt_required
from ..serializers import person_brief, person_detail

family_bp = Blueprint("family", __name__)


def _parse_dob(value: str | None):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def _owned_by_user(session, person_id: int, user_id: int) -> Person | None:
    p = session.get(Person, person_id)
    if p and p.user_id == user_id and p.is_active:
        return p
    return None


@family_bp.get("/api/v1/family")
@jwt_required
def list_family():
    with get_session() as session:
        persons = get_persons_for_user(session, g.current_user_id)

        # Build relation_type lookup: person_id → code
        primary = next((p for p in persons if p.is_primary), None)
        relation_map: dict[int, str] = {}
        if primary:
            rels = (
                session.query(PersonRelationship)
                .options(joinedload(PersonRelationship.relation_type))
                .filter_by(person_id=primary.id)
                .all()
            )
            for r in rels:
                if r.relation_type:
                    relation_map[r.related_person_id] = r.relation_type.code

        def _brief(p):
            d = person_brief(p)
            d["relation_type"] = "SELF" if p.is_primary else relation_map.get(p.id, "OTHER")
            return d

        return jsonify({"data": [_brief(p) for p in persons], "error": None})


@family_bp.post("/api/v1/family")
@jwt_required
def add_member():
    body = request.get_json(silent=True) or {}
    full_name = body.get("full_name", "").strip()
    relation_type_code = body.get("relation_type", "OTHER").strip().upper()
    dob = _parse_dob(body.get("date_of_birth"))

    if not full_name:
        return jsonify({"data": None, "error": "full_name is required"}), 400

    with get_session() as session:
        primary = (
            session.query(Person)
            .filter_by(user_id=g.current_user_id, is_primary=True)
            .first()
        )
        if primary is None:
            return jsonify({"data": None, "error": "Primary person not found"}), 404

        try:
            member, _ = add_family_member(session, primary.id, full_name, relation_type_code, dob)
            return jsonify({"data": person_brief(member), "error": None}), 201
        except ValueError as e:
            return jsonify({"data": None, "error": str(e)}), 400


@family_bp.get("/api/v1/family/<int:person_id>")
@jwt_required
def get_member(person_id: int):
    with get_session() as session:
        person = _owned_by_user(session, person_id, g.current_user_id)
        if person is None:
            return jsonify({"data": None, "error": "Not found"}), 404

        relations = (
            session.query(PersonRelationship)
            .options(
                joinedload(PersonRelationship.related_person),
                joinedload(PersonRelationship.relation_type),
            )
            .filter_by(person_id=person.id)
            .all()
        )
        return jsonify({"data": person_detail(person, relations), "error": None})


@family_bp.put("/api/v1/family/<int:person_id>")
@jwt_required
def update_member(person_id: int):
    body = request.get_json(silent=True) or {}
    with get_session() as session:
        person = _owned_by_user(session, person_id, g.current_user_id)
        if person is None:
            return jsonify({"data": None, "error": "Not found"}), 404

        if "full_name" in body and body["full_name"].strip():
            person.full_name = body["full_name"].strip()
        if "date_of_birth" in body:
            person.date_of_birth = _parse_dob(body["date_of_birth"])

        # Update relation type on the relationship record
        if "relation_type" in body and not person.is_primary:
            new_code = body["relation_type"].strip().upper()
            rel_type = session.query(FamilyRelationType).filter_by(code=new_code).first()
            if rel_type:
                primary = (
                    session.query(Person)
                    .filter_by(user_id=g.current_user_id, is_primary=True)
                    .first()
                )
                if primary:
                    rel = (
                        session.query(PersonRelationship)
                        .filter_by(person_id=primary.id, related_person_id=person.id)
                        .first()
                    )
                    if rel:
                        rel.relation_type_id = rel_type.id

        session.commit()

        # Return with updated relation_type
        primary = session.query(Person).filter_by(user_id=g.current_user_id, is_primary=True).first()
        relation_code = "OTHER"
        if primary:
            rel = session.query(PersonRelationship).options(
                joinedload(PersonRelationship.relation_type)
            ).filter_by(person_id=primary.id, related_person_id=person.id).first()
            if rel and rel.relation_type:
                relation_code = rel.relation_type.code
        brief = person_brief(person)
        brief["relation_type"] = relation_code
        return jsonify({"data": brief, "error": None})


@family_bp.delete("/api/v1/family/<int:person_id>")
@jwt_required
def delete_member(person_id: int):
    with get_session() as session:
        person = _owned_by_user(session, person_id, g.current_user_id)
        if person is None:
            return jsonify({"data": None, "error": "Not found"}), 404
        if person.is_primary:
            return jsonify({"data": None, "error": "Cannot delete primary account holder"}), 400

        person.is_active = False
        session.commit()
        return jsonify({"data": {"deleted": True}, "error": None})


@family_bp.get("/api/v1/family/relation-types")
@jwt_required
def list_relation_types():
    with get_session() as session:
        types = session.query(FamilyRelationType).order_by(FamilyRelationType.name).all()
        return jsonify({
            "data": [{"code": t.code, "name": t.name} for t in types],
            "error": None,
        })
