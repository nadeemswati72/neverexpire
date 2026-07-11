"""
API routes for document and person sharing.
"""

from flask import Blueprint, g, jsonify, request

from ...db.models import DocumentShare, PersonShareGrant
from ...db.session import get_session
from ...db.sharing import (
    can_user_access_document,
    get_document_shares,
    revoke_document_share,
    revoke_person_share,
    respond_to_share_invite,
    share_document,
    share_person_all,
)
from ..jwt_utils import jwt_required

sharing_bp = Blueprint("sharing", __name__)


@sharing_bp.post("/api/v1/documents/<int:doc_id>/share")
@jwt_required
def share_doc(doc_id: int):
    """Share a document with another user."""
    body = request.get_json(silent=True) or {}
    shared_with_user_id = body.get("shared_with_user_id")
    permission_level = body.get("permission_level", "read")
    is_invite = body.get("is_invite", False)

    if not shared_with_user_id or permission_level not in ("read", "edit", "download"):
        return jsonify({"data": None, "error": "Invalid parameters"}), 400

    with get_session() as session:
        # Check that current user owns the document
        from ...db.queries import get_document
        doc = get_document(session, doc_id)
        if not doc or doc.person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Document not found"}), 404

        # Create share
        share = share_document(
            session,
            document_id=doc_id,
            shared_by_user_id=g.current_user_id,
            shared_with_user_id=shared_with_user_id,
            permission_level=permission_level,
            is_invite=is_invite,
        )

        return jsonify({
            "data": {
                "id": share.id,
                "document_id": share.document_id,
                "shared_with_user_id": share.shared_with_user_id,
                "permission_level": share.permission_level,
                "is_invite": share.is_invite,
                "response": share.response,
            },
            "error": None,
        }), 201


@sharing_bp.get("/api/v1/documents/<int:doc_id>/shares")
@jwt_required
def list_doc_shares(doc_id: int):
    """List all shares for a document."""
    with get_session() as session:
        from ...db.queries import get_document
        doc = get_document(session, doc_id)
        if not doc or doc.person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Document not found"}), 404

        shares = get_document_shares(session, doc_id)
        return jsonify({
            "data": [
                {
                    "id": s.id,
                    "shared_with_user_id": s.shared_with_user_id,
                    "permission_level": s.permission_level,
                    "is_invite": s.is_invite,
                    "response": s.response,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in shares
            ],
            "error": None,
        })


@sharing_bp.delete("/api/v1/shares/<int:share_id>")
@jwt_required
def revoke_share(share_id: int):
    """Revoke a document share."""
    with get_session() as session:
        share = session.query(DocumentShare).filter_by(id=share_id).first()
        if not share:
            return jsonify({"data": None, "error": "Share not found"}), 404

        # Check ownership
        from ...db.queries import get_document
        doc = get_document(session, share.document_id)
        if not doc or doc.person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Unauthorized"}), 403

        revoke_document_share(session, share_id)
        return jsonify({"data": {"revoked": True}, "error": None})


@sharing_bp.put("/api/v1/shares/<int:share_id>/respond")
@jwt_required
def respond_share(share_id: int):
    """Accept or decline a share invite."""
    body = request.get_json(silent=True) or {}
    response = body.get("response")

    if response not in ("accepted", "declined"):
        return jsonify({"data": None, "error": "Invalid response"}), 400

    with get_session() as session:
        share = session.query(DocumentShare).filter_by(id=share_id).first()
        if not share or share.shared_with_user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Share not found"}), 404

        respond_to_share_invite(session, share_id, response)
        return jsonify({
            "data": {
                "id": share.id,
                "response": response,
                "responded_at": share.responded_at.isoformat() if share.responded_at else None,
            },
            "error": None,
        })


@sharing_bp.post("/api/v1/persons/<int:person_id>/share-all")
@jwt_required
def share_all_docs(person_id: int):
    """Share all documents for a person with another user."""
    body = request.get_json(silent=True) or {}
    granted_to_user_id = body.get("granted_to_user_id")
    permission_level = body.get("permission_level", "read")
    include_future = body.get("include_future", False)
    is_invite = body.get("is_invite", False)

    if not granted_to_user_id or permission_level not in ("read", "edit", "download"):
        return jsonify({"data": None, "error": "Invalid parameters"}), 400

    with get_session() as session:
        from ...db.queries import get_person
        person = get_person(session, person_id)
        if not person or person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Person not found"}), 404

        grant = share_person_all(
            session,
            person_id=person_id,
            granted_by_user_id=g.current_user_id,
            granted_to_user_id=granted_to_user_id,
            permission_level=permission_level,
            include_future=include_future,
            is_invite=is_invite,
        )

        return jsonify({
            "data": {
                "id": grant.id,
                "person_id": grant.person_id,
                "granted_to_user_id": grant.granted_to_user_id,
                "permission_level": grant.permission_level,
                "include_future": grant.include_future,
                "is_invite": grant.is_invite,
            },
            "error": None,
        }), 201


@sharing_bp.delete("/api/v1/share-grants/<int:grant_id>")
@jwt_required
def revoke_person_share_grant(grant_id: int):
    """Revoke a person bulk share grant."""
    with get_session() as session:
        grant = session.query(PersonShareGrant).filter_by(id=grant_id).first()
        if not grant:
            return jsonify({"data": None, "error": "Grant not found"}), 404

        # Check ownership
        from ...db.queries import get_person
        person = get_person(session, grant.person_id)
        if not person or person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Unauthorized"}), 403

        revoke_person_share(session, grant_id)
        return jsonify({"data": {"revoked": True}, "error": None})
