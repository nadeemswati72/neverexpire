"""One-off script: populates the dev database with demo users, family members,
and a varied set of documents (different types, expiry states, and extra
field data) for manual UI testing.

Usage: python -m neverexpire.db.seed_demo
"""

from datetime import date, timedelta

from .accounts import add_family_member, promote_to_admin, register_user
from .models import Document, DocumentType, User
from .reminders import generate_due_reminders
from .session import SessionLocal

DEMO_PASSWORD = "Demo@1234"


def _doc(session, types, person, code, title, issued_offset, expiry_offset, extra_fields=None):
    today = date.today()
    document = Document(
        person_id=person.id,
        document_type_id=types[code].id,
        title=title,
        issued_date=(today + timedelta(days=issued_offset)) if issued_offset is not None else None,
        expiry_date=(today + timedelta(days=expiry_offset)) if expiry_offset is not None else None,
        status="active",
        source="manual",
        extra_fields=extra_fields,
    )
    session.add(document)
    return document


def run() -> None:
    with SessionLocal() as session:
        if session.query(User).filter_by(email="alice@neverexpire.test").first():
            print("Demo data already seeded (alice@neverexpire.test exists). Aborting.")
            return

        types = {dt.code: dt for dt in session.query(DocumentType).all()}

        # --- Admin -------------------------------------------------------------
        admin_user, admin_person = register_user(session, "demoadmin@neverexpire.test", DEMO_PASSWORD, "Demo Admin")
        promote_to_admin(session, admin_user.email)
        _doc(session, types, admin_person, "OTHER", "Software License - JetBrains", -100, 365)

        # --- Alice Johnson family ------------------------------------------------
        alice_user, alice = register_user(
            session, "alice@neverexpire.test", DEMO_PASSWORD, "Alice Johnson", date(1990, 4, 12)
        )
        _doc(session, types, alice, "PASSPORT", "India Passport - Alice Johnson", -1825, 900,
             extra_fields={"passport_number": "Z1234567", "nationality": "Indian", "issuing_country": "India"})
        _doc(session, types, alice, "INSURANCE", "Health Insurance - Alice", -300, 20,
             extra_fields={"policy_number": "HI-998877", "provider": "Star Health"})
        _doc(session, types, alice, "OTHER", "Driving License", -1000, 10)
        _doc(session, types, alice, "SUBSCRIPTION", "Gym Membership", -400, -5)

        mark, _ = add_family_member(session, alice.id, "Mark Johnson", "SPOUSE", date(1988, 11, 2))
        _doc(session, types, mark, "PASSPORT", "USA Passport - Mark Johnson", -1500, 25,
             extra_fields={"passport_number": "US9988776", "nationality": "American", "issuing_country": "USA"})
        _doc(session, types, mark, "WARRANTY", "Car Warranty - Honda Civic", -730, -15)
        _doc(session, types, mark, "CERTIFICATE", "Marriage Certificate", -2000, None,
             extra_fields={"issuer": "Registrar of Marriages"})

        emma, _ = add_family_member(session, alice.id, "Emma Johnson", "CHILD", date(2018, 6, 1))
        _doc(session, types, emma, "CERTIFICATE", "Birth Certificate - Emma Johnson", -2900, None,
             extra_fields={"issuer": "Municipal Corporation"})
        _doc(session, types, emma, "OTHER", "School ID Card", -100, 12)
        _doc(session, types, emma, "MEDICATION", "Allergy Medication", -10, 40)

        # --- Bilal Khan family ---------------------------------------------------
        bilal_user, bilal = register_user(
            session, "bilal@neverexpire.test", DEMO_PASSWORD, "Bilal Khan", date(1985, 2, 20)
        )
        _doc(session, types, bilal, "PASSPORT", "Pakistan Passport - Bilal Khan", -2000, -30,
             extra_fields={"passport_number": "PK1122334", "nationality": "Pakistani", "issuing_country": "Pakistan"})
        _doc(session, types, bilal, "INSURANCE", "Term Life Insurance", -600, 1200,
             extra_fields={"policy_number": "TL-554433", "provider": "LIC"})
        _doc(session, types, bilal, "WARRANTY", "Phone Warranty - iPhone 15", -300, 18)
        _doc(session, types, bilal, "CERTIFICATE", "Degree Certificate", -3000, None,
             extra_fields={"issuer": "University of Karachi"})

        sara, _ = add_family_member(session, bilal.id, "Sara Khan", "SPOUSE", date(1990, 9, 15))
        _doc(session, types, sara, "PASSPORT", "Pakistan Passport - Sara Khan", -1800, 600,
             extra_fields={"passport_number": "PK5566778", "nationality": "Pakistani", "issuing_country": "Pakistan"})
        _doc(session, types, sara, "INSURANCE", "Health Insurance - Sara", -400, -3,
             extra_fields={"policy_number": "HI-112233", "provider": "Jubilee Insurance"})
        _doc(session, types, sara, "SUBSCRIPTION", "Cooking Gas Connection", -60, 8)

        yusuf, _ = add_family_member(session, bilal.id, "Yusuf Khan", "PARENT", date(1958, 1, 10))
        _doc(session, types, yusuf, "INSURANCE", "Senior Citizen Health Insurance", -350, 27,
             extra_fields={"policy_number": "SC-778899", "provider": "Star Health"})
        _doc(session, types, yusuf, "MEDICATION", "Blood Pressure Tablets", -5, 20)
        _doc(session, types, yusuf, "CERTIFICATE", "Property Ownership Certificate", -5000, None,
             extra_fields={"issuer": "Land Registry Office"})

        # --- Carla Mendes family --------------------------------------------------
        carla_user, carla = register_user(
            session, "carla@neverexpire.test", DEMO_PASSWORD, "Carla Mendes", date(1992, 7, 30)
        )
        _doc(session, types, carla, "PASSPORT", "Brazil Passport - Carla Mendes", -1200, 1500,
             extra_fields={"passport_number": "BR3344556", "nationality": "Brazilian", "issuing_country": "Brazil"})
        _doc(session, types, carla, "INSURANCE", "Car Insurance - Toyota Corolla", -200, 22,
             extra_fields={"policy_number": "CI-665544", "provider": "Bajaj Allianz"})
        _doc(session, types, carla, "WARRANTY", "Laptop Warranty - Dell XPS", -100, 400)
        _doc(session, types, carla, "SUBSCRIPTION", "Netflix Subscription", -370, -10)

        diego, _ = add_family_member(session, carla.id, "Diego Mendes", "SIBLING", date(1995, 3, 22))
        _doc(session, types, diego, "PASSPORT", "Brazil Passport - Diego Mendes", -900, 29,
             extra_fields={"passport_number": "BR7788990", "nationality": "Brazilian", "issuing_country": "Brazil"})
        _doc(session, types, diego, "INSURANCE", "Travel Insurance", -50, 700)
        _doc(session, types, diego, "FOOD_ITEM", "Protein Powder", -60, -2)

        session.commit()
        generate_due_reminders(session)

    print("Demo data seeded. Password for all accounts below:", DEMO_PASSWORD)
    print()
    print(f"{'Email':<28} {'Role':<6} Notes")
    print(f"{'demoadmin@neverexpire.test':<28} {'admin':<6} Admin dashboard / master data")
    print(f"{'alice@neverexpire.test':<28} {'user':<6} Alice Johnson + spouse Mark + child Emma")
    print(f"{'bilal@neverexpire.test':<28} {'user':<6} Bilal Khan + spouse Sara + parent Yusuf")
    print(f"{'carla@neverexpire.test':<28} {'user':<6} Carla Mendes + sibling Diego")


if __name__ == "__main__":
    run()
