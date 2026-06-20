from flask import Blueprint, jsonify

from ...db.models import DocumentType
from ...db.session import get_session
from ..jwt_utils import jwt_required

doc_types_bp = Blueprint("document_types", __name__)


@doc_types_bp.get("/api/v1/document-types")
@jwt_required
def list_document_types():
    with get_session() as session:
        types = session.query(DocumentType).order_by(DocumentType.default_name).all()
        return jsonify({
            "data": [{"id": t.id, "code": t.code, "name": t.default_name} for t in types],
            "error": None,
        })
