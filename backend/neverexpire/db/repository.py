from datetime import date, datetime
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from ..extractor import EXTENSION_MEDIA_TYPES, ExpiryExtraction
from ..storage import (
    LocalStorageBackend,
    gdrive_cache_path,
    get_storage_backend,
    get_storage_backend_for_id,
)
from .models import Document, DocumentExtractionRun, DocumentFile, DocumentType

# Sentinel distinguishing "no confirmed value supplied" (fall back to the
# extracted value) from "user confirmed an empty/blank value" (use None).
_UNSET: Any = object()


def _persist_uploaded_file(local_path: Path) -> tuple[str, int | None]:
    """
    Hand a freshly-saved local file off to the configured storage backend.

    Local backend: no-op, the path already IS the storage location.
    Google Drive backend: uploads the encrypted file to Drive and deletes
    the local temp copy, returning a "gdrive:<file_id>" reference instead.
    """
    size = local_path.stat().st_size if local_path.exists() else None
    backend = get_storage_backend()
    if isinstance(backend, LocalStorageBackend):
        return str(local_path), size

    storage_id = backend.save_file(str(local_path), local_path.name)
    local_path.unlink(missing_ok=True)
    return storage_id, size


def parse_date(value: str | None) -> date | None:
    if value is None or value == "":
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


def normalize_code(raw_code: str) -> str:
    return raw_code.strip().upper().replace(" ", "_").replace("-", "_")


def get_or_default_document_type(session: Session, raw_document_type: str) -> DocumentType:
    code = normalize_code(raw_document_type)

    document_type = session.query(DocumentType).filter_by(code=code).first()
    if document_type is not None:
        return document_type

    fallback = session.query(DocumentType).filter_by(code="OTHER").first()
    if fallback is None:
        raise LookupError("Reference data missing: document_types.OTHER. Run db.seed first.")
    return fallback


def create_document_from_extraction(
    session: Session,
    person_id: int,
    file_path: str | Path,
    extraction: ExpiryExtraction,
    model_name: str,
    *,
    confirmed_document_type: DocumentType | None = None,
    confirmed_title: str | None = None,
    confirmed_issued_date: date | None = _UNSET,
    confirmed_expiry_date: date | None = _UNSET,
    confirmed_document_number: str | None = _UNSET,
    confirmed_issuing_authority: str | None = _UNSET,
    confirmed_holder_name: str | None = _UNSET,
    confirmed_notes: str | None = _UNSET,
    extra_fields: dict | None = None,
    watermarked_file_path: str | Path | None = None,
) -> Document:
    path = Path(file_path)
    extracted_document_type = get_or_default_document_type(session, extraction.document_type)
    extracted_issued_date = parse_date(extraction.issued_date)
    extracted_expiry_date = parse_date(extraction.expiry_date)

    document = Document(
        person_id=person_id,
        document_type=confirmed_document_type or extracted_document_type,
        title=confirmed_title if confirmed_title is not None else extraction.title,
        issued_date=extracted_issued_date if confirmed_issued_date is _UNSET else confirmed_issued_date,
        expiry_date=extracted_expiry_date if confirmed_expiry_date is _UNSET else confirmed_expiry_date,
        document_number=(
            extraction.document_number if confirmed_document_number is _UNSET else confirmed_document_number
        ),
        issuing_authority=(
            extraction.issuing_authority
            if confirmed_issuing_authority is _UNSET
            else confirmed_issuing_authority
        ),
        holder_name=extraction.holder_name if confirmed_holder_name is _UNSET else confirmed_holder_name,
        notes=extraction.additional_notes if confirmed_notes is _UNSET else confirmed_notes,
        status="active",
        extra_fields=extra_fields,
    )
    session.add(document)
    session.flush()

    _, mime_type = EXTENSION_MEDIA_TYPES.get(path.suffix.lower(), (None, None))
    original_name = path.name
    stored_path, size = _persist_uploaded_file(path)
    document_file = DocumentFile(
        document_id=document.id,
        file_path=stored_path,
        watermarked_file_path=str(watermarked_file_path) if watermarked_file_path else None,
        original_filename=original_name,
        mime_type=mime_type,
        file_size_bytes=size,
    )
    session.add(document_file)
    session.flush()

    extraction_run = DocumentExtractionRun(
        document_id=document.id,
        document_file_id=document_file.id,
        model_name=model_name,
        status="success",
        extracted_document_type_id=extracted_document_type.id,
        extracted_title=extraction.title,
        extracted_issued_date=extracted_issued_date,
        extracted_expiry_date=extracted_expiry_date,
        confidence=extraction.confidence,
        raw_response=extraction.model_dump_json(),
    )
    session.add(extraction_run)
    session.commit()

    return document


def add_document_file(session: Session, document_id: int, file_path: str | Path) -> DocumentFile:
    """Attach a plain file (photo/scan) to an existing document, without AI extraction."""
    path = Path(file_path)
    _, mime_type = EXTENSION_MEDIA_TYPES.get(path.suffix.lower(), (None, None))
    original_name = path.name
    stored_path, size = _persist_uploaded_file(path)
    document_file = DocumentFile(
        document_id=document_id,
        file_path=stored_path,
        original_filename=original_name,
        mime_type=mime_type,
        file_size_bytes=size,
    )
    session.add(document_file)
    session.commit()
    session.refresh(document_file)
    return document_file


def delete_document(session: Session, document: Document) -> None:
    for file in document.files:
        if file.file_path.startswith("gdrive:"):
            get_storage_backend_for_id(file.file_path).delete_file(file.file_path)
            # Clean up any local decrypted working copy + its watermark variants.
            cache_source = gdrive_cache_path(file.file_path, Path(file.original_filename).suffix)
            for cache_variant in cache_source.parent.glob(f"{cache_source.stem}*{cache_source.suffix}"):
                cache_variant.unlink(missing_ok=True)
            continue

        for path_str in (file.file_path, file.watermarked_file_path):
            if path_str:
                Path(path_str).unlink(missing_ok=True)
        # Also clean up personalized per-recipient watermark variants (_wm_<tag>).
        source = Path(file.file_path)
        for wm_variant in source.parent.glob(f"{source.stem}_wm*{source.suffix}"):
            wm_variant.unlink(missing_ok=True)
    session.delete(document)
    session.commit()


def create_manual_document(
    session: Session,
    person_id: int,
    document_type: DocumentType,
    title: str,
    issued_date: date | None = None,
    expiry_date: date | None = None,
    document_number: str | None = None,
    issuing_authority: str | None = None,
    holder_name: str | None = None,
    notes: str | None = None,
    extra_fields: dict | None = None,
) -> Document:
    document = Document(
        person_id=person_id,
        document_type=document_type,
        title=title,
        issued_date=issued_date,
        expiry_date=expiry_date,
        document_number=document_number,
        issuing_authority=issuing_authority,
        holder_name=holder_name,
        notes=notes,
        status="active",
        source="manual",
        extra_fields=extra_fields,
    )
    session.add(document)
    session.commit()
    return document
