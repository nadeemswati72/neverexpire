"""NeverExpire home dashboard, built with Streamlit.

Run with:
    streamlit run ui/pages/dashboard.py
"""

import sys
from datetime import datetime
from pathlib import Path

import streamlit as st

# Allow `import ui...` to resolve when this script is launched directly via
# `streamlit run ui/pages/dashboard.py` (its own directory is on sys.path,
# but the project root is not).
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from ui.components.document_card import render_document_card  # noqa: E402
from ui.components.status_badge import (  # noqa: E402
    STATUS_META,
    StatusKey,
    get_days_remaining,
    get_status_key,
)
from ui.mock_data import (  # noqa: E402
    Document,
    FamilyMember,
    get_documents_for_member,
    get_family_members,
    get_sample_documents,
)
from ui.styles import inject_custom_css  # noqa: E402


def configure_page() -> None:
    """Configure global Streamlit page settings."""
    st.set_page_config(
        page_title="NeverExpire",
        page_icon="🛡️",
        layout="wide",
        initial_sidebar_state="collapsed",
    )


def get_greeting(now: datetime | None = None) -> str:
    """Return a time-of-day-appropriate greeting for the signed-in user."""
    hour = (now or datetime.now()).hour
    if hour < 12:
        period = "morning"
    elif hour < 17:
        period = "afternoon"
    else:
        period = "evening"
    return f"Good {period}, Nadeem"


def render_header() -> None:
    """Render the top header bar with branding, settings and user avatar."""
    st.markdown(
        """
        <div class="app-header">
          <div class="brand">🛡️ NeverExpire</div>
          <div class="header-actions">
            <span class="header-icon">⚙️</span>
            <span class="user-avatar">N</span>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_greeting(documents: list[Document], members: list[FamilyMember]) -> None:
    """Render the greeting headline, subtitle and overview stats row."""
    member_count = len([member for member in members if member["id"] != "all"])
    valid_count = len(_filter_by_status(documents, "valid"))

    st.markdown(
        f"""
        <div class="greeting-section">
          <div class="greeting-title">{get_greeting()} 👋</div>
          <div class="greeting-subtitle">Here's your document health overview</div>
          <div class="stats-row">
            📄 {len(documents)} Documents&nbsp;&nbsp;·&nbsp;&nbsp;
            👨‍👩‍👧‍👦 {member_count} Members&nbsp;&nbsp;·&nbsp;&nbsp;
            ✅ {valid_count} Valid
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_family_filter(members: list[FamilyMember]) -> str:
    """Render the family member filter pills and return the selected member id."""
    st.markdown('<div class="section-label">👨‍👩‍👧‍👦 Family Members</div>', unsafe_allow_html=True)

    labels = {member["id"]: f"{member['avatar']} {member['name']}" for member in members}
    selected = st.pills(
        "Family members",
        options=[member["id"] for member in members],
        format_func=lambda member_id: labels[member_id],
        default="all",
        required=True,
        label_visibility="collapsed",
        key="family_filter",
    )
    return str(selected)


def render_health_summary(documents: list[Document]) -> None:
    """Render the clickable health-summary pills, each linking to a section below."""
    counts = {key: len(_filter_by_status(documents, key)) for key in STATUS_META}

    st.markdown(
        f"""
        <div class="health-summary-card">
          <a href="#needs-attention" class="health-pill pill-expired">
            🔴 {counts['expired']} Needs Attention
          </a>
          <a href="#expiring-soon" class="health-pill pill-expiring">
            🟡 {counts['expiring_soon']} Expiring Soon
          </a>
          <a href="#all-good" class="health-pill pill-valid">
            🟢 {counts['valid']} All Good
          </a>
          <a href="#no-expiry" class="health-pill pill-no-expiry">
            ⚪ {counts['no_expiry']} No Expiry
          </a>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_alert_banner(documents: list[Document]) -> None:
    """Render a red alert banner highlighting expired documents, if any exist."""
    expired_docs = _filter_by_status(documents, "expired")
    if not expired_docs:
        return

    featured = expired_docs[0]
    days_ago = abs(get_days_remaining(featured["expiry_date"]) or 0)
    plural = "s" if len(expired_docs) != 1 else ""

    st.markdown(
        f"""
        <div class="alert-banner">
          <div>
            <div class="alert-title">⚠️ {len(expired_docs)} document{plural} need your attention</div>
            <div class="alert-subtitle">Your {featured['document_type']} expired {days_ago} days ago</div>
          </div>
          <a href="#needs-attention" class="alert-button">View Now →</a>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_section_header(title: str, count: int, anchor_id: str) -> None:
    """Render a section title with its document count and a 'See All' link."""
    st.markdown(
        f"""
        <div id="{anchor_id}" class="section-header">
          <span class="section-title">{title} ({count})</span>
          <a href="#" class="see-all-link">See All →</a>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_document_section(
    documents: list[Document], status_key: StatusKey, title: str, anchor_id: str
) -> None:
    """Render an always-visible section of document cards for a single status."""
    section_docs = _filter_by_status(documents, status_key)
    render_section_header(title, len(section_docs), anchor_id)
    _render_cards_grid(section_docs)


def render_collapsible_section(
    documents: list[Document], status_key: StatusKey, title: str, anchor_id: str
) -> None:
    """Render a collapsed-by-default section of document cards for a single status."""
    section_docs = _filter_by_status(documents, status_key)
    st.markdown(f'<div id="{anchor_id}"></div>', unsafe_allow_html=True)
    with st.expander(f"{title} ({len(section_docs)})", expanded=False):
        _render_cards_grid(section_docs)


def render_floating_action_buttons() -> None:
    """Render the fixed floating action buttons for upload and emergency wallet."""
    st.markdown(
        """
        <div class="fab-container">
          <a href="#" class="fab fab-primary">➕ Upload Document</a>
          <a href="#" class="fab fab-secondary">🚨 Emergency Wallet</a>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_bottom_nav() -> None:
    """Render the fixed bottom navigation bar, with Home highlighted as active."""
    items = [
        ("🏠", "Home", True),
        ("📋", "Docs", False),
        ("➕", "Upload", False),
        ("👨‍👩‍👧‍👦", "Family", False),
        ("🚨", "SOS", False),
    ]
    items_html = "".join(
        f'<a href="#" class="bottom-nav-item {"active" if active else ""}">'
        f'<div class="bottom-nav-icon">{icon}</div><div class="bottom-nav-label">{label}</div></a>'
        for icon, label, active in items
    )
    st.markdown(f'<div class="bottom-nav">{items_html}</div>', unsafe_allow_html=True)


def _filter_by_status(documents: list[Document], status_key: StatusKey) -> list[Document]:
    """Return only the documents whose computed status matches `status_key`."""
    return [doc for doc in documents if get_status_key(doc["expiry_date"]) == status_key]


def _render_cards_grid(documents: list[Document]) -> None:
    """Render a list of documents as a two-column grid of cards, or an empty message."""
    if not documents:
        st.markdown('<div class="empty-section">Nothing here right now.</div>', unsafe_allow_html=True)
        return

    columns = st.columns(2)
    for index, document in enumerate(documents):
        with columns[index % 2]:
            render_document_card(document)


def main() -> None:
    """Render the full NeverExpire home dashboard."""
    configure_page()
    inject_custom_css()

    render_header()
    render_greeting(get_sample_documents(), get_family_members())

    selected_member_id = render_family_filter(get_family_members())
    documents = get_documents_for_member(selected_member_id)

    render_health_summary(documents)
    render_alert_banner(documents)

    render_document_section(documents, "expired", "🔴 Needs Attention", "needs-attention")
    render_document_section(documents, "expiring_soon", "🟡 Expiring Soon", "expiring-soon")
    render_collapsible_section(documents, "valid", "🟢 All Good", "all-good")
    render_collapsible_section(documents, "no_expiry", "⚪ No Expiry", "no-expiry")

    render_floating_action_buttons()
    render_bottom_nav()


if __name__ == "__main__":
    main()
