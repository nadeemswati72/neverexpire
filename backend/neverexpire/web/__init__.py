from flask import Flask
from flask_cors import CORS

from .. import config
from ..db.session import init_engine
from .routes import register_blueprints


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload limit

    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

    init_engine()
    register_blueprints(app)

    return app
