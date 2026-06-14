"""Sample/mock data for the NeverExpire Streamlit dashboard.

All data here is hardcoded so the dashboard can be built and demoed before
it is wired up to the real Flask backend and database.
"""

from datetime import date
from typing import TypedDict


class FamilyMember(TypedDict):
    """A selectable entry in the family member filter row."""

    id: str
    name: str
    relationship: str
    avatar: str


class Document(TypedDict):
    """A single tracked document belonging to a family member."""

    id: int
    document_type: str
    holder_name: str
    relationship: str
    document_number: str
    issue_date: date | None
    expiry_date: date | None
    issuing_country: str
    tags: list[str]
    review_status: str
    category: str


FAMILY_MEMBERS: list[FamilyMember] = [
    {"id": "all", "name": "All", "relationship": "All", "avatar": "👤"},
    {"id": "self", "name": "Self", "relationship": "Self", "avatar": "👤"},
    {"id": "arham", "name": "Arham", "relationship": "Son", "avatar": "👦"},
    {"id": "sara", "name": "Sara", "relationship": "Daughter", "avatar": "👧"},
    {"id": "fatima", "name": "Fatima", "relationship": "Wife", "avatar": "👩"},
]


SAMPLE_DOCUMENTS: list[Document] = [
    # --- Expired (2) ---
    {
        "id": 1,
        "document_type": "Emirates ID",
        "holder_name": "Nadeem Ahmad",
        "relationship": "Self",
        "document_number": "784198512345670",
        "issue_date": date(2021, 5, 29),
        "expiry_date": date(2026, 5, 29),
        "issuing_country": "UAE",
        "tags": ["identity", "uae", "personal"],
        "review_status": "reviewed",
        "category": "Identity Documents",
    },
    {
        "id": 2,
        "document_type": "Passport",
        "holder_name": "Arham Ahmad",
        "relationship": "Son",
        "document_number": "N9876543",
        "issue_date": date(2016, 6, 5),
        "expiry_date": date(2026, 6, 5),
        "issuing_country": "India",
        "tags": ["passport", "india", "personal"],
        "review_status": "reviewed",
        "category": "Travel Documents",
    },
    # --- Expiring within 90 days (3) ---
    {
        "id": 3,
        "document_type": "Driving License",
        "holder_name": "Fatima Ahmad",
        "relationship": "Wife",
        "document_number": "DXB-1234567",
        "issue_date": date(2016, 7, 28),
        "expiry_date": date(2026, 7, 28),
        "issuing_country": "UAE",
        "tags": ["driving", "uae", "personal"],
        "review_status": "reviewed",
        "category": "Vehicle Documents",
    },
    {
        "id": 4,
        "document_type": "Health Insurance Card",
        "holder_name": "Sara Ahmad",
        "relationship": "Daughter",
        "document_number": "POL-9876543",
        "issue_date": date(2025, 8, 12),
        "expiry_date": date(2026, 8, 12),
        "issuing_country": "UAE",
        "tags": ["insurance", "health", "family"],
        "review_status": "reviewed",
        "category": "Insurance Documents",
    },
    {
        "id": 5,
        "document_type": "Vehicle Registration",
        "holder_name": "Nadeem Ahmad",
        "relationship": "Self",
        "document_number": "RC-554433",
        "issue_date": date(2025, 8, 27),
        "expiry_date": date(2026, 8, 27),
        "issuing_country": "UAE",
        "tags": ["vehicle", "uae", "personal"],
        "review_status": "reviewed",
        "category": "Vehicle Documents",
    },
    # --- Valid, far future expiry (4) ---
    {
        "id": 6,
        "document_type": "Passport",
        "holder_name": "Nadeem Ahmad",
        "relationship": "Self",
        "document_number": "M1234567",
        "issue_date": date(2020, 1, 20),
        "expiry_date": date(2030, 1, 19),
        "issuing_country": "India",
        "tags": ["passport", "india", "travel"],
        "review_status": "reviewed",
        "category": "Travel Documents",
    },
    {
        "id": 7,
        "document_type": "Professional Certificate",
        "holder_name": "Nadeem Ahmad",
        "relationship": "Self",
        "document_number": "PMP-2245789",
        "issue_date": date(2023, 3, 15),
        "expiry_date": date(2029, 3, 15),
        "issuing_country": "USA",
        "tags": ["certificate", "professional", "career"],
        "review_status": "reviewed",
        "category": "Education Documents",
    },
    {
        "id": 8,
        "document_type": "Health Insurance Card",
        "holder_name": "Arham Ahmad",
        "relationship": "Son",
        "document_number": "POL-1122334",
        "issue_date": date(2025, 1, 10),
        "expiry_date": date(2028, 1, 10),
        "issuing_country": "UAE",
        "tags": ["insurance", "health", "family"],
        "review_status": "reviewed",
        "category": "Insurance Documents",
    },
    {
        "id": 9,
        "document_type": "Vehicle Insurance",
        "holder_name": "Fatima Ahmad",
        "relationship": "Wife",
        "document_number": "VINS-778899",
        "issue_date": date(2025, 11, 1),
        "expiry_date": date(2031, 11, 1),
        "issuing_country": "UAE",
        "tags": ["insurance", "vehicle", "uae"],
        "review_status": "reviewed",
        "category": "Insurance Documents",
    },
    # --- No expiry (3) ---
    {
        "id": 10,
        "document_type": "University Degree",
        "holder_name": "Nadeem Ahmad",
        "relationship": "Self",
        "document_number": "DEG-2008-4456",
        "issue_date": date(2008, 6, 20),
        "expiry_date": None,
        "issuing_country": "India",
        "tags": ["education", "degree", "personal"],
        "review_status": "reviewed",
        "category": "Education Documents",
    },
    {
        "id": 11,
        "document_type": "Birth Certificate",
        "holder_name": "Sara Ahmad",
        "relationship": "Daughter",
        "document_number": "BC-2014-7789",
        "issue_date": date(2014, 9, 3),
        "expiry_date": None,
        "issuing_country": "UAE",
        "tags": ["identity", "personal", "family"],
        "review_status": "reviewed",
        "category": "Identity Documents",
    },
    {
        "id": 12,
        "document_type": "Marriage Certificate",
        "holder_name": "Nadeem Ahmad",
        "relationship": "Self",
        "document_number": "MC-2012-1190",
        "issue_date": date(2012, 12, 18),
        "expiry_date": None,
        "issuing_country": "India",
        "tags": ["marriage", "personal", "family"],
        "review_status": "reviewed",
        "category": "Personal Documents",
    },
]


def get_family_members() -> list[FamilyMember]:
    """Return the list of selectable family member filter entries."""
    return FAMILY_MEMBERS


def get_sample_documents() -> list[Document]:
    """Return the full list of sample/mock documents."""
    return SAMPLE_DOCUMENTS


def get_documents_for_member(member_id: str) -> list[Document]:
    """Return documents belonging to the family member identified by `member_id`.

    The special id "all" returns every document.
    """
    if member_id == "all":
        return SAMPLE_DOCUMENTS

    member = next((m for m in FAMILY_MEMBERS if m["id"] == member_id), None)
    if member is None:
        return SAMPLE_DOCUMENTS

    return [doc for doc in SAMPLE_DOCUMENTS if doc["relationship"] == member["relationship"]]
