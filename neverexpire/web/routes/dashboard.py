from datetime import date, timedelta

from flask import Blueprint, g, render_template

from ... import config
from ...db.queries import get_dashboard_summary
from ..auth import current_user, login_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/")
@login_required
def index():
    user = current_user()
    summary = get_dashboard_summary(g.db, user.id)
    today = date.today()
    soon_cutoff = today + timedelta(days=config.REMINDER_DAYS_THRESHOLD)
    return render_template("dashboard.html", summary=summary, today=today, soon_cutoff=soon_cutoff)
