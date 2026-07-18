"""
Sharing repository functions for documents and persons.
"""

from datetime import datetime
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..email_service import MockEmailService
from .models import Document, DocumentShare, Notification, Person, PersonShareGrant, User


def share_document(
    session: Session,
    document_id: int,
    shared_by_user_id: int,
    shared_with_user_id: int,
    permission_level: str = "read",
    is_invite: bool = False,
    expires_at: datetime | None = None,
    watermark: bool = True,
) -> DocumentShare:
    """
    Share a document with another user.

    Args:
        session: Database session
        document_id: Document to share
        shared_by_user_id: User sharing the document (must own it)
        shared_with_user_id: User receiving access
        permission_level: 'read', 'edit', or 'download'
        is_invite: If True, requires acceptance; if False, grants immediately
        expires_at: If set, access auto-expires at this time
        watermark: If False, recipient gets the clean original instead of a
            personalized-tagged copy — an explicit owner choice.

    Returns:
        DocumentShare record
    """
    # Check if share already exists
    existing = session.query(DocumentShare).filter_by(
        document_id=document_id,
        shared_with_user_id=shared_with_user_id,
        revoked_at=None,
    ).first()

    if existing:
        # Update existing share
        existing.permission_level = permission_level
        existing.is_invite = is_invite
        existing.responded_at = None
        existing.response = None
        existing.expires_at = expires_at
        existing.watermark = watermark
        session.commit()
        return existing

    # Create new share
    share = DocumentShare(
        document_id=document_id,
        shared_by_user_id=shared_by_user_id,
        shared_with_user_id=shared_with_user_id,
        permission_level=permission_level,
        is_invite=is_invite,
        responded_at=None if is_invite else datetime.utcnow(),
        response="granted" if not is_invite else None,
        expires_at=expires_at,
        watermark=watermark,
    )
    session.add(share)
    session.commit()
    session.refresh(share)
    return share


def revoke_document_share(session: Session, share_id: int) -> bool:
    """Revoke a document share."""
    share = session.query(DocumentShare).filter_by(id=share_id).first()
    if not share:
        return False

    share.revoked_at = datetime.utcnow()
    session.commit()
    return True


def respond_to_share_invite(
    session: Session, share_id: int, response: str
) -> bool:
    """Accept or decline a share invite."""
    if response not in ("accepted", "declined"):
        return False

    share = session.query(DocumentShare).filter_by(id=share_id).first()
    if not share or not share.is_invite:
        return False

    share.responded_at = datetime.utcnow()
    share.response = response
    if response == "declined":
        share.revoked_at = datetime.utcnow()

    session.commit()
    return True


def get_document_shares(session: Session, document_id: int) -> list[DocumentShare]:
    """Get all active (not revoked) shares for a document."""
    return session.query(DocumentShare).filter_by(
        document_id=document_id,
        revoked_at=None,
    ).all()


def get_user_accessible_document_ids(session: Session, user_id: int) -> list[int]:
    """
    Get all document IDs a user can access.

    Includes:
    - Documents they own (via their persons)
    - Documents shared with them (accepted or granted immediately)
    - Documents via person bulk shares

    A single UNION query replaces what used to be 3 separate round-trips —
    each was free on local SQLite but now costs real network latency to
    Neon, and this helper runs on nearly every page load.
    """
    owned = session.query(Document.id).join(Person).filter(
        Person.user_id == user_id
    )

    shared = session.query(DocumentShare.document_id).filter(
        DocumentShare.shared_with_user_id == user_id,
        DocumentShare.revoked_at.is_(None),
        or_(DocumentShare.expires_at.is_(None), DocumentShare.expires_at > datetime.utcnow()),
        or_(
            (DocumentShare.is_invite.is_(True)) & (DocumentShare.response == "accepted"),
            DocumentShare.is_invite.is_(False)
        )
    )

    bulk = (
        session.query(Document.id)
        .join(Person, Document.person_id == Person.id)
        .join(PersonShareGrant, Person.id == PersonShareGrant.person_id)
        .filter(
            PersonShareGrant.granted_to_user_id == user_id,
            PersonShareGrant.revoked_at.is_(None),
            or_(PersonShareGrant.expires_at.is_(None), PersonShareGrant.expires_at > datetime.utcnow()),
            or_(
                (PersonShareGrant.is_invite.is_(True)) & (PersonShareGrant.response == "accepted"),
                PersonShareGrant.is_invite.is_(False)
            )
        )
    )

    rows = owned.union(shared).union(bulk).all()
    return [row[0] for row in rows]


def share_person_all(
    session: Session,
    person_id: int,
    granted_by_user_id: int,
    granted_to_user_id: int,
    permission_level: str = "read",
    include_future: bool = False,
    is_invite: bool = False,
    expires_at: datetime | None = None,
    watermark: bool = True,
) -> PersonShareGrant:
    """Share all documents for a person with another user."""
    grant = PersonShareGrant(
        person_id=person_id,
        granted_by_user_id=granted_by_user_id,
        granted_to_user_id=granted_to_user_id,
        permission_level=permission_level,
        include_future=include_future,
        is_invite=is_invite,
        responded_at=None if is_invite else datetime.utcnow(),
        response="granted" if not is_invite else None,
        expires_at=expires_at,
        watermark=watermark,
    )
    session.add(grant)
    session.commit()
    session.refresh(grant)
    return grant


def revoke_person_share(session: Session, grant_id: int) -> bool:
    """Revoke a person bulk share."""
    grant = session.query(PersonShareGrant).filter_by(id=grant_id).first()
    if not grant:
        return False

    grant.revoked_at = datetime.utcnow()
    session.commit()
    return True


def _not_expired(expires_at: datetime | None) -> bool:
    return expires_at is None or expires_at > datetime.utcnow()


def get_effective_share(session: Session, user_id: int, document_id: int) -> dict | None:
    """
    Return {"permission_level": str, "shared_by_user_id": int, "expires_at": datetime | None}
    for a non-owner's access to a document (direct share takes precedence over a person
    bulk grant), or None if the user has no (non-expired) shared access to it.
    """
    doc = session.query(Document).filter_by(id=document_id).first()
    if not doc:
        return None

    share = session.query(DocumentShare).filter(
        DocumentShare.document_id == document_id,
        DocumentShare.shared_with_user_id == user_id,
        DocumentShare.revoked_at.is_(None)
    ).first()
    if share and _not_expired(share.expires_at):
        return {
            "permission_level": share.permission_level,
            "shared_by_user_id": share.shared_by_user_id,
            "expires_at": share.expires_at,
            "watermark": share.watermark,
        }

    grant = session.query(PersonShareGrant).filter(
        PersonShareGrant.person_id == doc.person_id,
        PersonShareGrant.granted_to_user_id == user_id,
        PersonShareGrant.revoked_at.is_(None)
    ).first()
    if grant and _not_expired(grant.expires_at):
        return {
            "permission_level": grant.permission_level,
            "shared_by_user_id": grant.granted_by_user_id,
            "expires_at": grant.expires_at,
            "watermark": grant.watermark,
        }

    return None


def can_user_access_document(
    session: Session, user_id: int, document_id: int, permission: str = "read"
) -> bool:
    """
    Check if user can access a document with given permission.

    Permission levels:
    - 'read': view document (includes edit/download permissions)
    - 'edit': modify document fields
    - 'download': download original file
    """
    doc = session.query(Document).filter_by(id=document_id).first()
    if not doc:
        return False

    person = session.query(Person).filter_by(id=doc.person_id).first()
    if not person:
        return False

    # Owner has all permissions
    if person.user_id == user_id:
        return True

    # Check direct document share
    share = session.query(DocumentShare).filter(
        DocumentShare.document_id == document_id,
        DocumentShare.shared_with_user_id == user_id,
        DocumentShare.revoked_at.is_(None)
    ).first()

    if share and _not_expired(share.expires_at):
        return has_permission(share.permission_level, permission)

    # Check person bulk share
    grant = session.query(PersonShareGrant).filter(
        PersonShareGrant.person_id == doc.person_id,
        PersonShareGrant.granted_to_user_id == user_id,
        PersonShareGrant.revoked_at.is_(None)
    ).first()

    if grant and _not_expired(grant.expires_at):
        return has_permission(grant.permission_level, permission)

    return False


def has_permission(share_level: str, required_level: str) -> bool:
    """
    Check if share permission level satisfies required level.

    Permission levels are cumulative:
    - 'read': view only
    - 'download': view + download original file
    - 'edit': view + download + modify fields + re-share
    """
    levels = {"read": 1, "download": 2, "edit": 3}
    return levels.get(share_level, 0) >= levels.get(required_level, 0)


def share_document_by_email(
    session: Session,
    document_id: int,
    shared_by_user_id: int,
    recipient_email: str,
    permission_level: str = "read",
    is_invite: bool = False,
    expires_at: datetime | None = None,
    watermark: bool = True,
) -> dict:
    """
    Share a document with a user by email address.

    Returns: {"success": bool, "message": str, "share_id": int or None}
    """
    from .queries import get_user_by_email

    recipient_user = get_user_by_email(session, recipient_email)
    if not recipient_user:
        return {"success": False, "message": "User not found with this email"}

    if recipient_user.id == shared_by_user_id:
        return {"success": False, "message": "Cannot share with yourself"}

    doc = session.query(Document).filter_by(id=document_id).first()
    if not doc:
        return {"success": False, "message": "Document not found"}

    shared_by_user = session.query(User).filter_by(id=shared_by_user_id).first()

    share = share_document(
        session,
        document_id,
        shared_by_user_id,
        recipient_user.id,
        permission_level,
        is_invite,
        expires_at,
        watermark,
    )

    # Send mock email
    MockEmailService.send_share_notification(
        recipient_email=recipient_email,
        shared_by=shared_by_user.email,
        document_or_person=doc.title,
        is_person=False,
        permission_level=permission_level,
        is_invite=is_invite,
    )

    session.add(Notification(
        user_id=recipient_user.id,
        message=f"{shared_by_user.email} shared \"{doc.title}\" with you ({permission_level})",
        document_id=document_id,
    ))
    session.commit()

    return {"success": True, "message": "Document shared successfully", "share_id": share.id}


def share_person_all_by_email(
    session: Session,
    person_id: int,
    granted_by_user_id: int,
    recipient_email: str,
    permission_level: str = "read",
    include_future: bool = False,
    is_invite: bool = False,
    expires_at: datetime | None = None,
    watermark: bool = True,
) -> dict:
    """
    Share all documents of a person with a user by email address.

    Returns: {"success": bool, "message": str, "grant_id": int or None}
    """
    from .queries import get_user_by_email

    recipient_user = get_user_by_email(session, recipient_email)
    if not recipient_user:
        return {"success": False, "message": "User not found with this email"}

    if recipient_user.id == granted_by_user_id:
        return {"success": False, "message": "Cannot share with yourself"}

    person = session.query(Person).filter_by(id=person_id).first()
    if not person:
        return {"success": False, "message": "Person not found"}

    granted_by_user = session.query(User).filter_by(id=granted_by_user_id).first()
    doc_count = session.query(Document).filter_by(person_id=person_id).count()

    grant = share_person_all(
        session,
        person_id,
        granted_by_user_id,
        recipient_user.id,
        permission_level,
        include_future,
        is_invite,
        expires_at,
        watermark,
    )

    # Send mock email
    MockEmailService.send_share_notification(
        recipient_email=recipient_email,
        shared_by=granted_by_user.email,
        document_or_person=f"{person.full_name} ({doc_count} documents)",
        is_person=True,
        permission_level=permission_level,
        is_invite=is_invite,
    )

    session.add(Notification(
        user_id=recipient_user.id,
        message=f"{granted_by_user.email} shared all of {person.full_name}'s documents with you ({permission_level})",
    ))
    session.commit()

    return {"success": True, "message": "Person's documents shared successfully", "grant_id": grant.id}


def get_user_sharing_recipients(session: Session, user_id: int) -> list[dict]:
    """
    Get all users this user has shared documents with.

    Batched into 4 flat queries regardless of recipient count — the previous
    version queried once per recipient (3 round-trips each), which was cheap
    on local SQLite but scales badly over the network to Neon.
    """
    doc_counts = dict(
        session.query(DocumentShare.shared_with_user_id, func.count(DocumentShare.id))
        .filter(DocumentShare.shared_by_user_id == user_id, DocumentShare.revoked_at.is_(None))
        .group_by(DocumentShare.shared_with_user_id)
        .all()
    )

    person_counts = dict(
        session.query(PersonShareGrant.granted_to_user_id, func.count(PersonShareGrant.id))
        .filter(PersonShareGrant.granted_by_user_id == user_id, PersonShareGrant.revoked_at.is_(None))
        .group_by(PersonShareGrant.granted_to_user_id)
        .all()
    )

    recipient_ids = set(doc_counts) | set(person_counts)
    if not recipient_ids:
        return []

    users = {u.id: u for u in session.query(User).filter(User.id.in_(recipient_ids)).all()}

    recipients = []
    for recipient_id in recipient_ids:
        user = users.get(recipient_id)
        if user:
            recipients.append({
                "user_id": recipient_id,
                "email": user.email,
                "full_name": user.full_name,
                "documents_shared": doc_counts.get(recipient_id, 0),
                "persons_shared": person_counts.get(recipient_id, 0),
            })

    return recipients
