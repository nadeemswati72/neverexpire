"""
Sharing repository functions for documents and persons.
"""

from datetime import datetime
from sqlalchemy.orm import Session

from .models import Document, DocumentShare, Person, PersonShareGrant, User


def share_document(
    session: Session,
    document_id: int,
    shared_by_user_id: int,
    shared_with_user_id: int,
    permission_level: str = "read",
    is_invite: bool = False,
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
    - Documents shared with them (accepted or granted)
    - Documents via person bulk shares
    """
    # 1. Documents they own
    owned_ids = session.query(Document.id).join(Person).filter(
        Person.user_id == user_id
    ).all()
    owned_ids = [row[0] for row in owned_ids]

    # 2. Documents directly shared with them
    shared_ids = session.query(DocumentShare.document_id).filter(
        DocumentShare.shared_with_user_id == user_id,
        DocumentShare.revoked_at.is_(None),
    ).all()
    shared_ids = [row[0] for row in shared_ids]

    # 3. Documents via person bulk shares
    bulk_ids = (
        session.query(Document.id)
        .join(Person, Document.person_id == Person.id)
        .join(PersonShareGrant, Person.id == PersonShareGrant.person_id)
        .filter(
            PersonShareGrant.granted_to_user_id == user_id,
            PersonShareGrant.revoked_at.is_(None),
        )
        .all()
    )
    bulk_ids = [row[0] for row in bulk_ids]

    return list(set(owned_ids + shared_ids + bulk_ids))


def share_person_all(
    session: Session,
    person_id: int,
    granted_by_user_id: int,
    granted_to_user_id: int,
    permission_level: str = "read",
    include_future: bool = False,
    is_invite: bool = False,
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
    share = session.query(DocumentShare).filter_by(
        document_id=document_id,
        shared_with_user_id=user_id,
        revoked_at=None,
    ).first()

    if share:
        return has_permission(share.permission_level, permission)

    # Check person bulk share
    grant = session.query(PersonShareGrant).filter_by(
        person_id=doc.person_id,
        granted_to_user_id=user_id,
        revoked_at=None,
    ).first()

    if grant:
        return has_permission(grant.permission_level, permission)

    return False


def has_permission(share_level: str, required_level: str) -> bool:
    """Check if share permission level satisfies required level."""
    levels = {"read": 1, "edit": 2, "download": 3}
    return levels.get(share_level, 0) >= levels.get(required_level, 0)
