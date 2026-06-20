"""Seed the dev database with demo users and documents for UI testing.

Usage: python -m neverexpire.db.seed_demo
"""
from datetime import date, timedelta

from .accounts import add_family_member, promote_to_admin, register_user
from .models import Document, DocumentType, User
from .session import get_session, init_engine

DEMO_PASSWORD = "Demo@1234"


def _doc(session, types, person, code, title, issued_offset, expiry_offset, **kw):
    today = date.today()
    doc = Document(
        person_id=person.id,
        document_type_id=types[code].id,
        title=title,
        issued_date=(today + timedelta(days=issued_offset)) if issued_offset is not None else None,
        expiry_date=(today + timedelta(days=expiry_offset)) if expiry_offset is not None else None,
        status="active",
        source="manual",
        **kw,
    )
    session.add(doc)
    return doc


def run() -> None:
    init_engine()
    with get_session() as session:
        if session.query(User).filter_by(email="alice@neverexpire.test").first():
            print("Demo data already seeded. Aborting.")
            return

        types = {dt.code: dt for dt in session.query(DocumentType).all()}
        if not types:
            print("No document types found — run seed.py first.")
            return

        # Admin
        admin_user, admin_person = register_user(session, "demoadmin@neverexpire.test", DEMO_PASSWORD, "Demo Admin")
        promote_to_admin(session, admin_user.email)
        _doc(session, types, admin_person, "OTHER", "Software License", -100, 365)

        # Alice's family
        alice_user, alice = register_user(session, "alice@neverexpire.test", DEMO_PASSWORD, "Alice Johnson", date(1990, 4, 12))
        _doc(session, types, alice, "PASSPORT", "Alice Passport", -365*3, 365*7,
             document_number="A12345678", issuing_authority="UAE ICA", holder_name="Alice Johnson")
        _doc(session, types, alice, "DRIVING_LICENSE", "Alice Driving License", -365, 365*4,
             document_number="DL-9988776")
        _doc(session, types, alice, "HEALTH_INSURANCE", "Family Health Insurance", -180, 60)
        _doc(session, types, alice, "VEHICLE_REGISTRATION", "Car Registration", -300, 15)

        bob, _ = add_family_member(session, alice.id, "Bob Johnson", "SPOUSE", date(1988, 7, 20))
        _doc(session, types, bob, "PASSPORT", "Bob Passport", -365*2, -10,
             document_number="B98765432", issuing_authority="UAE ICA", holder_name="Bob Johnson")
        _doc(session, types, bob, "VISA", "UAE Residence Visa", -365, 80)

        emma, _ = add_family_member(session, alice.id, "Emma Johnson", "CHILD", date(2015, 3, 5))
        _doc(session, types, emma, "PASSPORT", "Emma Passport", -365, 365*4,
             document_number="E11223344", holder_name="Emma Johnson")

        session.commit()
        print("Demo data seeded: alice@neverexpire.test / Demo@1234")


if __name__ == "__main__":
    run()
