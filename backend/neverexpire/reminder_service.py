"""Orchestrates the reminder check: find due reminders, email each family its own digest, mark them sent."""
from collections import defaultdict
from datetime import date

from sqlalchemy.orm import Session, joinedload

from . import config
from .db.base import utcnow
from .db.models import Document, DocumentReminder, Person, User
from .db.reminders import generate_due_reminders
from .email_service import MockEmailService
from .reminder_email import ReminderItem, build_digest, send_email

# Seeded demo accounts use this fake domain and can't receive real email —
# their digest is redirected to the test inbox instead. Any other domain is
# a real family's real address and is emailed directly.
_DEMO_EMAIL_DOMAIN = "@neverexpire.test"


def run_reminder_check(session: Session, today: date | None = None, user_id: int | None = None) -> dict:
    """
    Generate any newly-due reminders, email each family its own digest at its
    own real address, and mark only the successfully-emailed ones as sent.
    Returns a summary dict for logging / the admin trigger endpoint.

    When `user_id` is given (the manual "Send Now" button on the Reminders
    page), only that user's own family is considered. The unscoped daily
    scheduled job (user_id=None) considers every account, but still sends
    one digest per family — never bundled together.
    """
    today = today or date.today()

    generate_due_reminders(session, today)

    query = (
        session.query(DocumentReminder)
        .options(
            joinedload(DocumentReminder.document).joinedload(Document.person),
            joinedload(DocumentReminder.reminder_rule),
        )
        .filter(DocumentReminder.status == "pending", DocumentReminder.due_date <= today)
    )
    if user_id is not None:
        query = query.join(DocumentReminder.document).join(Document.person).filter(Person.user_id == user_id)
    pending = query.all()

    if not pending:
        return {"checked_at": today.isoformat(), "count": 0, "sent": False}

    by_owner: dict[int, list[DocumentReminder]] = defaultdict(list)
    for reminder in pending:
        person = reminder.document.person
        if person:
            by_owner[person.user_id].append(reminder)

    test_recipient = config.REMINDER_TEST_RECIPIENT
    families_sent = 0
    last_error = None

    for owner_user_id, reminders in by_owner.items():
        owner = session.get(User, owner_user_id)
        if not owner:
            continue

        items = [
            ReminderItem(
                document_title=r.document.title,
                person_name=r.document.person.full_name if r.document.person else "Unknown",
                owner_email=owner.email,
                expiry_date=r.document.expiry_date,
                threshold_days=r.reminder_rule.threshold_days,
                days_remaining=(r.document.expiry_date - today).days,
            )
            for r in reminders
        ]

        is_demo_account = owner.email.lower().endswith(_DEMO_EMAIL_DOMAIN)
        recipient = test_recipient if is_demo_account else owner.email
        if not recipient:
            last_error = "No recipient configured"
            continue

        subject, html_body, text_body = build_digest(items, redirected=is_demo_account)

        try:
            send_email(recipient, subject, html_body, text_body)
        except Exception as exc:
            last_error = str(exc)
            continue

        MockEmailService.log_reminder_digest(owner.email, subject, text_body)

        for reminder in reminders:
            reminder.status = "sent"
            reminder.sent_at = utcnow()
        families_sent += 1

    session.commit()

    return {
        "checked_at": today.isoformat(),
        "count": len(pending),
        "families_sent": families_sent,
        "sent": families_sent > 0,
        "error": last_error if families_sent == 0 else None,
    }
