"""Orchestrates the reminder check: find due reminders, email a digest, mark them sent."""
from datetime import date

from sqlalchemy.orm import Session, joinedload

from . import config
from .db.base import utcnow
from .db.models import Document, DocumentReminder, Person, User
from .db.reminders import generate_due_reminders
from .reminder_email import ReminderItem, build_digest, send_email


def run_reminder_check(session: Session, today: date | None = None) -> dict:
    """
    Generate any newly-due reminders, email a single digest covering all pending
    reminders due today-or-earlier, and mark only the successfully-emailed ones
    as sent. Returns a summary dict for logging / the admin trigger endpoint.
    """
    today = today or date.today()

    generate_due_reminders(session, today)

    pending = (
        session.query(DocumentReminder)
        .options(
            joinedload(DocumentReminder.document).joinedload(Document.person),
            joinedload(DocumentReminder.reminder_rule),
        )
        .filter(DocumentReminder.status == "pending", DocumentReminder.due_date <= today)
        .all()
    )

    if not pending:
        return {"checked_at": today.isoformat(), "count": 0, "sent": False}

    items = []
    for reminder in pending:
        doc = reminder.document
        person = doc.person
        owner = session.get(User, person.user_id) if person else None
        items.append(ReminderItem(
            document_title=doc.title,
            person_name=person.full_name if person else "Unknown",
            owner_email=owner.email if owner else "unknown",
            expiry_date=doc.expiry_date,
            threshold_days=reminder.reminder_rule.threshold_days,
            days_remaining=(doc.expiry_date - today).days,
        ))

    subject, html_body, text_body = build_digest(items)

    recipient = config.REMINDER_TEST_RECIPIENT
    if not recipient:
        return {"checked_at": today.isoformat(), "count": len(pending), "sent": False, "error": "No recipient configured"}

    try:
        send_email(recipient, subject, html_body, text_body)
    except Exception as exc:
        return {"checked_at": today.isoformat(), "count": len(pending), "sent": False, "error": str(exc)}

    for reminder in pending:
        reminder.status = "sent"
        reminder.sent_at = utcnow()
    session.commit()

    return {"checked_at": today.isoformat(), "count": len(pending), "sent": True, "recipient": recipient}
