from flask import Blueprint, g, jsonify

from ...db.models import Notification
from ...db.session import get_session
from ..jwt_utils import jwt_required

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("/api/v1/notifications")
@jwt_required
def list_notifications():
    with get_session() as session:
        entries = (
            session.query(Notification)
            .filter_by(user_id=g.current_user_id)
            .order_by(Notification.created_at.desc())
            .limit(30)
            .all()
        )
        unread_count = (
            session.query(Notification)
            .filter_by(user_id=g.current_user_id, is_read=False)
            .count()
        )
        return jsonify({
            "data": {
                "unread_count": unread_count,
                "notifications": [
                    {
                        "id": n.id,
                        "message": n.message,
                        "document_id": n.document_id,
                        "is_read": n.is_read,
                        "created_at": n.created_at.isoformat() if n.created_at else None,
                    }
                    for n in entries
                ],
            },
            "error": None,
        })


@notifications_bp.put("/api/v1/notifications/<int:notification_id>/read")
@jwt_required
def mark_read(notification_id: int):
    with get_session() as session:
        entry = session.query(Notification).filter_by(
            id=notification_id, user_id=g.current_user_id
        ).first()
        if not entry:
            return jsonify({"data": None, "error": "Not found"}), 404
        entry.is_read = True
        session.commit()
        return jsonify({"data": {"marked_read": True}, "error": None})


@notifications_bp.put("/api/v1/notifications/read-all")
@jwt_required
def mark_all_read():
    with get_session() as session:
        session.query(Notification).filter_by(
            user_id=g.current_user_id, is_read=False
        ).update({"is_read": True})
        session.commit()
        return jsonify({"data": {"marked_read": True}, "error": None})
