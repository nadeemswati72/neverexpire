from flask import Flask

from .admin import admin_bp
from .api import api_bp
from .auth import auth_bp
from .dashboard import dashboard_bp
from .documents import documents_bp
from .family import family_bp
from .pages import pages_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(family_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp)
