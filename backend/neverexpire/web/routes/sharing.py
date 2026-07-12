"""
API routes for document and person sharing.
"""

from datetime import datetime, timedelta

from flask import Blueprint, g, jsonify, request

from ...db.models import DocumentShare, Notification, PersonShareGrant
from ...db.session import get_session
from ...db.sharing import (
    can_user_access_document,
    get_document_shares,
    get_user_sharing_recipients,
    revoke_document_share,
    revoke_person_share,
    respond_to_share_invite,
    share_document,
    share_document_by_email,
    share_person_all,
    share_person_all_by_email,
)
from ...email_service import MockEmailService
from ..jwt_utils import jwt_required

sharing_bp = Blueprint("sharing", __name__)


def _compute_expires_at(body: dict) -> datetime | None:
    """Parse an optional `expires_in_days` field (e.g. 7, 30) into a UTC deadline."""
    days = body.get("expires_in_days")
    if not days:
        return None
    try:
        days = int(days)
    except (TypeError, ValueError):
        return None
    if days <= 0:
        return None
    return datetime.utcnow() + timedelta(days=days)


@sharing_bp.post("/api/v1/documents/<int:doc_id>/share")
@jwt_required
def share_doc(doc_id: int):
    """Share a document with another user by email."""
    body = request.get_json(silent=True) or {}
    recipient_email = body.get("recipient_email")
    permission_level = body.get("permission_level", "read")
    is_invite = body.get("is_invite", False)
    expires_at = _compute_expires_at(body)

    if not recipient_email or permission_level not in ("read", "edit", "download"):
        return jsonify({"data": None, "error": "Email and permission_level are required"}), 400

    with get_session() as session:
        # Owner can always share; a shared user needs 'edit' permission to re-share
        from ...db.queries import get_document
        doc = get_document(session, doc_id)
        if not doc:
            return jsonify({"data": None, "error": "Document not found"}), 404

        is_owner = doc.person.user_id == g.current_user_id
        if not is_owner and not can_user_access_document(session, g.current_user_id, doc_id, "edit"):
            return jsonify({"data": None, "error": "Document not found"}), 404

        # Share by email
        result = share_document_by_email(
            session,
            document_id=doc_id,
            shared_by_user_id=g.current_user_id,
            recipient_email=recipient_email,
            permission_level=permission_level,
            is_invite=is_invite,
            expires_at=expires_at,
        )

        if not result["success"]:
            return jsonify({"data": None, "error": result["message"]}), 400

        share = session.query(DocumentShare).filter_by(id=result["share_id"]).first()
        return jsonify({
            "data": {
                "id": share.id,
                "document_id": share.document_id,
                "shared_with_user_id": share.shared_with_user_id,
                "permission_level": share.permission_level,
                "is_invite": share.is_invite,
                "response": share.response,
                "expires_at": share.expires_at.isoformat() if share.expires_at else None,
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

        # Document owner can revoke any share; a re-sharer can revoke shares they created
        from ...db.queries import get_document, get_user_by_email
        from ...db.models import User

        doc = get_document(session, share.document_id)
        is_owner = doc and doc.person.user_id == g.current_user_id
        is_resharer = share.shared_by_user_id == g.current_user_id
        if not doc or not (is_owner or is_resharer):
            return jsonify({"data": None, "error": "Unauthorized"}), 403

        # Get recipient email for notification
        recipient = session.query(User).filter_by(id=share.shared_with_user_id).first()
        shared_by_user = session.query(User).filter_by(id=g.current_user_id).first()

        revoke_document_share(session, share_id)

        # Send mock revoke email
        if recipient and shared_by_user:
            MockEmailService.send_revoke_notification(
                recipient_email=recipient.email,
                revoked_by=shared_by_user.email,
                document_or_person=doc.title,
                is_person=False,
            )
            session.add(Notification(
                user_id=recipient.id,
                message=f"{shared_by_user.email} revoked your access to \"{doc.title}\"",
            ))
            session.commit()

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
    """Share all documents for a person with another user by email."""
    body = request.get_json(silent=True) or {}
    recipient_email = body.get("recipient_email")
    permission_level = body.get("permission_level", "read")
    include_future = body.get("include_future", False)
    is_invite = body.get("is_invite", False)
    expires_at = _compute_expires_at(body)

    if not recipient_email or permission_level not in ("read", "edit", "download"):
        return jsonify({"data": None, "error": "Email and permission_level are required"}), 400

    with get_session() as session:
        from ...db.queries import get_person
        person = get_person(session, person_id)
        if not person or person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Person not found"}), 404

        # Share by email
        result = share_person_all_by_email(
            session,
            person_id=person_id,
            granted_by_user_id=g.current_user_id,
            recipient_email=recipient_email,
            permission_level=permission_level,
            include_future=include_future,
            is_invite=is_invite,
            expires_at=expires_at,
        )

        if not result["success"]:
            return jsonify({"data": None, "error": result["message"]}), 400

        grant = session.query(PersonShareGrant).filter_by(id=result["grant_id"]).first()
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
        from ...db.models import User

        person = get_person(session, grant.person_id)
        if not person or person.user_id != g.current_user_id:
            return jsonify({"data": None, "error": "Unauthorized"}), 403

        # Get recipient email for notification
        recipient = session.query(User).filter_by(id=grant.granted_to_user_id).first()
        shared_by_user = session.query(User).filter_by(id=g.current_user_id).first()

        revoke_person_share(session, grant_id)

        # Send mock revoke email
        if recipient and shared_by_user:
            MockEmailService.send_revoke_notification(
                recipient_email=recipient.email,
                revoked_by=shared_by_user.email,
                document_or_person=f"{person.full_name}'s documents",
                is_person=True,
            )
            session.add(Notification(
                user_id=recipient.id,
                message=f"{shared_by_user.email} revoked your access to {person.full_name}'s documents",
            ))
            session.commit()

        return jsonify({"data": {"revoked": True}, "error": None})


@sharing_bp.get("/api/v1/sharing/incoming")
@jwt_required
def get_incoming_shares():
    """Get documents shared with me."""
    with get_session() as session:
        from ...db.models import User
        from ...db.queries import get_document

        # Get direct document shares
        shares = (
            session.query(DocumentShare)
            .filter(DocumentShare.shared_with_user_id == g.current_user_id, DocumentShare.revoked_at.is_(None))
            .all()
        )

        data = []
        for share in shares:
            doc = get_document(session, share.document_id)
            shared_by = session.query(User).filter_by(id=share.shared_by_user_id).first()
            if doc and shared_by:
                data.append({
                    "share_id": share.id,
                    "document_id": doc.id,
                    "document_title": doc.title,
                    "shared_by_email": shared_by.email,
                    "permission_level": share.permission_level,
                    "is_invite": share.is_invite,
                    "response": share.response,
                    "created_at": share.created_at.isoformat() if share.created_at else None,
                    "expires_at": share.expires_at.isoformat() if share.expires_at else None,
                    "is_expired": bool(share.expires_at and share.expires_at <= datetime.utcnow()),
                })

        return jsonify({"data": data, "error": None})


@sharing_bp.get("/api/v1/sharing/outgoing")
@jwt_required
def get_outgoing_shares():
    """Get documents I've shared with others."""
    with get_session() as session:
        from ...db.models import User
        from ...db.queries import get_document

        # Get direct document shares created by current user
        shares = (
            session.query(DocumentShare)
            .filter(DocumentShare.shared_by_user_id == g.current_user_id, DocumentShare.revoked_at.is_(None))
            .all()
        )

        data = []
        for share in shares:
            doc = get_document(session, share.document_id)
            recipient = session.query(User).filter_by(id=share.shared_with_user_id).first()
            if doc and recipient:
                data.append({
                    "share_id": share.id,
                    "document_id": doc.id,
                    "document_title": doc.title,
                    "shared_with_email": recipient.email,
                    "permission_level": share.permission_level,
                    "is_invite": share.is_invite,
                    "response": share.response,
                    "created_at": share.created_at.isoformat() if share.created_at else None,
                    "expires_at": share.expires_at.isoformat() if share.expires_at else None,
                    "is_expired": bool(share.expires_at and share.expires_at <= datetime.utcnow()),
                })

        return jsonify({"data": data, "error": None})


@sharing_bp.get("/api/v1/sharing/recipients")
@jwt_required
def get_sharing_recipients():
    """Get all people I've shared documents with."""
    with get_session() as session:
        recipients = get_user_sharing_recipients(session, g.current_user_id)
        return jsonify({"data": recipients, "error": None})
