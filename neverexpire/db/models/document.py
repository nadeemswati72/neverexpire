from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, CheckConstraint, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base, TimestampMixin

if TYPE_CHECKING:
    from .document_type import DocumentType
    from .person import Person
    from .reminder import DocumentReminder


class Document(Base, TimestampMixin):
    __tablename__ = "documents"
    __table_args__ = (
        CheckConstraint("status IN ('active', 'expired', 'archived')", name="ck_documents_status"),
        CheckConstraint("source IN ('manual', 'upload')", name="ck_documents_source"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id"), nullable=False, index=True)
    document_type_id: Mapped[int] = mapped_column(
        ForeignKey("document_types.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    issued_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    source: Mapped[str] = mapped_column(String(10), nullable=False, default="upload")
    document_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    issuing_authority: Mapped[str | None] = mapped_column(String(255), nullable=True)
    holder_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_fields: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    person: Mapped["Person"] = relationship(back_populates="documents")
    document_type: Mapped["DocumentType"] = relationship(back_populates="documents")
    files: Mapped[list["DocumentFile"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )
    extraction_runs: Mapped[list["DocumentExtractionRun"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )
    reminders: Mapped[list["DocumentReminder"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class DocumentFile(Base, TimestampMixin):
    __tablename__ = "document_files"

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    watermarked_file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    document: Mapped["Document"] = relationship(back_populates="files")
    extraction_runs: Mapped[list["DocumentExtractionRun"]] = relationship(
        back_populates="document_file"
    )


class DocumentExtractionRun(Base, TimestampMixin):
    __tablename__ = "document_extraction_runs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'success', 'failed')", name="ck_extraction_runs_status"
        ),
        CheckConstraint(
            "confidence IS NULL OR confidence IN ('high', 'medium', 'low')",
            name="ck_extraction_runs_confidence",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_file_id: Mapped[int | None] = mapped_column(
        ForeignKey("document_files.id", ondelete="SET NULL"), nullable=True, index=True
    )
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="success")
    extracted_document_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("document_types.id"), nullable=True, index=True
    )
    extracted_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    extracted_issued_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    extracted_expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    confidence: Mapped[str | None] = mapped_column(String(10), nullable=True)
    raw_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    document: Mapped["Document"] = relationship(back_populates="extraction_runs")
    document_file: Mapped["DocumentFile | None"] = relationship(back_populates="extraction_runs")
    extracted_document_type: Mapped["DocumentType | None"] = relationship(
        back_populates="extraction_runs"
    )
