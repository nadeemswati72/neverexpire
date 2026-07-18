from datetime import date, timedelta

from flask import Blueprint, g, jsonify

from ... import config
from ...db.queries import get_dashboard_summary, get_documents_for_user
from ...db.session import get_session
from ...db.sharing import get_user_accessible_document_ids
from ..jwt_utils import jwt_required
from ..serializers import document_brief

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/api/v1/dashboard/summary")
@jwt_required
def summary():
    today = date.today()
    horizon = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)

    with get_session() as session:
        # Computed once and reused below instead of 3x — each is a real
        # network round-trip to Neon, not a free local SQLite lookup.
        accessible_ids = get_user_accessible_document_ids(session, g.current_user_id)
        data = get_dashboard_summary(session, g.current_user_id, accessible_ids=accessible_ids)

        # Next 5 expiring documents (soonest first, only with expiry dates, not yet expired)
        upcoming = get_documents_for_user(session, g.current_user_id, status_filter="expiring_soon", accessible_ids=accessible_ids)
        upcoming += get_documents_for_user(session, g.current_user_id, status_filter="expired", accessible_ids=accessible_ids)
        upcoming.sort(key=lambda d: d.expiry_date or date.max)

        return jsonify({
            "data": {
                "total": data["total_documents"],
                "expired": data["expired"],
                "expiring_soon": data["expiring_soon"],
                "valid": data["valid"],
                "no_expiry": data["no_expiry"],
                "upcoming": [document_brief(d, today, horizon) for d in upcoming[:5]],
            },
            "error": None,
        })
