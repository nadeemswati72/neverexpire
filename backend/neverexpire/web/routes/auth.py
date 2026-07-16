from flask import Blueprint, g, jsonify, request

from ...db.accounts import (
    authenticate_user,
    consume_password_reset_token,
    create_password_reset_token,
    register_user,
)
from ...db.session import get_session
from ... import config
from ..jwt_utils import create_token, jwt_required
from ..limiter import limiter

auth_bp = Blueprint("auth", __name__)


def _user_payload(user) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
    }


@auth_bp.post("/login")
@limiter.limit("10 per minute; 50 per hour")
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
@limiter.limit("5 per hour")
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


@auth_bp.post("/forgot-password")
@limiter.limit("5 per hour")
def forgot_password():
    from ...db.models import User
    from ...reminder_email import send_email

    body = request.get_json(silent=True) or {}
    email = body.get("email", "").strip().lower()

    if email:
        with get_session() as session:
            user = session.query(User).filter_by(email=email).first()
            # Only demo/fake addresses would bounce — everything else is a
            # real family and gets a real email. Same routing rule as the
            # reminder digest (see reminder_service.py).
            if user is not None and not email.endswith("@neverexpire.test"):
                raw_token = create_password_reset_token(session, user)
                reset_link = f"{config.FRONTEND_URL}/reset-password?token={raw_token}"
                subject = "Reset your NeverExpire password"
                text_body = (
                    f"Hi {user.full_name},\n\n"
                    f"Click the link below to reset your NeverExpire password. "
                    f"This link expires in 1 hour and can only be used once.\n\n{reset_link}\n\n"
                    "If you didn't request this, you can safely ignore this email."
                )
                html_body = f"""
                <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;">
                  <div style="background:linear-gradient(135deg,#34c9ba,#22a99c);padding:20px 24px;border-radius:12px 12px 0 0;">
                    <div style="color:white;font-size:18px;font-weight:700;">⏰ NeverExpire</div>
                  </div>
                  <div style="background:white;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 24px;">
                    <p style="color:#15203a;">Hi {user.full_name},</p>
                    <p style="color:#4a5568;">Click below to reset your password. This link expires in 1 hour and can only be used once.</p>
                    <a href="{reset_link}" style="display:inline-block;margin:12px 0;padding:10px 20px;background:linear-gradient(135deg,#34c9ba,#22a99c);color:white;text-decoration:none;border-radius:8px;font-weight:700;">Reset Password</a>
                    <p style="color:#8a9ab5;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
                  </div>
                </div>
                """
                try:
                    send_email(user.email, subject, html_body, text_body)
                except Exception:
                    pass  # don't leak delivery failures to the caller — see generic response below

    # Always the same response, whether or not the email exists — avoids
    # revealing which addresses are registered.
    return jsonify({"data": {"message": "If that email is registered, a reset link has been sent."}, "error": None})


@auth_bp.post("/reset-password")
@limiter.limit("10 per hour")
def reset_password():
    body = request.get_json(silent=True) or {}
    token = body.get("token", "").strip()
    new_password = body.get("new_password", "")

    if not token or not new_password:
        return jsonify({"data": None, "error": "token and new_password are required"}), 400
    if len(new_password) < 8:
        return jsonify({"data": None, "error": "Password must be at least 8 characters"}), 400

    with get_session() as session:
        ok = consume_password_reset_token(session, token, new_password)
        if not ok:
            return jsonify({"data": None, "error": "This reset link is invalid or has expired."}), 400
        return jsonify({"data": {"reset": True}, "error": None})
