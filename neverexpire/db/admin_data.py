from sqlalchemy.orm import Session

from .models import DocumentFieldDefinition, DocumentType, FamilyRelationType
from .repository import normalize_code

VALID_FIELD_DATA_TYPES = {"text", "number", "date", "boolean"}


# --- Document types ---------------------------------------------------------

def list_document_types(session: Session) -> list[DocumentType]:
    return session.query(DocumentType).order_by(DocumentType.default_name).all()


def create_document_type(session: Session, raw_code: str, default_name: str) -> DocumentType:
    code = normalize_code(raw_code)
    default_name = default_name.strip()
    if not code or not default_name:
        raise ValueError("Code and name are required.")
    if session.query(DocumentType).filter_by(code=code).first() is not None:
        raise ValueError(f"Document type '{code}' already exists.")

    document_type = DocumentType(code=code, default_name=default_name, is_system=False)
    session.add(document_type)
    session.commit()
    return document_type


def update_document_type_name(session: Session, type_id: int, default_name: str) -> DocumentType:
    document_type = session.get(DocumentType, type_id)
    if document_type is None:
        raise ValueError("Document type not found.")
    default_name = default_name.strip()
    if not default_name:
        raise ValueError("Name is required.")

    document_type.default_name = default_name
    session.commit()
    return document_type


def set_document_type_active(session: Session, type_id: int, is_active: bool) -> DocumentType:
    document_type = session.get(DocumentType, type_id)
    if document_type is None:
        raise ValueError("Document type not found.")
    if document_type.is_system and not is_active:
        raise ValueError(f"'{document_type.default_name}' is a system document type and cannot be deactivated.")

    document_type.is_active = is_active
    session.commit()
    return document_type


# --- Family relation types ---------------------------------------------------

def list_family_relation_types(session: Session) -> list[FamilyRelationType]:
    return session.query(FamilyRelationType).order_by(FamilyRelationType.name).all()


def create_family_relation_type(session: Session, raw_code: str, name: str) -> FamilyRelationType:
    code = normalize_code(raw_code)
    name = name.strip()
    if not code or not name:
        raise ValueError("Code and name are required.")
    if session.query(FamilyRelationType).filter_by(code=code).first() is not None:
        raise ValueError(f"Family relation type '{code}' already exists.")

    relation_type = FamilyRelationType(code=code, name=name, is_system=False)
    session.add(relation_type)
    session.commit()
    return relation_type


def update_family_relation_type_name(session: Session, type_id: int, name: str) -> FamilyRelationType:
    relation_type = session.get(FamilyRelationType, type_id)
    if relation_type is None:
        raise ValueError("Family relation type not found.")
    name = name.strip()
    if not name:
        raise ValueError("Name is required.")

    relation_type.name = name
    session.commit()
    return relation_type


def set_family_relation_type_active(session: Session, type_id: int, is_active: bool) -> FamilyRelationType:
    relation_type = session.get(FamilyRelationType, type_id)
    if relation_type is None:
        raise ValueError("Family relation type not found.")
    if relation_type.is_system and not is_active:
        raise ValueError(f"'{relation_type.name}' is a system relation type and cannot be deactivated.")

    relation_type.is_active = is_active
    session.commit()
    return relation_type


# --- Document field definitions ----------------------------------------------

def list_field_definitions(session: Session, document_type_id: int) -> list[DocumentFieldDefinition]:
    return (
        session.query(DocumentFieldDefinition)
        .filter_by(document_type_id=document_type_id)
        .order_by(DocumentFieldDefinition.display_order, DocumentFieldDefinition.id)
        .all()
    )


def create_field_definition(
    session: Session,
    document_type_id: int,
    field_code: str,
    label: str,
    data_type: str,
    is_required: bool,
    display_order: int,
    applies_to_extraction: bool,
) -> DocumentFieldDefinition:
    code = normalize_code(field_code).lower()
    label = label.strip()
    if not code or not label:
        raise ValueError("Field code and label are required.")
    if data_type not in VALID_FIELD_DATA_TYPES:
        raise ValueError(f"Invalid data type: {data_type!r}")

    exists = (
        session.query(DocumentFieldDefinition)
        .filter_by(document_type_id=document_type_id, field_code=code)
        .first()
    )
    if exists is not None:
        raise ValueError(f"Field '{code}' already exists for this document type.")

    field = DocumentFieldDefinition(
        document_type_id=document_type_id,
        field_code=code,
        label=label,
        data_type=data_type,
        is_required=is_required,
        display_order=display_order,
        applies_to_extraction=applies_to_extraction,
    )
    session.add(field)
    session.commit()
    return field


def update_field_definition(
    session: Session,
    field_id: int,
    label: str,
    data_type: str,
    is_required: bool,
    display_order: int,
    applies_to_extraction: bool,
) -> DocumentFieldDefinition:
    field = session.get(DocumentFieldDefinition, field_id)
    if field is None:
        raise ValueError("Field definition not found.")
    label = label.strip()
    if not label:
        raise ValueError("Label is required.")
    if data_type not in VALID_FIELD_DATA_TYPES:
        raise ValueError(f"Invalid data type: {data_type!r}")

    field.label = label
    field.data_type = data_type
    field.is_required = is_required
    field.display_order = display_order
    field.applies_to_extraction = applies_to_extraction
    session.commit()
    return field


def set_field_definition_active(session: Session, field_id: int, is_active: bool) -> DocumentFieldDefinition:
    field = session.get(DocumentFieldDefinition, field_id)
    if field is None:
        raise ValueError("Field definition not found.")

    field.is_active = is_active
    session.commit()
    return field
