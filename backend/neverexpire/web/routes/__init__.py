from flask import Flask

from .admin import admin_bp
from .auth import auth_bp
from .avatars import avatars_bp
from .dashboard import dashboard_bp
from .document_types import doc_types_bp
from .documents import documents_bp
from .family import family_bp
from .files import files_bp
from .health import health_bp
from .mock_inbox import mock_inbox_bp
from .notifications import notifications_bp
from .sharing import sharing_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(doc_types_bp)
    app.register_blueprint(family_bp)
    app.register_blueprint(avatars_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(files_bp)
    app.register_blueprint(sharing_bp)
    app.register_blueprint(mock_inbox_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)
