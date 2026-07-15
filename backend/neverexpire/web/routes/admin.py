from flask import Blueprint, g, jsonify

from ...db.session import get_session
from ...reminder_service import run_reminder_check
from ..jwt_utils import jwt_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.post("/api/v1/admin/run-reminder-check")
@jwt_required
def trigger_reminder_check():
    """
    Manually run the reminder check for the calling user's own family only —
    for the Reminders page's "Send Now" button. The automated daily job (see
    web/__init__.py's scheduler) runs unscoped, covering every account.
    """
    with get_session() as session:
        result = run_reminder_check(session, user_id=g.current_user_id)
        return jsonify({"data": result, "error": None})
