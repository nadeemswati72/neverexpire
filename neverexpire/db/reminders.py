from datetime import date, timedelta

from sqlalchemy.orm import Session

from .base import utcnow
from .models import Document, DocumentReminder, ReminderRule


def generate_due_reminders(session: Session, today: date | None = None) -> list[DocumentReminder]:
    today = today or date.today()

    rules = session.query(ReminderRule).filter_by(is_active=True).all()
    documents = (
        session.query(Document)
        .filter(Document.status == "active", Document.expiry_date.isnot(None))
        .all()
    )

    created: list[DocumentReminder] = []
    for document in documents:
        for rule in rules:
            due_date = document.expiry_date - timedelta(days=rule.threshold_days)
            if due_date > today:
                continue

            exists = (
                session.query(DocumentReminder)
                .filter_by(document_id=document.id, reminder_rule_id=rule.id)
                .first()
            )
            if exists is not None:
                continue

            reminder = DocumentReminder(
                document_id=document.id,
                reminder_rule_id=rule.id,
                due_date=due_date,
                status="pending",
            )
            session.add(reminder)
            created.append(reminder)

    session.commit()
    return created


def dispatch_pending_reminders(session: Session, today: date | None = None) -> list[DocumentReminder]:
    today = today or date.today()

    pending = (
        session.query(DocumentReminder)
        .filter(DocumentReminder.status == "pending", DocumentReminder.due_date <= today)
        .all()
    )

    for reminder in pending:
        reminder.status = "sent"
        reminder.sent_at = utcnow()

    session.commit()
    return pending
