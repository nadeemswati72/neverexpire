"""Mock email service for PoC - logs emails to console and file."""

from datetime import datetime
from pathlib import Path


class MockEmailService:
    """Mock email service that logs to console and file."""

    LOG_FILE = Path(__file__).parent.parent / "data" / "mock_emails.log"

    @staticmethod
    def _ensure_log_file():
        """Ensure log file exists."""
        MockEmailService.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        if not MockEmailService.LOG_FILE.exists():
            MockEmailService.LOG_FILE.touch()

    @staticmethod
    def send_share_notification(
        recipient_email: str,
        shared_by: str,
        document_or_person: str,
        is_person: bool = False,
        permission_level: str = "read",
        is_invite: bool = False,
    ):
        """Send mock email notification for document/person share."""
        MockEmailService._ensure_log_file()

        doc_type = "person's documents" if is_person else "document"
        status = "invitation" if is_invite else "access grant"

        subject = f"Document Shared With You" if not is_person else f"Documents Shared With You"

        body = f"""
Hello,

{shared_by} has shared a {doc_type} ({document_or_person}) with you.

Sharing Details:
- Recipient: {recipient_email}
- Shared by: {shared_by}
- {doc_type.capitalize()}: {document_or_person}
- Permission Level: {permission_level.upper()}
- Status: {'Pending Acceptance' if is_invite else 'Active'}
- Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Log in to your account to view and manage this {status}.

---
NeverExpire Team
"""

        log_entry = f"""
[MOCK EMAIL - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]
TO: {recipient_email}
SUBJECT: {subject}
FROM: noreply@neverexpire.test
{body}
{'=' * 80}

"""

        # Log to console
        print(log_entry)

        # Log to file
        with open(MockEmailService.LOG_FILE, "a") as f:
            f.write(log_entry)

    @staticmethod
    def send_revoke_notification(
        recipient_email: str,
        revoked_by: str,
        document_or_person: str,
        is_person: bool = False,
    ):
        """Send mock email notification for revoked access."""
        MockEmailService._ensure_log_file()

        doc_type = "person's documents" if is_person else "document"

        body = f"""
Hello,

{revoked_by} has revoked your access to {document_or_person}.

Details:
- {doc_type.capitalize()}: {document_or_person}
- Revoked by: {revoked_by}
- Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

You will no longer be able to access this {doc_type}.

---
NeverExpire Team
"""

        log_entry = f"""
[MOCK EMAIL - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]
TO: {recipient_email}
SUBJECT: Access Revoked
FROM: noreply@neverexpire.test
{body}
{'=' * 80}

"""

        # Log to console
        print(log_entry)

        # Log to file
        with open(MockEmailService.LOG_FILE, "a") as f:
            f.write(log_entry)
