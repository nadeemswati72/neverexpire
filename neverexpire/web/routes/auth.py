from flask import Blueprint, flash, g, redirect, render_template, request, url_for

from ...db.accounts import authenticate_user, register_user
from ..auth import current_user, login_user, logout_user

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user() is not None:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        email = request.form["email"].strip()
        password = request.form["password"]
        full_name = request.form["full_name"].strip()

        if not email or not password or not full_name:
            flash("Email, password and full name are required.", "error")
            return render_template("auth/register.html")

        try:
            user, _person = register_user(g.db, email, password, full_name)
        except ValueError as exc:
            flash(str(exc), "error")
            return render_template("auth/register.html")

        login_user(user)
        flash("Welcome to NeverExpire!", "success")
        return redirect(url_for("dashboard.index"))

    return render_template("auth/register.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user() is not None:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        email = request.form["email"].strip()
        password = request.form["password"]

        user = authenticate_user(g.db, email, password)
        if user is None:
            flash("Invalid email or password.", "error")
            return render_template("auth/login.html")

        login_user(user)
        return redirect(url_for("dashboard.index"))

    return render_template("auth/login.html")


@auth_bp.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("auth.login"))
