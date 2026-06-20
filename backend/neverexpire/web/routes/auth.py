from flask import Blueprint, g, jsonify, request

from ...db.accounts import authenticate_user, register_user
from ...db.session import get_session
from ... import config
from ..jwt_utils import create_token, jwt_required

auth_bp = Blueprint("auth", __name__)


def _user_payload(user) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }


@auth_bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    email = body.get("email", "").strip()
    password = body.get("password", "")

    if not email or not password:
        return jsonify({"data": None, "error": "email and password are required"}), 400

    with get_session() as session:
        user = authenticate_user(session, email, password)
        if user is None:
            return jsonify({"data": None, "error": "Invalid email or password"}), 401
        token = create_token(user.id, hours=config.JWT_EXPIRY_HOURS)
        return jsonify({"data": {"token": token, "user": _user_payload(user)}, "error": None})


@auth_bp.post("/register")
def register():
    body = request.get_json(silent=True) or {}
    email = body.get("email", "").strip()
    password = body.get("password", "")
    full_name = body.get("full_name", "").strip()

    if not email or not password or not full_name:
        return jsonify({"data": None, "error": "email, password, and full_name are required"}), 400
    if len(password) < 8:
        return jsonify({"data": None, "error": "Password must be at least 8 characters"}), 400

    try:
        with get_session() as session:
            user, _ = register_user(session, email, password, full_name)
            token = create_token(user.id, hours=config.JWT_EXPIRY_HOURS)
            return jsonify({"data": {"token": token, "user": _user_payload(user)}, "error": None}), 201
    except ValueError as e:
        return jsonify({"data": None, "error": str(e)}), 409


@auth_bp.get("/me")
@jwt_required
def me():
    from ...db.models import User
    with get_session() as session:
        user = session.get(User, g.current_user_id)
        return jsonify({"data": _user_payload(user), "error": None})
