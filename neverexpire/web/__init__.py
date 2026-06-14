from flask import Flask, g

from .. import config
from ..db.session import SessionLocal
from .auth import current_user


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    config.STAGING_DIR.mkdir(parents=True, exist_ok=True)

    @app.before_request
    def open_db_session():
        g.db = SessionLocal()

    @app.teardown_request
    def close_db_session(exception=None):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    @app.context_processor
    def inject_current_user():
        user = current_user()
        person = None
        if user is not None:
            person = next((p for p in user.persons if p.is_primary), None)
        return {"current_user": user, "current_person": person}

    from .routes import register_blueprints

    register_blueprints(app)

    return app
