import base64
from pathlib import Path
from typing import TYPE_CHECKING, Optional, Sequence

import anthropic
from pydantic import BaseModel, create_model

from . import config

if TYPE_CHECKING:
    from .db.models import DocumentFieldDefinition

client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)

EXTENSION_MEDIA_TYPES = {
    ".pdf": ("document", "application/pdf"),
    ".jpg": ("image", "image/jpeg"),
    ".jpeg": ("image", "image/jpeg"),
    ".png": ("image", "image/png"),
    ".webp": ("image", "image/webp"),
    ".gif": ("image", "image/gif"),
}


class ExpiryExtraction(BaseModel):
    document_type: str
    title: str
    issued_date: Optional[str] = None
    expiry_date: Optional[str] = None
    document_number: Optional[str] = None
    issuing_authority: Optional[str] = None
    holder_name: Optional[str] = None
    additional_notes: Optional[str] = None
    confidence: str


EXTRACTION_PROMPT = (
    "Analyze this document and extract the following information as a JSON object. "
    "Only use information that is actually visible in the document. If a field is "
    "not present, not legible, or not applicable to this document, return null for "
    "that field instead of guessing.\n\n"
    "- document_type: a short category for this document (e.g. passport, insurance, "
    "warranty, medication, food item, certificate, subscription, or other if "
    "nothing fits well)\n"
    "- title: a short, human-readable label for this document\n"
    "- issued_date: the date the document was issued, in YYYY-MM-DD format, or "
    "null if not present\n"
    "- expiry_date: the date the document expires or is no longer valid, in "
    "YYYY-MM-DD format, or null if there is no expiry date\n"
    "- document_number: the primary identifying number on the document (e.g. "
    "passport number, policy number, license number, certificate number, order "
    "number), or null if there isn't one\n"
    "- issuing_authority: the organization, company, or authority that issued this "
    "document (e.g. government department, insurer, manufacturer, employer), or "
    "null if not stated\n"
    "- holder_name: the name of the person this document belongs to or is "
    "addressed to, or null if not stated\n"
    "- additional_notes: any other notable information that doesn't fit the fields "
    "above, as a short sentence, or null if there's nothing else worth noting\n"
    "- confidence: \"high\", \"medium\", or \"low\" based on how clearly the key "
    "dates were readable"
)

# Maps a DocumentFieldDefinition.data_type to the Python/Pydantic type used when
# building a dynamic extraction schema for document-specific fields.
EXTRA_FIELD_TYPES: dict[str, type] = {
    "number": Optional[float],
    "boolean": Optional[bool],
    "date": Optional[str],
    "text": Optional[str],
}


def _build_content_block(path: Path) -> dict:
    extension = path.suffix.lower()
    if extension not in EXTENSION_MEDIA_TYPES:
        raise ValueError(f"Unsupported file type: {extension}")

    block_type, media_type = EXTENSION_MEDIA_TYPES[extension]
    file_data = base64.standard_b64encode(path.read_bytes()).decode("utf-8")

    return {
        "type": block_type,
        "source": {
            "type": "base64",
            "media_type": media_type,
            "data": file_data,
        },
    }


def extract_expiry_info(file_path: str) -> ExpiryExtraction:
    path = Path(file_path)
    content_block = _build_content_block(path)

    with client.messages.stream(
        model=config.EXTRACTION_MODEL,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [content_block, {"type": "text", "text": EXTRACTION_PROMPT}],
            }
        ],
        output_format=ExpiryExtraction,
    ) as stream:
        final_message = stream.get_final_message()

    return final_message.parsed_output


def build_extra_fields_model(
    field_definitions: Sequence["DocumentFieldDefinition"],
) -> type[BaseModel]:
    """Build a Pydantic model with one optional field per field definition."""
    fields = {
        field.field_code: (EXTRA_FIELD_TYPES.get(field.data_type, Optional[str]), None)
        for field in field_definitions
    }
    return create_model("ExtraFieldsExtraction", **fields)


def extract_additional_fields(
    file_path: str,
    document_type_name: str,
    field_definitions: Sequence["DocumentFieldDefinition"],
) -> dict:
    """Second-stage extraction for document-type-specific fields.

    Only called when the identified document type has admin-configured fields
    with applies_to_extraction=True. Returns a dict of field_code -> value,
    omitting any field the model returned as null.
    """
    if not field_definitions:
        return {}

    path = Path(file_path)
    content_block = _build_content_block(path)
    model = build_extra_fields_model(field_definitions)

    field_lines = "\n".join(
        f"- {field.field_code}: {field.label} (type: {field.data_type})"
        for field in field_definitions
    )
    prompt = (
        f"This document has been identified as: {document_type_name}.\n"
        "Extract the following additional fields from the document. Only use "
        "information that is actually visible in the document. If a field is not "
        "visible, not present, or not applicable to this document, return null "
        "for that field. Do not guess or invent values.\n\n"
        f"{field_lines}"
    )

    with client.messages.stream(
        model=config.EXTRACTION_MODEL,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [content_block, {"type": "text", "text": prompt}],
            }
        ],
        output_format=model,
    ) as stream:
        final_message = stream.get_final_message()

    result = final_message.parsed_output
    return {key: value for key, value in result.model_dump().items() if value is not None}
