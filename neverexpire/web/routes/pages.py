from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/about")
def about():
    return render_template("pages/about.html")


@pages_bp.route("/roadmap")
def roadmap():
    return render_template("pages/roadmap.html")


@pages_bp.route("/testing")
def testing():
    return render_template("pages/testing.html")
