from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/api/v1/health")
def health():
    return jsonify({"data": {"status": "ok", "version": "2.0.0"}, "error": None})
