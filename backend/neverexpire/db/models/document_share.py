from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base, TimestampMixin

if TYPE_CHECKING:
    from .document import Document
    from .person import Person
    from .user import User


class DocumentShare(Base, TimestampMixin):
    """
    Represents sharing of a single document with another user.

    One document can be shared with multiple users at different permission levels.
    """
    __tablename__ = "document_shares"
    __table_args__ = (
        CheckConstraint(
            "permission_level IN ('read', 'edit', 'download')",
            name="ck_document_shares_permission_level",
        ),
        CheckConstraint(
            "shared_by_user_id != shared_with_user_id",
            name="ck_document_shares_not_self",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    shared_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    shared_with_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    permission_level: Mapped[str] = mapped_column(String(20), nullable=False, default="read")
    is_invite: Mapped[bool] = mapped_column(Boolean, default=False)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    response: Mapped[str | None] = mapped_column(String(20), nullable=True)  # 'accepted' or 'declined'
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    document: Mapped["Document"] = relationship(back_populates="shares")
    shared_by_user: Mapped["User"] = relationship(
        foreign_keys=[shared_by_user_id], viewonly=True
    )
    shared_with_user: Mapped["User"] = relationship(
        foreign_keys=[shared_with_user_id], viewonly=True
    )


class PersonShareGrant(Base, TimestampMixin):
    """
    Represents bulk sharing of all documents for a person with another user.

    Grants access to current + optionally future documents for a family member.
    """
    __tablename__ = "person_share_grants"
    __table_args__ = (
        CheckConstraint(
            "permission_level IN ('read', 'edit', 'download')",
            name="ck_person_share_grants_permission_level",
        ),
        CheckConstraint(
            "granted_by_user_id != granted_to_user_id",
            name="ck_person_share_grants_not_self",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    granted_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    granted_to_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    permission_level: Mapped[str] = mapped_column(String(20), nullable=False, default="read")
    include_future: Mapped[bool] = mapped_column(Boolean, default=False)
    is_invite: Mapped[bool] = mapped_column(Boolean, default=False)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    response: Mapped[str | None] = mapped_column(String(20), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    person: Mapped["Person"] = relationship(back_populates="share_grants")
    granted_by_user: Mapped["User"] = relationship(
        foreign_keys=[granted_by_user_id], viewonly=True
    )
    granted_to_user: Mapped["User"] = relationship(
        foreign_keys=[granted_to_user_id], viewonly=True
    )
