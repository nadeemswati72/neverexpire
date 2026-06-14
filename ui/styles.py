"""Custom CSS styling for the NeverExpire Streamlit dashboard."""

import streamlit as st

# Core brand colors, shared with .streamlit/config.toml's theme settings.
COLORS: dict[str, str] = {
    "navy": "#1A365D",
    "gold": "#D69E2E",
    "danger": "#E53E3E",
    "warning": "#ED8936",
    "success": "#38A169",
    "background": "#F7FAFC",
    "card": "#FFFFFF",
    "text_primary": "#1A202C",
    "text_secondary": "#718096",
}

CUSTOM_CSS = f"""
/* ---------- Global ---------- */
html, body, [class*="css"] {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}}

.stApp {{
    background-color: {COLORS["background"]};
}}

/* Hide Streamlit's default chrome */
#MainMenu, header, footer {{
    visibility: hidden;
}}
[data-testid="stHeader"] {{
    visibility: hidden;
    height: 0;
}}
[data-testid="stToolbar"], [data-testid="stDecoration"] {{
    display: none;
}}

/* Constrain + pad the main content so it reads as a single app column,
   with room at the bottom for the fixed FABs and bottom nav. */
.block-container {{
    max-width: 900px;
    margin: 0 auto;
    padding-top: 1rem;
    padding-bottom: 6rem;
}}

/* ---------- Header bar ---------- */
.app-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: {COLORS["card"]};
    padding: 14px 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    margin-bottom: 16px;
}}
.app-header .brand {{
    font-size: 1.4rem;
    font-weight: 700;
    color: {COLORS["navy"]};
}}
.header-actions {{
    display: flex;
    align-items: center;
    gap: 18px;
}}
.header-icon {{
    font-size: 1.3rem;
    color: {COLORS["text_secondary"]};
}}
.user-avatar {{
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: {COLORS["navy"]};
    color: {COLORS["card"]};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}}

/* ---------- Greeting ---------- */
.greeting-section {{
    margin: 8px 0 20px 0;
}}
.greeting-title {{
    font-size: 1.75rem;
    font-weight: 700;
    color: {COLORS["text_primary"]};
}}
.greeting-subtitle {{
    color: {COLORS["text_secondary"]};
    margin-top: 2px;
}}
.stats-row {{
    margin-top: 10px;
    color: {COLORS["text_secondary"]};
    font-size: 0.95rem;
}}

/* ---------- Family member filter ---------- */
.section-label {{
    font-weight: 600;
    color: {COLORS["text_primary"]};
    margin: 4px 0 8px 0;
}}

/* ---------- Health summary card ---------- */
.health-summary-card {{
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    background-color: {COLORS["card"]};
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 16px;
    margin: 16px 0;
}}
.health-pill {{
    flex: 1;
    min-width: 140px;
    text-align: center;
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.12s ease-in-out;
}}
.health-pill:hover {{
    transform: scale(1.02);
}}
.pill-expired {{
    background-color: rgba(229, 62, 62, 0.12);
    color: {COLORS["danger"]};
}}
.pill-expiring {{
    background-color: rgba(237, 137, 54, 0.12);
    color: {COLORS["warning"]};
}}
.pill-valid {{
    background-color: rgba(56, 161, 105, 0.12);
    color: {COLORS["success"]};
}}
.pill-no-expiry {{
    background-color: rgba(113, 128, 150, 0.12);
    color: {COLORS["text_secondary"]};
}}

/* ---------- Alert banner ---------- */
.alert-banner {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    background: linear-gradient(135deg, {COLORS["danger"]} 0%, #C53030 100%);
    color: #FFFFFF;
    border-radius: 12px;
    padding: 16px 20px;
    margin: 16px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}}
.alert-title {{
    font-weight: 700;
    font-size: 1.05rem;
}}
.alert-subtitle {{
    margin-top: 4px;
    font-size: 0.9rem;
    opacity: 0.9;
}}
.alert-button {{
    background-color: #FFFFFF;
    color: {COLORS["danger"]};
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    white-space: nowrap;
}}

/* ---------- Section headers ---------- */
.section-header {{
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 24px 0 12px 0;
}}
.section-title {{
    font-size: 1.15rem;
    font-weight: 700;
    color: {COLORS["text_primary"]};
}}
.see-all-link {{
    color: {COLORS["navy"]};
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
}}
.see-all-link:hover {{
    color: {COLORS["gold"]};
}}
.empty-section {{
    color: {COLORS["text_secondary"]};
    padding: 8px 0 16px 0;
}}

/* ---------- Document cards ---------- */
.doc-card {{
    background-color: {COLORS["card"]};
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 16px;
    margin-bottom: 16px;
    transition: transform 0.12s ease-in-out;
}}
.doc-card:hover {{
    transform: scale(1.01);
}}
.border-expired {{
    border-left: 4px solid {COLORS["danger"]};
}}
.border-expiring_soon {{
    border-left: 4px solid {COLORS["warning"]};
}}
.border-valid {{
    border-left: 4px solid {COLORS["success"]};
}}
.border-no_expiry {{
    border-left: 4px solid #CBD5E0;
}}
.doc-card-header {{
    display: flex;
    align-items: flex-start;
    gap: 12px;
}}
.doc-card-icon {{
    font-size: 1.8rem;
    line-height: 1.2;
}}
.doc-card-title {{
    font-weight: 700;
    color: {COLORS["text_primary"]};
}}
.doc-card-status {{
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 2px;
}}
.status-expired {{
    color: {COLORS["danger"]};
}}
.status-expiring_soon {{
    color: {COLORS["warning"]};
}}
.status-valid {{
    color: {COLORS["success"]};
}}
.status-no_expiry {{
    color: {COLORS["text_secondary"]};
}}
.doc-progress-track {{
    height: 6px;
    border-radius: 4px;
    background-color: #EDF2F7;
    margin: 10px 0;
    overflow: hidden;
}}
.doc-progress-fill {{
    height: 100%;
    border-radius: 4px;
}}
.fill-expired {{
    background-color: {COLORS["danger"]};
}}
.fill-expiring_soon {{
    background-color: {COLORS["warning"]};
}}
.fill-valid {{
    background-color: {COLORS["success"]};
}}
.doc-card-number {{
    font-family: 'Courier New', monospace;
    color: {COLORS["text_secondary"]};
    font-size: 0.85rem;
    margin: 6px 0;
}}
.doc-card-tags {{
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0;
}}
.tag-pill {{
    background-color: #EDF2F7;
    color: #4A5568;
    border-radius: 12px;
    padding: 3px 10px;
    font-size: 0.75rem;
}}
.doc-card-actions {{
    display: flex;
    gap: 10px;
    margin-top: 10px;
}}
.card-btn {{
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    text-decoration: none;
    transition: transform 0.12s ease-in-out;
}}
.card-btn:hover {{
    transform: scale(1.02);
}}
.card-btn-primary {{
    background-color: {COLORS["navy"]};
    color: #FFFFFF;
}}
.card-btn-secondary {{
    background-color: #FFFFFF;
    color: {COLORS["navy"]};
    border: 1px solid {COLORS["navy"]};
}}

/* ---------- Floating action buttons ---------- */
.fab-container {{
    position: fixed;
    bottom: 76px;
    right: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    z-index: 999;
}}
.fab {{
    padding: 12px 22px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    transition: transform 0.12s ease-in-out;
}}
.fab:hover {{
    transform: scale(1.03);
}}
.fab-primary {{
    background-color: {COLORS["gold"]};
    color: {COLORS["text_primary"]};
}}
.fab-secondary {{
    background-color: {COLORS["navy"]};
    color: #FFFFFF;
}}

/* ---------- Bottom navigation ---------- */
.bottom-nav {{
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    background-color: {COLORS["card"]};
    box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
    padding: 8px 0;
    z-index: 1000;
}}
.bottom-nav-item {{
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    color: {COLORS["text_secondary"]};
    font-size: 0.75rem;
    text-decoration: none;
}}
.bottom-nav-icon {{
    font-size: 1.3rem;
}}
.bottom-nav-item.active {{
    color: {COLORS["navy"]};
    font-weight: 700;
}}

/* ---------- Responsiveness ---------- */
@media (max-width: 640px) {{
    .health-summary-card {{
        flex-direction: column;
    }}
    .doc-card-actions {{
        flex-direction: column;
    }}
    .fab-container {{
        right: 12px;
    }}
}}
"""


def inject_custom_css() -> None:
    """Inject the dashboard's custom CSS into the current Streamlit page."""
    st.markdown(f"<style>{CUSTOM_CSS}</style>", unsafe_allow_html=True)
