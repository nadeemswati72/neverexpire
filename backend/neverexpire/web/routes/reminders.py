"""API routes for the Reminders page: list a user's family's reminders and dismiss them."""

from datetime import date

from flask import Blueprint, g, jsonify
from sqlalchemy.orm import joinedload

from ...db.models import Document, DocumentReminder, Person
from ...db.session import get_session
from ..jwt_utils import jwt_required

reminders_bp = Blueprint("reminders", __name__)


@reminders_bp.get("/api/v1/reminders")
@jwt_required
def list_reminders():
    """Reminders for documents owned by the current user's family, newest-due first."""
    today = date.today()
    with get_session() as session:
        rows = (
            session.query(DocumentReminder)
            .join(DocumentReminder.document)
            .join(Document.person)
            .options(
                joinedload(DocumentReminder.document).joinedload(Document.person),
                joinedload(DocumentReminder.reminder_rule),
            )
            .filter(Person.user_id == g.current_user_id, DocumentReminder.status != "dismissed")
            .order_by(DocumentReminder.due_date.asc())
            .all()
        )

        data = []
        for r in rows:
            doc = r.document
            person = doc.person
            days_remaining = (doc.expiry_date - today).days if doc.expiry_date else None
            data.append({
                "id": r.id,
                "document_id": doc.id,
                "document_title": doc.title,
                "person_name": person.full_name if person else "Unknown",
                "threshold_days": r.reminder_rule.threshold_days,
                "rule_name": r.reminder_rule.name,
                "due_date": r.due_date.isoformat() if r.due_date else None,
                "expiry_date": doc.expiry_date.isoformat() if doc.expiry_date else None,
                "days_remaining": days_remaining,
                "status": r.status,
                "sent_at": r.sent_at.isoformat() if r.sent_at else None,
            })

        return jsonify({"data": data, "error": None})


@reminders_bp.put("/api/v1/reminders/<int:reminder_id>/dismiss")
@jwt_required
def dismiss_reminder(reminder_id: int):
    """Dismiss a reminder without waiting for the next digest email."""
    with get_session() as session:
        reminder = (
            session.query(DocumentReminder)
            .join(DocumentReminder.document)
            .join(Document.person)
            .filter(DocumentReminder.id == reminder_id, Person.user_id == g.current_user_id)
            .first()
        )
        if reminder is None:
            return jsonify({"data": None, "error": "Not found"}), 404

        reminder.status = "dismissed"
        session.commit()
        return jsonify({"data": {"id": reminder.id, "status": "dismissed"}, "error": None})
