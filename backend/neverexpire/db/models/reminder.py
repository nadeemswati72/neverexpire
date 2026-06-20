from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base, TimestampMixin

if TYPE_CHECKING:
    from .document import Document


class ReminderRule(Base, TimestampMixin):
    __tablename__ = "reminder_rules"
    __table_args__ = (
        UniqueConstraint("threshold_days", name="uq_reminder_rules_threshold_days"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    threshold_days: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    document_reminders: Mapped[list["DocumentReminder"]] = relationship(
        back_populates="reminder_rule"
    )


class DocumentReminder(Base, TimestampMixin):
    __tablename__ = "document_reminders"
    __table_args__ = (
        UniqueConstraint("document_id", "reminder_rule_id", name="uq_document_reminder"),
        CheckConstraint(
            "status IN ('pending', 'sent', 'dismissed')", name="ck_document_reminders_status"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reminder_rule_id: Mapped[int] = mapped_column(
        ForeignKey("reminder_rules.id"), nullable=False, index=True
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    document: Mapped["Document"] = relationship(back_populates="reminders")
    reminder_rule: Mapped["ReminderRule"] = relationship(back_populates="document_reminders")
