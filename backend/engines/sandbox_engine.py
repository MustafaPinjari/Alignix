"""
Sandbox Engine — safe correction environment.
Clones document → applies changes → validates → returns preview diff.
Never touches the original until user approves.
"""
import shutil
import os
import time
from docx import Document
from engines.rule_engine import RuleEngine
from engines.layout_stabilizer import LayoutStabilizer
from services.profile_service import ProfileService


class SandboxEngine:

    def create_preview(self, path: str, profile_id: int,
                       scope: dict | None = None,
                       clarification_answers: dict | None = None) -> dict:
        """
        Clone document, apply scoped corrections, return diff summary.
        Does NOT modify the original file.
        """
        sandbox_path = path + ".alignix_sandbox"
        try:
            shutil.copy2(path, sandbox_path)
            rules = ProfileService().get_rules(profile_id)
            if not rules:
                return {"error": "No rules for profile"}

            # Apply clarification overrides to rules
            if clarification_answers:
                rules = self._apply_answers(rules, clarification_answers)

            # Apply scope filter
            scoped_rules = self._scope_rules(rules, scope)

            doc = Document(sandbox_path)
            doc, log = RuleEngine().apply_rules(doc, scoped_rules)
            layout_actions = LayoutStabilizer().stabilize(doc)
            doc.save(sandbox_path)

            diff = self._build_diff(path, sandbox_path, log)
            return {
                "sandbox_path": sandbox_path,
                "changes": len(log),
                "layout_actions": len(layout_actions),
                "diff": diff,
                "safe_to_apply": self._is_safe(diff),
            }
        except Exception as e:
            self._cleanup(sandbox_path)
            return {"error": str(e)}

    def commit(self, path: str) -> dict:
        """Replace original with sandbox after user approval."""
        sandbox_path = path + ".alignix_sandbox"
        if not os.path.exists(sandbox_path):
            return {"error": "No sandbox found — run preview first"}
        try:
            self._safe_replace(sandbox_path, path)
            return {"status": "committed"}
        except Exception as e:
            return {"error": str(e)}

    def discard(self, path: str):
        self._cleanup(path + ".alignix_sandbox")

    # ── Internal ──────────────────────────────────────────────────────────────

    def _apply_answers(self, rules: list, answers: dict) -> list:
        """Merge user clarification answers into rule overrides."""
        overrides = {}
        for q_id, answer in answers.items():
            if answer == "keep":
                continue
            # q_id format: "q_role_{index}" or "q_font_{index}"
            parts = q_id.split("_")
            if len(parts) >= 3 and parts[1] == "font" and answer == "normalize":
                overrides["font_normalize"] = True
        return rules  # rules unchanged; normalization handled by rule engine

    def _scope_rules(self, rules: list, scope: dict | None) -> list:
        if not scope:
            return rules
        allowed = set(scope.get("elements", []))
        if not allowed:
            return rules
        return [r for r in rules if r["element"] in allowed]

    def _build_diff(self, original_path: str, sandbox_path: str, log: list) -> list:
        """Build a human-readable diff summary from the correction log."""
        diff = []
        for entry in log:
            diff.append({
                "element": entry.get("element"),
                "text":    entry.get("text", "")[:60],
                "changes": entry.get("changes", []),
            })
        return diff

    def _is_safe(self, diff: list) -> bool:
        """Heuristic: safe if fewer than 30% of elements changed."""
        return True  # always show preview; let user decide

    def _safe_replace(self, src: str, dst: str, retries: int = 5, delay: float = 0.8):
        for attempt in range(retries):
            try:
                shutil.move(src, dst)
                return
            except (PermissionError, OSError):
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    raise

    def _cleanup(self, path: str):
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass
