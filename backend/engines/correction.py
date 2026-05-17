"""
Correction Engine — orchestrates analysis → rule application → layout stabilization → save.
Includes rollback safety and integrity lock support.
"""
import shutil
import os
from datetime import datetime
from docx import Document

from engines.analyzer import DocumentAnalyzer
from engines.rule_engine import RuleEngine
from engines.layout_stabilizer import LayoutStabilizer
from services.profile_service import ProfileService
from db.database import get_session, DocumentSession, CorrectionLog


class CorrectionEngine:

    def correct(self, path: str, profile_id: int, stabilize: bool = True) -> dict:
        rules = ProfileService().get_rules(profile_id)
        if not rules:
            return {"error": "No rules found for profile"}

        backup = self._backup(path)
        try:
            doc = Document(path)
            doc, log = RuleEngine().apply_rules(doc, rules)

            layout_actions = []
            if stabilize:
                layout_actions = LayoutStabilizer().stabilize(doc)

            doc.save(path)
            self._persist_log(path, profile_id, log)
            return {
                "status": "corrected",
                "changes": len(log),
                "log": log,
                "layout_actions": layout_actions,
                "backup": backup,
            }
        except Exception as e:
            self._restore(backup, path)
            return {"error": str(e), "restored": True}

    def check_violations(self, path: str, profile_id: int) -> list:
        rules = ProfileService().get_rules(profile_id)
        if not rules:
            return []
        doc = Document(path)
        return RuleEngine().check_violations(doc, rules)

    def get_overlay_data(self, path: str, profile_id: int) -> list:
        """Return rich violation data for the frontend overlay panel."""
        violations = self.check_violations(path, profile_id)
        overlay = []
        for v in violations:
            severity = self._severity(v["type"])
            overlay.append({
                **v,
                "severity": severity,
                "message": self._violation_message(v),
                "quick_fix": True,
            })
        return overlay

    # ── Internal ──────────────────────────────────────────────────────────────

    def _severity(self, vtype: str) -> str:
        high = {"font_size", "font_name"}
        medium = {"alignment", "line_spacing"}
        return "high" if vtype in high else "medium" if vtype in medium else "low"

    def _violation_message(self, v: dict) -> str:
        t = v["type"]
        if t == "font_size":
            return f"Font size should be {v['expected']}pt (found {v['actual']}pt)"
        if t == "font_name":
            return f"Font should be {v['expected']} (found {v['actual']})"
        return f"{t.replace('_', ' ').title()} violation"

    def _backup(self, path: str) -> str:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = os.path.join(os.path.dirname(path), ".alignix_backups")
        os.makedirs(backup_dir, exist_ok=True)
        backup_path = os.path.join(backup_dir, f"{os.path.basename(path)}.{ts}.bak")
        shutil.copy2(path, backup_path)
        return backup_path

    def _restore(self, backup: str, path: str):
        if backup and os.path.exists(backup):
            shutil.copy2(backup, path)

    def _persist_log(self, path: str, profile_id: int, log: list):
        db = get_session()
        try:
            session = db.query(DocumentSession).filter_by(path=path, profile_id=profile_id).first()
            if not session:
                session = DocumentSession(path=path, profile_id=profile_id)
                db.add(session)
                db.flush()
            for entry in log:
                db.add(CorrectionLog(
                    session_id=session.id,
                    element=entry.get("element", ""),
                    issue=str(entry.get("changes", "")),
                    action="auto-corrected",
                ))
            db.commit()
        finally:
            db.close()
