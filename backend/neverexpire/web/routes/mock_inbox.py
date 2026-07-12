"""Demo-only viewer for the mock email log, so the sharing/revoke email flow can be shown live."""
import re

from flask import Blueprint, g, jsonify, request

from ...email_service import MockEmailService
from ..jwt_utils import jwt_required

mock_inbox_bp = Blueprint("mock_inbox", __name__)

ENTRY_RE = re.compile(
    r"\[MOCK EMAIL - (?P<timestamp>[^\]]+)\]\n"
    r"TO: (?P<to>[^\n]*)\n"
    r"SUBJECT: (?P<subject>[^\n]*)\n"
    r"FROM: (?P<from>[^\n]*)\n"
    r"(?P<body>.*?)\n=+\n",
    re.DOTALL,
)


@mock_inbox_bp.get("/api/v1/mock-inbox")
@jwt_required
def get_mock_inbox():
    """List mock emails. Defaults to emails addressed to the current user; pass ?all=1 for everything."""
    show_all = request.args.get("all") == "1"

    log_path = MockEmailService.LOG_FILE
    if not log_path.exists():
        return jsonify({"data": [], "error": None})

    content = log_path.read_text(encoding="utf-8")
    entries = []
    for m in ENTRY_RE.finditer(content):
        entries.append({
            "timestamp": m.group("timestamp").strip(),
            "to": m.group("to").strip(),
            "subject": m.group("subject").strip(),
            "from": m.group("from").strip(),
            "body": m.group("body").strip(),
        })

    if not show_all:
        entries = [e for e in entries if e["to"].lower() == g.current_user_email.lower()]

    entries.reverse()  # newest first
    return jsonify({"data": entries, "error": None})
