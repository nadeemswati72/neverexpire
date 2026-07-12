from flask import Blueprint, jsonify

from ...db.session import get_session
from ...reminder_service import run_reminder_check
from ..jwt_utils import jwt_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.post("/api/v1/admin/run-reminder-check")
@jwt_required
def trigger_reminder_check():
    """Manually run the reminder check — for demoing the email flow on demand."""
    with get_session() as session:
        result = run_reminder_check(session)
        return jsonify({"data": result, "error": None})
