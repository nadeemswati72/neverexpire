"""Shared serialization helpers — convert SQLAlchemy models to JSON-safe dicts."""
from datetime import date


def _date(d: date | None) -> str | None:
    return d.isoformat() if d else None


def expiry_status(doc, today: date, horizon: date) -> str:
    if doc.expiry_date is None:
        return "no_expiry"
    if doc.expiry_date < today:
        return "expired"
    if doc.expiry_date <= horizon:
        return "expiring_soon"
    return "valid"


def days_remaining(doc, today: date) -> int | None:
    if doc.expiry_date is None:
        return None
    return (doc.expiry_date - today).days


def person_brief(p) -> dict:
    return {
        "id": p.id,
        "full_name": p.full_name,
        "date_of_birth": _date(p.date_of_birth),
        "is_primary": p.is_primary,
        "photo_path": p.photo_path,
    }


def doc_type_brief(dt) -> dict:
    return {"id": dt.id, "code": dt.code, "name": dt.default_name}


def document_brief(doc, today: date, horizon: date) -> dict:
    return {
        "id": doc.id,
        "title": doc.title,
        "document_type": doc_type_brief(doc.document_type),
        "person": person_brief(doc.person) if doc.person else None,
        "person_id": doc.person_id,
        "expiry_date": _date(doc.expiry_date),
        "issued_date": _date(doc.issued_date),
        "status": expiry_status(doc, today, horizon),
        "days_remaining": days_remaining(doc, today),
        "document_number": doc.document_number,
        "source": doc.source,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }


def document_detail(doc, today: date, horizon: date) -> dict:
    base = document_brief(doc, today, horizon)
    base.update({
        "issuing_authority": doc.issuing_authority,
        "holder_name": doc.holder_name,
        "notes": doc.notes,
        "extra_fields": doc.extra_fields,
        "files": [
            {
                "id": f.id,
                "original_filename": f.original_filename,
                "mime_type": f.mime_type,
                "file_size_bytes": f.file_size_bytes,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            }
            for f in doc.files
            if f.is_active
        ],
        "extraction_runs": [
            {
                "id": r.id,
                "model_name": r.model_name,
                "status": r.status,
                "confidence": r.confidence,
                "extracted_title": r.extracted_title,
                "extracted_expiry_date": _date(r.extracted_expiry_date),
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in doc.extraction_runs
        ],
    })
    return base


def person_detail(p, relations: list) -> dict:
    base = person_brief(p)
    base["relations"] = [
        {
            "relation_type": rel.relation_type.name if rel.relation_type else None,
            "related_person": person_brief(rel.related_person),
        }
        for rel in relations
    ]
    return base
