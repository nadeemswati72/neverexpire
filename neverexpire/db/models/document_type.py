from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base, TimestampMixin

if TYPE_CHECKING:
    from .document import Document, DocumentExtractionRun
    from .language import Language


class DocumentType(Base, TimestampMixin):
    __tablename__ = "document_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    default_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    translations: Mapped[list["DocumentTypeTranslation"]] = relationship(
        back_populates="document_type"
    )
    documents: Mapped[list["Document"]] = relationship(back_populates="document_type")
    extraction_runs: Mapped[list["DocumentExtractionRun"]] = relationship(
        back_populates="extracted_document_type"
    )
    field_definitions: Mapped[list["DocumentFieldDefinition"]] = relationship(
        back_populates="document_type"
    )


class DocumentTypeTranslation(Base, TimestampMixin):
    __tablename__ = "document_type_translations"
    __table_args__ = (
        UniqueConstraint("document_type_id", "language_id", name="uq_document_type_translation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    document_type_id: Mapped[int] = mapped_column(
        ForeignKey("document_types.id", ondelete="CASCADE"), nullable=False, index=True
    )
    language_id: Mapped[int] = mapped_column(
        ForeignKey("languages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    document_type: Mapped["DocumentType"] = relationship(back_populates="translations")
    language: Mapped["Language"] = relationship(back_populates="document_type_translations")


class DocumentFieldDefinition(Base, TimestampMixin):
    __tablename__ = "document_field_definitions"
    __table_args__ = (
        UniqueConstraint("document_type_id", "field_code", name="uq_document_field_definition"),
        CheckConstraint(
            "data_type IN ('text', 'number', 'date', 'boolean')",
            name="ck_document_field_definitions_data_type",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    document_type_id: Mapped[int] = mapped_column(
        ForeignKey("document_types.id", ondelete="CASCADE"), nullable=False, index=True
    )
    field_code: Mapped[str] = mapped_column(String(50), nullable=False)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    data_type: Mapped[str] = mapped_column(String(10), nullable=False, default="text")
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    applies_to_extraction: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    document_type: Mapped["DocumentType"] = relationship(back_populates="field_definitions")
