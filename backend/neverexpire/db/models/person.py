from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..base import Base, TimestampMixin

if TYPE_CHECKING:
    from .document import Document
    from .user import User


class Person(Base, TimestampMixin):
    __tablename__ = "persons"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    photo_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    user: Mapped["User"] = relationship(back_populates="persons")
    documents: Mapped[list["Document"]] = relationship(back_populates="person")
    relationships_from: Mapped[list["PersonRelationship"]] = relationship(
        back_populates="person",
        foreign_keys="PersonRelationship.person_id",
    )
    relationships_to: Mapped[list["PersonRelationship"]] = relationship(
        back_populates="related_person",
        foreign_keys="PersonRelationship.related_person_id",
    )


class FamilyRelationType(Base, TimestampMixin):
    __tablename__ = "family_relation_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    person_relationships: Mapped[list["PersonRelationship"]] = relationship(
        back_populates="relation_type"
    )


class PersonRelationship(Base, TimestampMixin):
    __tablename__ = "person_relationships"
    __table_args__ = (
        UniqueConstraint(
            "person_id", "related_person_id", "relation_type_id",
            name="uq_person_relationship",
        ),
        CheckConstraint("person_id != related_person_id", name="ck_person_relationship_not_self"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    related_person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    relation_type_id: Mapped[int] = mapped_column(
        ForeignKey("family_relation_types.id"), nullable=False, index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    person: Mapped["Person"] = relationship(
        back_populates="relationships_from", foreign_keys=[person_id]
    )
    related_person: Mapped["Person"] = relationship(
        back_populates="relationships_to", foreign_keys=[related_person_id]
    )
    relation_type: Mapped["FamilyRelationType"] = relationship(back_populates="person_relationships")
