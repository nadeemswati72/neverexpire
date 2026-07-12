import os

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask_cors import CORS

from .. import config
from ..db.session import init_engine
from .routes import register_blueprints


def _run_daily_reminder_check() -> None:
    from ..db.session import get_session
    from ..reminder_service import run_reminder_check

    with get_session() as session:
        run_reminder_check(session)


def _start_scheduler() -> None:
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        _run_daily_reminder_check,
        "cron", hour=8, minute=0,
        id="daily_reminder_check", replace_existing=True,
    )
    scheduler.start()


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload limit

    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

    init_engine()
    register_blueprints(app)

    # Under `flask run --debug`, Werkzeug's reloader re-execs the process with
    # WERKZEUG_RUN_MAIN set; only start the scheduler in that child (or immediately
    # when debug/reloader isn't in play at all, e.g. gunicorn) to avoid double jobs.
    # Note: with multiple gunicorn workers in production, each worker would start
    # its own scheduler — fine for this single-worker PoC, revisit before scaling.
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or not app.debug:
        _start_scheduler()

    return app
