from pathlib import Path

from . import config, extractor
from .db.models import Document
from .db.repository import create_document_from_extraction
from .db.session import SessionLocal


def process_document(person_id: int, file_path: str | Path) -> Document:
    extraction = extractor.extract_expiry_info(str(file_path))

    with SessionLocal() as session:
        return create_document_from_extraction(
            session=session,
            person_id=person_id,
            file_path=file_path,
            extraction=extraction,
            model_name=config.EXTRACTION_MODEL,
        )
