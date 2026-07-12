from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base, utcnow

if TYPE_CHECKING:
    from .document import Document
    from .user import User


class DocumentAccessLog(Base):
    """Records who viewed or downloaded a document's file, and when."""
    __tablename__ = "document_access_logs"
    __table_args__ = (
        CheckConstraint("action IN ('view', 'download')", name="ck_document_access_logs_action"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(10), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False)

    document: Mapped["Document"] = relationship(viewonly=True)
    user: Mapped["User"] = relationship(viewonly=True)
