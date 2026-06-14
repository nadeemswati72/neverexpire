from sqlalchemy.orm import Session

from .. import config
from .models import DocumentFieldDefinition, DocumentType, FamilyRelationType, Language, ReminderRule
from .session import SessionLocal

LANGUAGES = [
    ("en", "English"),
    ("hi", "Hindi"),
]

FAMILY_RELATION_TYPES = [
    ("SELF", "Self"),
    ("SPOUSE", "Spouse"),
    ("CHILD", "Child"),
    ("PARENT", "Parent"),
    ("SIBLING", "Sibling"),
    ("OTHER", "Other"),
]

DOCUMENT_TYPES = [
    ("PASSPORT", "Passport"),
    ("INSURANCE", "Insurance"),
    ("WARRANTY", "Warranty"),
    ("MEDICATION", "Medication"),
    ("FOOD_ITEM", "Food Item"),
    ("CERTIFICATE", "Certificate"),
    ("SUBSCRIPTION", "Subscription"),
    ("OTHER", "Other"),
]

# (document_type_code, field_code, label, data_type, is_required, display_order)
DOCUMENT_FIELD_DEFINITIONS = [
    ("PASSPORT", "passport_number", "Passport Number", "text", True, 1),
    ("PASSPORT", "nationality", "Nationality", "text", False, 2),
    ("PASSPORT", "issuing_country", "Issuing Country", "text", False, 3),
    ("INSURANCE", "policy_number", "Policy Number", "text", False, 1),
    ("INSURANCE", "provider", "Provider", "text", False, 2),
    ("CERTIFICATE", "issuer", "Issuer", "text", False, 1),
]


def seed_reference_data(session: Session) -> None:
    _seed_languages(session)
    _seed_family_relation_types(session)
    _seed_document_types(session)
    _seed_document_field_definitions(session)
    _seed_reminder_rules(session)
    session.commit()


def _seed_languages(session: Session) -> None:
    for code, name in LANGUAGES:
        if not session.query(Language).filter_by(code=code).first():
            session.add(Language(code=code, name=name))


def _seed_family_relation_types(session: Session) -> None:
    for code, name in FAMILY_RELATION_TYPES:
        if not session.query(FamilyRelationType).filter_by(code=code).first():
            session.add(FamilyRelationType(code=code, name=name, is_system=True))


def _seed_document_types(session: Session) -> None:
    for code, default_name in DOCUMENT_TYPES:
        if not session.query(DocumentType).filter_by(code=code).first():
            session.add(DocumentType(code=code, default_name=default_name, is_system=True))


def _seed_document_field_definitions(session: Session) -> None:
    for type_code, field_code, label, data_type, is_required, display_order in DOCUMENT_FIELD_DEFINITIONS:
        document_type = session.query(DocumentType).filter_by(code=type_code).first()
        if document_type is None:
            continue
        exists = (
            session.query(DocumentFieldDefinition)
            .filter_by(document_type_id=document_type.id, field_code=field_code)
            .first()
        )
        if exists is None:
            session.add(
                DocumentFieldDefinition(
                    document_type_id=document_type.id,
                    field_code=field_code,
                    label=label,
                    data_type=data_type,
                    is_required=is_required,
                    display_order=display_order,
                )
            )


def _seed_reminder_rules(session: Session) -> None:
    threshold = config.REMINDER_DAYS_THRESHOLD
    if not session.query(ReminderRule).filter_by(threshold_days=threshold).first():
        session.add(
            ReminderRule(name=f"{threshold} days before expiry", threshold_days=threshold)
        )


if __name__ == "__main__":
    with SessionLocal() as session:
        seed_reference_data(session)
