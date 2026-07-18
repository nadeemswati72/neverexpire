from datetime import date, timedelta

from sqlalchemy import and_, case, func
from sqlalchemy.orm import Session, joinedload

from .. import config
from .models import (
    Document,
    DocumentExtractionRun,
    DocumentFieldDefinition,
    DocumentReminder,
    DocumentType,
    FamilyRelationType,
    Person,
    User,
)
from .sharing import get_user_accessible_document_ids


def get_persons_for_user(session: Session, user_id: int) -> list[Person]:
    return (
        session.query(Person)
        .filter(Person.user_id == user_id, Person.is_active.is_(True))
        .order_by(Person.is_primary.desc(), Person.id)
        .all()
    )


def get_person(session: Session, person_id: int) -> Person | None:
    """Get a single person by ID."""
    return session.query(Person).filter_by(id=person_id, is_active=True).first()


def get_user_by_email(session: Session, email: str) -> User | None:
    """Get a user by email address."""
    return session.query(User).filter_by(email=email).first()


def _apply_status_filter(query, status_filter: str | None, today: date, horizon: date):
    if status_filter == "expiring_soon":
        return query.filter(
            Document.status == "active",
            Document.expiry_date.isnot(None),
            Document.expiry_date >= today,
            Document.expiry_date <= horizon,
        )
    if status_filter == "expired":
        return query.filter(
            Document.status == "active",
            Document.expiry_date.isnot(None),
            Document.expiry_date < today,
        )
    if status_filter == "valid":
        return query.filter(
            Document.status == "active",
            Document.expiry_date.isnot(None),
            Document.expiry_date > horizon,
        )
    if status_filter == "no_expiry":
        return query.filter(
            Document.status == "active",
            Document.expiry_date.is_(None),
        )
    return query


def get_documents_for_user(
    session: Session, user_id: int, status_filter: str | None = None
) -> list[Document]:
    today = date.today()
    horizon = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)

    accessible_ids = get_user_accessible_document_ids(session, user_id)
    if not accessible_ids:
        return []

    query = (
        session.query(Document)
        .options(joinedload(Document.document_type), joinedload(Document.person))
        .filter(Document.id.in_(accessible_ids))
    )
    query = _apply_status_filter(query, status_filter, today, horizon)
    return query.order_by(Document.expiry_date.is_(None), Document.expiry_date).all()


def get_documents_for_person(
    session: Session, person_id: int, status_filter: str | None = None
) -> list[Document]:
    today = date.today()
    horizon = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)

    query = (
        session.query(Document)
        .options(joinedload(Document.document_type))
        .filter(Document.person_id == person_id)
    )
    query = _apply_status_filter(query, status_filter, today, horizon)
    return query.order_by(Document.expiry_date.is_(None), Document.expiry_date).all()


def get_document(session: Session, document_id: int) -> Document | None:
    return (
        session.query(Document)
        .options(
            joinedload(Document.document_type),
            joinedload(Document.person),
            joinedload(Document.files),
            joinedload(Document.extraction_runs).joinedload(
                DocumentExtractionRun.extracted_document_type
            ),
        )
        .filter(Document.id == document_id)
        .first()
    )


def get_dashboard_summary(session: Session, user_id: int) -> dict:
    today = date.today()
    horizon = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)

    accessible_ids = get_user_accessible_document_ids(session, user_id)
    if not accessible_ids:
        return {
            "total_documents": 0,
            "expiring_soon": 0,
            "expired": 0,
            "valid": 0,
            "no_expiry": 0,
            "pending_reminders": [],
        }

    # A single aggregate query (conditional SUMs) replaces what used to be 5
    # separate .count() round-trips — each was free on local SQLite but now
    # costs real network latency to Neon, so they're collapsed into one.
    total_documents, expiring_soon, expired, valid, no_expiry = session.query(
        func.count(Document.id),
        func.sum(case(
            (and_(
                Document.status == "active",
                Document.expiry_date.isnot(None),
                Document.expiry_date >= today,
                Document.expiry_date <= horizon,
            ), 1),
            else_=0,
        )),
        func.sum(case(
            (and_(
                Document.status == "active",
                Document.expiry_date.isnot(None),
                Document.expiry_date < today,
            ), 1),
            else_=0,
        )),
        func.sum(case(
            (and_(
                Document.status == "active",
                Document.expiry_date.isnot(None),
                Document.expiry_date > horizon,
            ), 1),
            else_=0,
        )),
        func.sum(case(
            (and_(
                Document.status == "active",
                Document.expiry_date.is_(None),
            ), 1),
            else_=0,
        )),
    ).filter(Document.id.in_(accessible_ids)).one()

    expiring_soon = expiring_soon or 0
    expired = expired or 0
    valid = valid or 0
    no_expiry = no_expiry or 0

    pending_reminders = (
        session.query(DocumentReminder)
        .join(Document, DocumentReminder.document_id == Document.id)
        .options(joinedload(DocumentReminder.document).joinedload(Document.person))
        .filter(Document.id.in_(accessible_ids), DocumentReminder.status == "pending")
        .order_by(DocumentReminder.due_date)
        .all()
    )

    return {
        "total_documents": total_documents,
        "expiring_soon": expiring_soon,
        "expired": expired,
        "valid": valid,
        "no_expiry": no_expiry,
        "pending_reminders": pending_reminders,
    }


def get_admin_summary(session: Session) -> dict:
    total_users = session.query(User).count()
    total_persons = session.query(Person).count()
    total_documents = session.query(Document).count()

    extraction_status_counts = dict(
        session.query(DocumentExtractionRun.status, func.count(DocumentExtractionRun.id))
        .group_by(DocumentExtractionRun.status)
        .all()
    )
    reminder_status_counts = dict(
        session.query(DocumentReminder.status, func.count(DocumentReminder.id))
        .group_by(DocumentReminder.status)
        .all()
    )
    total_reminders = session.query(DocumentReminder).count()

    total_document_types = session.query(DocumentType).count()
    total_family_relation_types = session.query(FamilyRelationType).count()
    total_field_definitions = session.query(DocumentFieldDefinition).count()

    return {
        "total_users": total_users,
        "total_persons": total_persons,
        "total_documents": total_documents,
        "total_reminders": total_reminders,
        "extraction_status_counts": extraction_status_counts,
        "reminder_status_counts": reminder_status_counts,
        "total_document_types": total_document_types,
        "total_family_relation_types": total_family_relation_types,
        "total_field_definitions": total_field_definitions,
    }


def list_all_users(session: Session) -> list[User]:
    return session.query(User).order_by(User.id).all()
