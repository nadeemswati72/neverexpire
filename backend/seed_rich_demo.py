#!/usr/bin/env python3
"""
Rich two-family demo dataset for management presentation.

Family 1 — Al Rashid (5 members, 2 logins: Ahmed + Fatima)
Family 2 — Khan (6 members, 2 logins: Imran + Sara)

Covers: realistic UAE documents per person with mixed expiry statuses,
generated avatar + document-card images, and a full spread of sharing
scenarios (direct share, bulk person share, read/edit/download, expiry,
pending invite, revoked, cross-family) created via the real application
service functions so notifications + mock emails populate naturally.
"""
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from neverexpire import config
from neverexpire.db.accounts import add_family_member, register_user
from neverexpire.db.models import DocumentType, Person
from neverexpire.db.repository import add_document_file, create_manual_document
from neverexpire.db.session import get_session, init_engine
from neverexpire.db.sharing import (
    revoke_document_share,
    share_document_by_email,
    share_person_all_by_email,
)
import demo_assets

PASSWORD = "Demo@1234"
TODAY = date.today()


def d(days_offset: int) -> date:
    return TODAY + timedelta(days=days_offset)


def doc_type(session, code: str) -> DocumentType:
    return session.query(DocumentType).filter_by(code=code).first()


def make_person_avatar(session, person: Person, color_hex: str):
    initials = "".join(w[0] for w in person.full_name.split()[:2]).upper()
    filename = f"person_{person.id}.jpg"
    path = demo_assets.save_avatar(config.AVATAR_DIR, filename, initials, color_hex)
    person.photo_path = str(path)
    session.commit()


def add_document(
    session, person_id, doc_type_code, title, *,
    issued: date | None, expiry: date | None, doc_number: str,
    authority: str, holder: str, notes: str | None = None,
    card_title: str, card_subtitle: str, accent: str,
):
    dt = doc_type(session, doc_type_code)
    doc = create_manual_document(
        session,
        person_id=person_id,
        document_type=dt,
        title=title,
        issued_date=issued,
        expiry_date=expiry,
        document_number=doc_number,
        issuing_authority=authority,
        holder_name=holder,
        notes=notes,
    )

    fields = [("Full Name", holder), ("Document No.", doc_number)]
    if issued:
        fields.append(("Issued", issued.strftime("%d %b %Y")))
    if expiry:
        fields.append(("Expires", expiry.strftime("%d %b %Y")))
    else:
        fields.append(("Validity", "No expiry"))

    filename = f"doc_{doc.id}.jpg"
    img_path = demo_assets.save_document_card(
        config.UPLOAD_DIR, filename, card_title, card_subtitle, fields, accent
    )
    add_document_file(session, doc.id, img_path)
    return doc


def main():
    init_engine()

    with get_session() as session:
        # ============================================================
        # FAMILY 1 — AL RASHID (5 members, 2 logins)
        # ============================================================
        ahmed, ahmed_person = register_user(
            session, "ahmed.alrashid@neverexpire.test", PASSWORD, "Ahmed Al Rashid",
            date_of_birth=date(1982, 4, 12),
        )
        make_person_avatar(session, ahmed_person, "#34c9ba")

        fatima, fatima_person = register_user(
            session, "fatima.alrashid@neverexpire.test", PASSWORD, "Fatima Al Rashid",
            date_of_birth=date(1985, 9, 3),
        )
        make_person_avatar(session, fatima_person, "#e879a0")

        zain, _ = add_family_member(session, ahmed_person.id, "Zain Al Rashid", "CHILD", date(2015, 6, 20))
        make_person_avatar(session, zain, "#f6ad55")

        layla, _ = add_family_member(session, ahmed_person.id, "Layla Al Rashid", "CHILD", date(2018, 11, 2))
        make_person_avatar(session, layla, "#68d391")

        maria, _ = add_family_member(session, ahmed_person.id, "Maria Santos", "DOMESTIC_HELP", date(1990, 2, 14))
        make_person_avatar(session, maria, "#f6a5c0")

        # --- Ahmed's documents ---
        add_document(session, ahmed_person.id, "PASSPORT", "Ahmed Passport",
            issued=d(-1400), expiry=d(2100), doc_number="N7734215", authority="UAE ICA",
            holder="Ahmed Al Rashid", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, ahmed_person.id, "ID_CARD", "Ahmed Emirates ID",
            issued=d(-900), expiry=d(35), doc_number="784-1982-1234567-1", authority="UAE ICA",
            holder="Ahmed Al Rashid", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, ahmed_person.id, "VISA", "Ahmed UAE Residence Visa",
            issued=d(-750), expiry=d(-11), doc_number="V-88213445", authority="GDRFA Dubai",
            holder="Ahmed Al Rashid", card_title="RESIDENCE VISA", card_subtitle="United Arab Emirates", accent="#3182ce")
        add_document(session, ahmed_person.id, "DRIVING_LICENSE", "Ahmed Driving License",
            issued=d(-2000), expiry=d(1500), doc_number="DL-4471982", authority="Dubai RTA",
            holder="Ahmed Al Rashid", card_title="DRIVING LICENSE", card_subtitle="Dubai, UAE", accent="#805ad5")
        add_document(session, ahmed_person.id, "HEALTH_INSURANCE", "Ahmed Health Insurance",
            issued=d(-300), expiry=d(52), doc_number="HI-991234", authority="Daman",
            holder="Ahmed Al Rashid", card_title="HEALTH INSURANCE", card_subtitle="Daman Enhanced Plan", accent="#e53e3e")
        add_document(session, ahmed_person.id, "VEHICLE_REGISTRATION", "Ahmed Vehicle Registration",
            issued=d(-200), expiry=d(113), doc_number="REG-772104", authority="Dubai RTA",
            holder="Ahmed Al Rashid", card_title="VEHICLE REGISTRATION", card_subtitle="Mulkiya · Dubai RTA", accent="#805ad5")

        # --- Fatima's documents ---
        add_document(session, fatima_person.id, "PASSPORT", "Fatima Passport",
            issued=d(-1200), expiry=d(2200), doc_number="N8845221", authority="UAE ICA",
            holder="Fatima Al Rashid", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, fatima_person.id, "ID_CARD", "Fatima Emirates ID",
            issued=d(-800), expiry=d(600), doc_number="784-1985-7654321-2", authority="UAE ICA",
            holder="Fatima Al Rashid", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, fatima_person.id, "VISA", "Fatima UAE Residence Visa",
            issued=d(-700), expiry=d(40), doc_number="V-88213446", authority="GDRFA Dubai",
            holder="Fatima Al Rashid", card_title="RESIDENCE VISA", card_subtitle="United Arab Emirates", accent="#3182ce")
        add_document(session, fatima_person.id, "HEALTH_INSURANCE", "Fatima Health Insurance",
            issued=d(-300), expiry=d(400), doc_number="HI-991235", authority="Daman",
            holder="Fatima Al Rashid", card_title="HEALTH INSURANCE", card_subtitle="Daman Enhanced Plan", accent="#e53e3e")
        add_document(session, fatima_person.id, "DRIVING_LICENSE", "Fatima Driving License",
            issued=d(-1800), expiry=d(1200), doc_number="DL-4471983", authority="Dubai RTA",
            holder="Fatima Al Rashid", card_title="DRIVING LICENSE", card_subtitle="Dubai, UAE", accent="#805ad5")

        # --- Zain's documents (child) ---
        add_document(session, zain.id, "PASSPORT", "Zain Passport",
            issued=d(-400), expiry=d(1800), doc_number="N9021334", authority="UAE ICA",
            holder="Zain Al Rashid", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, zain.id, "ID_CARD", "Zain Emirates ID",
            issued=d(-400), expiry=d(700), doc_number="784-2015-1112223-3", authority="UAE ICA",
            holder="Zain Al Rashid", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, zain.id, "CERTIFICATE", "Zain School Enrollment Certificate",
            issued=d(-90), expiry=None, doc_number="SCH-2026-0451", authority="GEMS Wellington Academy",
            holder="Zain Al Rashid", card_title="CERTIFICATE", card_subtitle="School Enrollment", accent="#d69e2e")
        add_document(session, zain.id, "HEALTH_INSURANCE", "Zain Health Insurance",
            issued=d(-300), expiry=d(300), doc_number="HI-991236", authority="Daman",
            holder="Zain Al Rashid", card_title="HEALTH INSURANCE", card_subtitle="Daman Enhanced Plan", accent="#e53e3e")

        # --- Layla's documents (child) ---
        add_document(session, layla.id, "PASSPORT", "Layla Passport",
            issued=d(-300), expiry=d(1900), doc_number="N9021335", authority="UAE ICA",
            holder="Layla Al Rashid", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, layla.id, "ID_CARD", "Layla Emirates ID",
            issued=d(-300), expiry=d(28), doc_number="784-2018-3334445-4", authority="UAE ICA",
            holder="Layla Al Rashid", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, layla.id, "CERTIFICATE", "Layla Vaccination Certificate",
            issued=d(-500), expiry=None, doc_number="VAC-2024-8834", authority="Dubai Health Authority",
            holder="Layla Al Rashid", card_title="CERTIFICATE", card_subtitle="Vaccination Record", accent="#d69e2e")
        add_document(session, layla.id, "HEALTH_INSURANCE", "Layla Health Insurance",
            issued=d(-300), expiry=d(300), doc_number="HI-991237", authority="Daman",
            holder="Layla Al Rashid", card_title="HEALTH INSURANCE", card_subtitle="Daman Enhanced Plan", accent="#e53e3e")

        # --- Maria's documents (domestic help) ---
        add_document(session, maria.id, "PASSPORT", "Maria Passport",
            issued=d(-1000), expiry=d(1400), doc_number="P3345678", authority="DFA Philippines",
            holder="Maria Santos", card_title="PASSPORT", card_subtitle="Republic of the Philippines", accent="#22a99c")
        add_document(session, maria.id, "VISA", "Maria Employment Visa",
            issued=d(-340), expiry=d(25), doc_number="V-55219987", authority="MOHRE",
            holder="Maria Santos", card_title="EMPLOYMENT VISA", card_subtitle="United Arab Emirates", accent="#3182ce")
        add_document(session, maria.id, "CERTIFICATE", "Maria Employment Contract",
            issued=d(-340), expiry=None, doc_number="EC-2025-3391", authority="MOHRE",
            holder="Maria Santos", card_title="CERTIFICATE", card_subtitle="Employment Contract", accent="#d69e2e")
        add_document(session, maria.id, "HEALTH_INSURANCE", "Maria Health Insurance",
            issued=d(-340), expiry=d(25), doc_number="HI-991238", authority="Daman",
            holder="Maria Santos", card_title="HEALTH INSURANCE", card_subtitle="Daman Basic Plan", accent="#e53e3e")

        session.commit()
        print("Family 1 (Al Rashid) seeded: 5 members")

        # ============================================================
        # FAMILY 2 — KHAN (6 members, 2 logins)
        # ============================================================
        imran, imran_person = register_user(
            session, "imran.khan@neverexpire.test", PASSWORD, "Imran Khan",
            date_of_birth=date(1980, 1, 22),
        )
        make_person_avatar(session, imran_person, "#3182ce")

        sara, sara_person = register_user(
            session, "sara.khan@neverexpire.test", PASSWORD, "Sara Khan",
            date_of_birth=date(1983, 5, 30),
        )
        make_person_avatar(session, sara_person, "#d53f8c")

        ibrahim, _ = add_family_member(session, imran_person.id, "Ibrahim Khan", "CHILD", date(2012, 3, 15))
        make_person_avatar(session, ibrahim, "#f6ad55")

        yusuf, _ = add_family_member(session, imran_person.id, "Yusuf Khan", "CHILD", date(2016, 8, 9))
        make_person_avatar(session, yusuf, "#68d391")

        amina, _ = add_family_member(session, imran_person.id, "Amina Khan", "CHILD", date(2019, 12, 1))
        make_person_avatar(session, amina, "#76e4f7")

        rosalinda, _ = add_family_member(session, imran_person.id, "Rosalinda Cruz", "DOMESTIC_HELP", date(1988, 7, 19))
        make_person_avatar(session, rosalinda, "#f6a5c0")

        # --- Imran's documents ---
        add_document(session, imran_person.id, "PASSPORT", "Imran Passport",
            issued=d(-1600), expiry=d(2300), doc_number="N5512098", authority="UAE ICA",
            holder="Imran Khan", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, imran_person.id, "ID_CARD", "Imran Emirates ID",
            issued=d(-900), expiry=d(500), doc_number="784-1980-9988776-5", authority="UAE ICA",
            holder="Imran Khan", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, imran_person.id, "VISA", "Imran UAE Residence Visa",
            issued=d(-800), expiry=d(-5), doc_number="V-77213321", authority="GDRFA Sharjah",
            holder="Imran Khan", card_title="RESIDENCE VISA", card_subtitle="United Arab Emirates", accent="#3182ce")
        add_document(session, imran_person.id, "DRIVING_LICENSE", "Imran Driving License",
            issued=d(-2200), expiry=d(1600), doc_number="DL-2261980", authority="Sharjah Police",
            holder="Imran Khan", card_title="DRIVING LICENSE", card_subtitle="Sharjah, UAE", accent="#805ad5")
        add_document(session, imran_person.id, "HEALTH_INSURANCE", "Imran Health Insurance",
            issued=d(-300), expiry=d(60), doc_number="HI-881122", authority="AXA Gulf",
            holder="Imran Khan", card_title="HEALTH INSURANCE", card_subtitle="AXA Silver Plan", accent="#e53e3e")
        add_document(session, imran_person.id, "VEHICLE_REGISTRATION", "Imran Vehicle Registration",
            issued=d(-150), expiry=d(215), doc_number="REG-551209", authority="Sharjah Police",
            holder="Imran Khan", card_title="VEHICLE REGISTRATION", card_subtitle="Mulkiya · Sharjah Police", accent="#805ad5")

        # --- Sara's documents ---
        add_document(session, sara_person.id, "PASSPORT", "Sara Passport",
            issued=d(-1300), expiry=d(2400), doc_number="N6623109", authority="UAE ICA",
            holder="Sara Khan", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, sara_person.id, "ID_CARD", "Sara Emirates ID",
            issued=d(-850), expiry=d(30), doc_number="784-1983-4455667-6", authority="UAE ICA",
            holder="Sara Khan", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, sara_person.id, "VISA", "Sara UAE Residence Visa",
            issued=d(-750), expiry=d(500), doc_number="V-77213322", authority="GDRFA Sharjah",
            holder="Sara Khan", card_title="RESIDENCE VISA", card_subtitle="United Arab Emirates", accent="#3182ce")
        add_document(session, sara_person.id, "HEALTH_INSURANCE", "Sara Health Insurance",
            issued=d(-300), expiry=d(400), doc_number="HI-881123", authority="AXA Gulf",
            holder="Sara Khan", card_title="HEALTH INSURANCE", card_subtitle="AXA Silver Plan", accent="#e53e3e")
        add_document(session, sara_person.id, "DRIVING_LICENSE", "Sara Driving License",
            issued=d(-1900), expiry=d(1300), doc_number="DL-2261981", authority="Sharjah Police",
            holder="Sara Khan", card_title="DRIVING LICENSE", card_subtitle="Sharjah, UAE", accent="#805ad5")

        # --- Ibrahim's documents (child) ---
        add_document(session, ibrahim.id, "PASSPORT", "Ibrahim Passport",
            issued=d(-500), expiry=d(1700), doc_number="N7734556", authority="UAE ICA",
            holder="Ibrahim Khan", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, ibrahim.id, "ID_CARD", "Ibrahim Emirates ID",
            issued=d(-500), expiry=d(600), doc_number="784-2012-1231231-7", authority="UAE ICA",
            holder="Ibrahim Khan", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, ibrahim.id, "CERTIFICATE", "Ibrahim School Certificate",
            issued=d(-90), expiry=None, doc_number="SCH-2026-0912", authority="Sharjah American International School",
            holder="Ibrahim Khan", card_title="CERTIFICATE", card_subtitle="School Enrollment", accent="#d69e2e")
        add_document(session, ibrahim.id, "HEALTH_INSURANCE", "Ibrahim Health Insurance",
            issued=d(-300), expiry=d(45), doc_number="HI-881124", authority="AXA Gulf",
            holder="Ibrahim Khan", card_title="HEALTH INSURANCE", card_subtitle="AXA Silver Plan", accent="#e53e3e")

        # --- Yusuf's documents (child) ---
        add_document(session, yusuf.id, "PASSPORT", "Yusuf Passport",
            issued=d(-350), expiry=d(1900), doc_number="N7734557", authority="UAE ICA",
            holder="Yusuf Khan", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, yusuf.id, "ID_CARD", "Yusuf Emirates ID",
            issued=d(-350), expiry=d(650), doc_number="784-2016-4564564-8", authority="UAE ICA",
            holder="Yusuf Khan", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, yusuf.id, "CERTIFICATE", "Yusuf Vaccination Certificate",
            issued=d(-600), expiry=None, doc_number="VAC-2024-2216", authority="Sharjah Health Authority",
            holder="Yusuf Khan", card_title="CERTIFICATE", card_subtitle="Vaccination Record", accent="#d69e2e")

        # --- Amina's documents (child) ---
        add_document(session, amina.id, "PASSPORT", "Amina Passport",
            issued=d(-200), expiry=d(2000), doc_number="N7734558", authority="UAE ICA",
            holder="Amina Khan", card_title="PASSPORT", card_subtitle="United Arab Emirates", accent="#22a99c")
        add_document(session, amina.id, "ID_CARD", "Amina Emirates ID",
            issued=d(-200), expiry=d(32), doc_number="784-2019-7897897-9", authority="UAE ICA",
            holder="Amina Khan", card_title="EMIRATES ID", card_subtitle="Identity Card", accent="#22a99c")
        add_document(session, amina.id, "CERTIFICATE", "Amina Nursery Enrollment Certificate",
            issued=d(-60), expiry=None, doc_number="SCH-2026-1187", authority="Blossom Nursery Sharjah",
            holder="Amina Khan", card_title="CERTIFICATE", card_subtitle="Nursery Enrollment", accent="#d69e2e")
        add_document(session, amina.id, "HEALTH_INSURANCE", "Amina Health Insurance",
            issued=d(-300), expiry=d(300), doc_number="HI-881125", authority="AXA Gulf",
            holder="Amina Khan", card_title="HEALTH INSURANCE", card_subtitle="AXA Silver Plan", accent="#e53e3e")

        # --- Rosalinda's documents (domestic help) ---
        add_document(session, rosalinda.id, "PASSPORT", "Rosalinda Passport",
            issued=d(-1100), expiry=d(1300), doc_number="P4456789", authority="DFA Philippines",
            holder="Rosalinda Cruz", card_title="PASSPORT", card_subtitle="Republic of the Philippines", accent="#22a99c")
        add_document(session, rosalinda.id, "VISA", "Rosalinda Employment Visa",
            issued=d(-400), expiry=d(-18), doc_number="V-55219988", authority="MOHRE",
            holder="Rosalinda Cruz", card_title="EMPLOYMENT VISA", card_subtitle="United Arab Emirates", accent="#3182ce")
        add_document(session, rosalinda.id, "CERTIFICATE", "Rosalinda Employment Contract",
            issued=d(-400), expiry=None, doc_number="EC-2024-7712", authority="MOHRE",
            holder="Rosalinda Cruz", card_title="CERTIFICATE", card_subtitle="Employment Contract", accent="#d69e2e")
        add_document(session, rosalinda.id, "HEALTH_INSURANCE", "Rosalinda Health Insurance",
            issued=d(-400), expiry=d(-18), doc_number="HI-881126", authority="AXA Gulf",
            holder="Rosalinda Cruz", card_title="HEALTH INSURANCE", card_subtitle="AXA Basic Plan", accent="#e53e3e")

        session.commit()
        print("Family 2 (Khan) seeded: 6 members")

        # Cache doc lookups for sharing scenarios (by title, unique enough here)
        from neverexpire.db.models import Document

        def doc_by_title(title: str) -> Document:
            return session.query(Document).filter_by(title=title).one()

        zain_passport = doc_by_title("Zain Passport")
        fatima_health = doc_by_title("Fatima Health Insurance")
        maria_visa = doc_by_title("Maria Employment Visa")
        ahmed_passport = doc_by_title("Ahmed Passport")
        ibrahim_cert = doc_by_title("Ibrahim School Certificate")
        imran_vehicle = doc_by_title("Imran Vehicle Registration")
        imran_license = doc_by_title("Imran Driving License")
        sara_emirates_id = doc_by_title("Sara Emirates ID")

        # ============================================================
        # SHARING SCENARIOS
        # ============================================================

        # 1. Direct share, spouse to spouse, read-only, no expiry
        share_document_by_email(
            session, document_id=zain_passport.id, shared_by_user_id=ahmed.id,
            recipient_email="fatima.alrashid@neverexpire.test", permission_level="read",
        )

        # 2. Bulk person share — all of Layla's documents, download permission, future docs included
        share_person_all_by_email(
            session, person_id=layla.id, granted_by_user_id=ahmed.id,
            recipient_email="fatima.alrashid@neverexpire.test", permission_level="download",
            include_future=True,
        )

        # 3. Spouse shares back with edit permission
        share_document_by_email(
            session, document_id=fatima_health.id, shared_by_user_id=fatima.id,
            recipient_email="ahmed.alrashid@neverexpire.test", permission_level="edit",
        )

        # 4. Time-limited share (domestic help's visa, 30-day access while Ahmed travels)
        share_document_by_email(
            session, document_id=maria_visa.id, shared_by_user_id=ahmed.id,
            recipient_email="fatima.alrashid@neverexpire.test", permission_level="read",
            expires_at=datetime.utcnow() + timedelta(days=30),
        )

        # 5. Family 2: direct share, spouse to spouse
        share_document_by_email(
            session, document_id=ibrahim_cert.id, shared_by_user_id=imran.id,
            recipient_email="sara.khan@neverexpire.test", permission_level="read",
        )

        # 6. Family 2: bulk share, domestic help's documents
        share_person_all_by_email(
            session, person_id=rosalinda.id, granted_by_user_id=imran.id,
            recipient_email="sara.khan@neverexpire.test", permission_level="download",
        )

        # 7. Cross-family share (friends sharing vehicle registration for insurance reference)
        share_document_by_email(
            session, document_id=imran_vehicle.id, shared_by_user_id=imran.id,
            recipient_email="fatima.alrashid@neverexpire.test", permission_level="read",
        )

        # 8. Pending invite (not yet accepted) — cross-family
        share_document_by_email(
            session, document_id=ahmed_passport.id, shared_by_user_id=ahmed.id,
            recipient_email="sara.khan@neverexpire.test", permission_level="read", is_invite=True,
        )

        # 9. Revoked share (creates a papertrail: mock revoke email + notification)
        result = share_document_by_email(
            session, document_id=imran_license.id, shared_by_user_id=imran.id,
            recipient_email="fatima.alrashid@neverexpire.test", permission_level="read",
        )
        revoke_document_share(session, result["share_id"])

        # 10. Already-expired share (so the UI shows "Expired" immediately, no waiting)
        result = share_document_by_email(
            session, document_id=sara_emirates_id.id, shared_by_user_id=sara.id,
            recipient_email="fatima.alrashid@neverexpire.test", permission_level="read",
            expires_at=datetime.utcnow() + timedelta(days=5),
        )
        from neverexpire.db.models import DocumentShare
        expired_share = session.query(DocumentShare).filter_by(id=result["share_id"]).first()
        expired_share.expires_at = datetime.utcnow() - timedelta(days=5)
        session.commit()

        print("Sharing scenarios created: 10")

        # ============================================================
        # ACCESS AUDIT TRAIL — a few simulated view/download events
        # ============================================================
        from neverexpire.db.models import DocumentAccessLog

        session.add_all([
            DocumentAccessLog(document_id=zain_passport.id, user_id=fatima.id, action="view",
                               created_at=datetime.utcnow() - timedelta(days=3)),
            DocumentAccessLog(document_id=zain_passport.id, user_id=fatima.id, action="view",
                               created_at=datetime.utcnow() - timedelta(days=1)),
            DocumentAccessLog(document_id=maria_visa.id, user_id=fatima.id, action="download",
                               created_at=datetime.utcnow() - timedelta(hours=6)),
            DocumentAccessLog(document_id=ibrahim_cert.id, user_id=sara.id, action="view",
                               created_at=datetime.utcnow() - timedelta(days=2)),
        ])
        session.commit()
        print("Access audit trail entries created: 4")

    print("\nDone. Login accounts (password: Demo@1234 for all):")
    print("  ahmed.alrashid@neverexpire.test   (Al Rashid family, 5 members)")
    print("  fatima.alrashid@neverexpire.test  (Al Rashid family)")
    print("  imran.khan@neverexpire.test       (Khan family, 6 members)")
    print("  sara.khan@neverexpire.test        (Khan family)")


if __name__ == "__main__":
    main()
