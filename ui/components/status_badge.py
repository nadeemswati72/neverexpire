"""Helpers for classifying and describing a document's expiry status."""

from datetime import date
from typing import Literal

StatusKey = Literal["expired", "expiring_soon", "valid", "no_expiry"]

# A document is considered "expiring soon" once it is within this many days
# of its expiry date (and has not expired yet).
EXPIRING_SOON_THRESHOLD_DAYS = 90

STATUS_META: dict[StatusKey, dict[str, str]] = {
    "expired": {"label": "Needs Attention", "emoji": "🔴", "color": "#E53E3E"},
    "expiring_soon": {"label": "Expiring Soon", "emoji": "🟡", "color": "#ED8936"},
    "valid": {"label": "All Good", "emoji": "🟢", "color": "#38A169"},
    "no_expiry": {"label": "No Expiry", "emoji": "⚪", "color": "#718096"},
}


def get_status_key(expiry_date: date | None, today: date | None = None) -> StatusKey:
    """Classify a document by its expiry date relative to `today`."""
    if expiry_date is None:
        return "no_expiry"

    today = today or date.today()
    days_remaining = (expiry_date - today).days
    if days_remaining < 0:
        return "expired"
    if days_remaining <= EXPIRING_SOON_THRESHOLD_DAYS:
        return "expiring_soon"
    return "valid"


def get_days_remaining(expiry_date: date | None, today: date | None = None) -> int | None:
    """Return the signed number of days until `expiry_date`, or None if it has no expiry."""
    if expiry_date is None:
        return None

    today = today or date.today()
    return (expiry_date - today).days


def get_status_text(expiry_date: date | None, today: date | None = None) -> str:
    """Return a human-readable description of a document's expiry status."""
    status = get_status_key(expiry_date, today)
    days = get_days_remaining(expiry_date, today)

    if status == "expired":
        return f"Expired {abs(days)} days ago"
    if status == "expiring_soon":
        return f"Expires in {days} days"
    if status == "valid":
        return f"Valid — {days:,} days remaining"
    return "No expiry date"


def get_progress_percentage(
    issue_date: date | None, expiry_date: date | None, today: date | None = None
) -> int:
    """Return 0-100 representing how much of a document's validity period has elapsed."""
    if issue_date is None or expiry_date is None:
        return 0

    today = today or date.today()
    total_days = (expiry_date - issue_date).days
    if total_days <= 0:
        return 100

    elapsed_days = (today - issue_date).days
    percentage = round(elapsed_days / total_days * 100)
    return max(0, min(100, percentage))


def mask_document_number(document_number: str, visible_chars: int = 4) -> str:
    """Mask all but the last `visible_chars` characters of a document number."""
    if len(document_number) <= visible_chars:
        return document_number
    return "*" * 4 + document_number[-visible_chars:]
