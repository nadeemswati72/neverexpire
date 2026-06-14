from functools import wraps

from flask import abort, g, redirect, session, url_for

from ..db.models import User


def current_user() -> User | None:
    user_id = session.get("user_id")
    if user_id is None:
        return None
    return g.db.get(User, user_id)


def login_user(user: User) -> None:
    session["user_id"] = user.id


def logout_user() -> None:
    session.pop("user_id", None)


def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if current_user() is None:
            return redirect(url_for("auth.login"))
        return view(*args, **kwargs)

    return wrapped_view


def admin_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        user = current_user()
        if user is None:
            return redirect(url_for("auth.login"))
        if user.role != "admin":
            abort(403)
        return view(*args, **kwargs)

    return wrapped_view
