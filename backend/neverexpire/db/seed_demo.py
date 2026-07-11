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

        # ========== USER 1: ALICE ==========
        alice_user, alice = register_user(session, "alice@neverexpire.test", DEMO_PASSWORD, "Alice Johnson", date(1990, 4, 12))
        _doc(session, types, alice, "PASSPORT", "Alice Passport", -365*3, 365*7,
             document_number="A12345678", issuing_authority="UAE ICA", holder_name="Alice Johnson")
        _doc(session, types, alice, "DRIVING_LICENSE", "Alice Driving License", -365, 365*4,
             document_number="DL-9988776")
        _doc(session, types, alice, "HEALTH_INSURANCE", "Alice Health Insurance", -180, 60)
        _doc(session, types, alice, "VEHICLE_REGISTRATION", "Alice Car Registration", -300, 15)

        # ========== USER 2: BOB (Independent User, not family) ==========
        bob_user, bob = register_user(session, "bob@neverexpire.test", DEMO_PASSWORD, "Bob Smith", date(1988, 7, 20))
        _doc(session, types, bob, "PASSPORT", "Bob Passport", -365*2, -10,
             document_number="B98765432", issuing_authority="UAE ICA", holder_name="Bob Smith")
        _doc(session, types, bob, "VISA", "Bob UAE Residence Visa", -365, 80)
        _doc(session, types, bob, "DRIVING_LICENSE", "Bob Driving License", -200, 365*3,
             document_number="DL-5544332")
        _doc(session, types, bob, "HEALTH_INSURANCE", "Bob Health Insurance", -150, 90)

        # ========== USER 3: CAROL (Independent User) ==========
        carol_user, carol = register_user(session, "carol@neverexpire.test", DEMO_PASSWORD, "Carol Davis", date(1995, 11, 8))
        _doc(session, types, carol, "PASSPORT", "Carol Passport", -365, 365*5,
             document_number="C55667788", issuing_authority="UAE ICA", holder_name="Carol Davis")
        _doc(session, types, carol, "HEALTH_INSURANCE", "Carol Health Insurance", -100, 150)
        _doc(session, types, carol, "VEHICLE_REGISTRATION", "Carol Car Registration", -250, 200)

        session.commit()
        print("Demo data seeded with 3 independent users:")
        print("  1. alice@neverexpire.test / Demo@1234 (ID: 1)")
        print("  2. bob@neverexpire.test / Demo@1234 (ID: 2)")
        print("  3. carol@neverexpire.test / Demo@1234 (ID: 3)")


if __name__ == "__main__":
    run()
