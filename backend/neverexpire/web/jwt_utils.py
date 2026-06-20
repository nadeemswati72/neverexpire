import functools
from datetime import datetime, timedelta, timezone

import jwt
from flask import current_app, g, jsonify, request

from ..db.models import User
from ..db.session import get_session


def create_token(user_id: int, hours: int = 24) -> str:
    payload = {
        "sub": str(user_id),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])


def jwt_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"data": None, "error": "Missing or invalid Authorization header"}), 401
        token = auth_header[7:]
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"data": None, "error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"data": None, "error": "Invalid token"}), 401

        with get_session() as session:
            user = session.get(User, int(payload["sub"]))
            if user is None or not user.is_active:
                return jsonify({"data": None, "error": "User not found or inactive"}), 401
            g.current_user_id = user.id
            g.current_user_email = user.email

        return f(*args, **kwargs)
    return decorated
