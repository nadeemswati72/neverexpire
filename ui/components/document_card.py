"""Reusable document card component for the NeverExpire dashboard."""

import streamlit as st

from ui.components.status_badge import (
    StatusKey,
    get_progress_percentage,
    get_status_key,
    get_status_text,
    mask_document_number,
)
from ui.mock_data import Document

DOCUMENT_TYPE_ICONS: dict[str, str] = {
    "Passport": "🛂",
    "Emirates ID": "🪪",
    "Driving License": "🚗",
    "Health Insurance Card": "📋",
    "Vehicle Registration": "🚙",
    "Vehicle Insurance": "🚙",
    "Professional Certificate": "📜",
    "University Degree": "🎓",
    "Birth Certificate": "📄",
    "Marriage Certificate": "💍",
}
DEFAULT_DOCUMENT_ICON = "📄"

# How a document's `relationship` value should be shown inside a card title.
RELATIONSHIP_LABELS: dict[str, str] = {
    "Self": "You",
    "Son": "Son",
    "Daughter": "Daughter",
    "Wife": "Wife",
}


def render_document_card(document: Document) -> None:
    """Render a single document as a styled card with status, tags and actions."""
    status = get_status_key(document["expiry_date"])

    st.markdown(
        f"""
        <div class="doc-card border-{status}">
          {_render_card_header(document, status)}
          {_render_progress_bar(document, status)}
          <div class="doc-card-number">{mask_document_number(document["document_number"])}</div>
          <div class="doc-card-tags">{_render_tags(document["tags"])}</div>
          {_render_actions(status)}
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_card_header(document: Document, status: StatusKey) -> str:
    """Build the HTML for a card's icon, title and status line."""
    icon = DOCUMENT_TYPE_ICONS.get(document["document_type"], DEFAULT_DOCUMENT_ICON)
    relationship = RELATIONSHIP_LABELS.get(document["relationship"], document["relationship"])
    first_name = document["holder_name"].split(" ")[0]
    status_text = get_status_text(document["expiry_date"])

    return f"""
        <div class="doc-card-header">
          <span class="doc-card-icon">{icon}</span>
          <div>
            <div class="doc-card-title">{document["document_type"]} — {first_name} ({relationship})</div>
            <div class="doc-card-status status-{status}">{status_text}</div>
          </div>
        </div>
    """


def _render_progress_bar(document: Document, status: StatusKey) -> str:
    """Build the HTML for a document's expiry progress bar, or '' if it has no expiry."""
    if status == "no_expiry":
        return ""

    percentage = get_progress_percentage(document["issue_date"], document["expiry_date"])
    return (
        '<div class="doc-progress-track">'
        f'<div class="doc-progress-fill fill-{status}" style="width: {percentage}%;"></div>'
        "</div>"
    )


def _render_tags(tags: list[str]) -> str:
    """Build the HTML for a document's tag pills."""
    return "".join(f'<span class="tag-pill">{tag}</span>' for tag in tags)


def _render_actions(status: StatusKey) -> str:
    """Build the HTML for a card's action buttons, based on its status."""
    view_button = '<a href="#" class="card-btn card-btn-primary">View Details</a>'
    if status == "no_expiry":
        return f'<div class="doc-card-actions">{view_button}</div>'

    renew_button = '<a href="#" class="card-btn card-btn-secondary">How to Renew?</a>'
    return f'<div class="doc-card-actions">{view_button}{renew_button}</div>'
