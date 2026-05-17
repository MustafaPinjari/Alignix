from flask import Blueprint, request, jsonify
from engines.analyzer import DocumentAnalyzer
from engines.correction import CorrectionEngine
from engines.export import ExportEngine
from engines.structure_analyzer import StructureAnalyzer
from engines.page_map_engine import PageMapEngine
from engines.understanding_engine import DocumentUnderstandingEngine

from engines.batch_engine import BatchEngine
from engines.word_com import get_open_documents, attach_word_monitor, detach_word_monitor
from services.profile_service import ProfileService
from services.document_service import DocumentService
from db.database import get_session, IntegrityLock
from api.socket_events import emit_event

bp = Blueprint("api", __name__, url_prefix="/api")

def register_routes(app):
    app.register_blueprint(bp)

# ── Document ──────────────────────────────────────────────────────────────────

@bp.route("/document/analyze", methods=["POST"])
def analyze():
    data = request.json
    path = data.get("path")
    if not path:
        return jsonify({"error": "path required"}), 400
    result = DocumentAnalyzer().analyze(path)
    return jsonify(result)

@bp.route("/document/correct", methods=["POST"])
def correct():
    data = request.json
    path = data.get("path")
    profile_id = data.get("profile_id")
    stabilize = data.get("stabilize", True)
    result = CorrectionEngine().correct(path, profile_id, stabilize=stabilize)
    return jsonify(result)

@bp.route("/document/export", methods=["POST"])
def export():
    data = request.json
    path = data.get("path")
    fmt = data.get("format", "docx")
    out = ExportEngine().export(path, fmt)
    return jsonify({"output": out})

@bp.route("/document/health", methods=["POST"])
def health():
    data = request.json
    path = data.get("path")
    score = DocumentAnalyzer().health_score(path)
    return jsonify(score)

from engines.sandbox_engine import SandboxEngine

@bp.route("/document/pagemap", methods=["POST"])
def pagemap():
    data = request.json
    path = data.get("path")
    if not path:
        return jsonify({"error": "path required"}), 400
    result = PageMapEngine().build_page_map(path)
    return jsonify(result)


def understand():
    data = request.json
    path = data.get("path")
    if not path:
        return jsonify({"error": "path required"}), 400
    result = DocumentUnderstandingEngine().understand(path)
    return jsonify(result)

# ── Sandbox / Safe Preview ────────────────────────────────────────────────────

@bp.route("/sandbox/preview", methods=["POST"])
def sandbox_preview():
    data = request.json
    path       = data.get("path")
    profile_id = data.get("profile_id")
    scope      = data.get("scope")          # {elements: ["heading1", "body", ...]}
    answers    = data.get("answers", {})    # clarification answers
    result = SandboxEngine().create_preview(path, profile_id, scope, answers)
    return jsonify(result)

@bp.route("/sandbox/commit", methods=["POST"])
def sandbox_commit():
    data = request.json
    result = SandboxEngine().commit(data["path"])
    return jsonify(result)

@bp.route("/sandbox/discard", methods=["POST"])
def sandbox_discard():
    data = request.json
    SandboxEngine().discard(data["path"])
    return jsonify({"ok": True})


def structure():
    data = request.json
    path = data.get("path")
    result = StructureAnalyzer().analyze_structure(path)
    return jsonify(result)

@bp.route("/document/overlay", methods=["POST"])
def overlay():
    data = request.json
    path = data.get("path")
    profile_id = data.get("profile_id")
    result = CorrectionEngine().get_overlay_data(path, profile_id)
    return jsonify(result)

@bp.route("/document/history", methods=["POST"])
def history():
    data = request.json
    path = data.get("path")
    db = get_session()
    try:
        from db.database import DocumentSession, CorrectionLog
        session = db.query(DocumentSession).filter_by(path=path).first()
        if not session:
            return jsonify([])
        logs = db.query(CorrectionLog).filter_by(session_id=session.id)\
                 .order_by(CorrectionLog.timestamp.desc()).limit(50).all()
        return jsonify([{
            "element": l.element, "issue": l.issue,
            "action": l.action, "timestamp": str(l.timestamp),
        } for l in logs])
    finally:
        db.close()

# ── Profiles / Templates ──────────────────────────────────────────────────────

@bp.route("/profiles", methods=["GET"])
def list_profiles():
    return jsonify(ProfileService().list_all())

@bp.route("/profiles", methods=["POST"])
def create_profile():
    return jsonify(ProfileService().create(request.json))

@bp.route("/profiles/<int:pid>", methods=["GET"])
def get_profile(pid):
    return jsonify(ProfileService().get(pid))

@bp.route("/profiles/<int:pid>", methods=["PUT"])
def update_profile(pid):
    return jsonify(ProfileService().update(pid, request.json))

@bp.route("/profiles/<int:pid>", methods=["DELETE"])
def delete_profile(pid):
    ProfileService().delete(pid)
    return jsonify({"ok": True})

# ── Rules ─────────────────────────────────────────────────────────────────────

@bp.route("/rules/<int:profile_id>", methods=["GET"])
def get_rules(profile_id):
    return jsonify(ProfileService().get_rules(profile_id))

@bp.route("/rules/<int:profile_id>", methods=["PUT"])
def update_rules(profile_id):
    return jsonify(ProfileService().update_rules(profile_id, request.json))

# ── Monitor ───────────────────────────────────────────────────────────────────

@bp.route("/monitor/start", methods=["POST"])
def start_monitor():
    data = request.json
    DocumentService().start_monitor(data["path"], data.get("profile_id"))
    return jsonify({"ok": True})

@bp.route("/monitor/stop", methods=["POST"])
def stop_monitor():
    data = request.json
    DocumentService().stop_monitor(data["path"])
    return jsonify({"ok": True})

@bp.route("/monitor/status", methods=["GET"])
def monitor_status():
    return jsonify(DocumentService().monitor_status())

# ── Integrity Lock ────────────────────────────────────────────────────────────

@bp.route("/lock/enable", methods=["POST"])
def lock_enable():
    data = request.json
    path, profile_id = data["path"], data["profile_id"]
    db = get_session()
    try:
        lock = db.query(IntegrityLock).filter_by(path=path).first()
        if not lock:
            lock = IntegrityLock(path=path, profile_id=profile_id, enabled=True)
            db.add(lock)
        else:
            lock.enabled = True
            lock.profile_id = profile_id
        db.commit()
        DocumentService().start_monitor(path, profile_id)
        return jsonify({"ok": True, "locked": True})
    finally:
        db.close()

@bp.route("/lock/disable", methods=["POST"])
def lock_disable():
    data = request.json
    path = data["path"]
    db = get_session()
    try:
        lock = db.query(IntegrityLock).filter_by(path=path).first()
        if lock:
            lock.enabled = False
            db.commit()
        DocumentService().stop_monitor(path)
        return jsonify({"ok": True, "locked": False})
    finally:
        db.close()

@bp.route("/lock/status", methods=["POST"])
def lock_status():
    data = request.json
    path = data.get("path")
    db = get_session()
    try:
        lock = db.query(IntegrityLock).filter_by(path=path).first()
        return jsonify({"locked": bool(lock and lock.enabled)})
    finally:
        db.close()

# ── Word COM ──────────────────────────────────────────────────────────────────

@bp.route("/word/documents", methods=["GET"])
def word_documents():
    return jsonify(get_open_documents())

@bp.route("/word/attach", methods=["POST"])
def word_attach():
    data = request.json
    path, profile_id = data["path"], data["profile_id"]
    attach_word_monitor(path, profile_id, emit_event)
    return jsonify({"ok": True})

@bp.route("/word/detach", methods=["POST"])
def word_detach():
    data = request.json
    detach_word_monitor(data["path"])
    return jsonify({"ok": True})

# ── Batch ─────────────────────────────────────────────────────────────────────

@bp.route("/batch/run", methods=["POST"])
def batch_run():
    data = request.json
    paths = data.get("paths", [])
    profile_id = data.get("profile_id")
    export_fmt = data.get("export_format", "")
    if not paths or not profile_id:
        return jsonify({"error": "paths and profile_id required"}), 400
    BatchEngine().run(paths, profile_id, export_fmt, emit_event)
    return jsonify({"ok": True, "queued": len(paths)})
