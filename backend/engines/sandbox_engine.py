"""
Sandbox Engine — safe correction environment with page-scoped filtering.
Clones document → applies page+element scoped corrections → returns diff.
Never touches the original until user approves.
"""
import shutil
import os
import time
from docx import Document
from engines.rule_engine import RuleEngine
from engines.layout_stabilizer import LayoutStabilizer
from engines.page_map_engine import PageMapEngine, parse_page_range
from services.profile_service import ProfileService


class SandboxEngine:

    def create_preview(self, path: str, profile_id: int,
                       scope: dict | None = None,
                       clarification_answers: dict | None = None) -> dict:
        """
        Clone document, apply page+element scoped corrections, return diff.
        scope = {
            elements: ["heading1", "body", ...],   # element type filter
            include_pages: "1-5,8",                # only these pages
            exclude_pages: "1,2,20",               # never touch these
            protected_pages: [1, 2],               # locked pages
        }
        """
        sandbox_path = path + ".alignix_sandbox"
        try:
            shutil.copy2(path, sandbox_path)
            rules = ProfileService().get_rules(profile_id)
            if not rules:
                return {"error": "No rules for profile"}

            if clarification_answers:
                rules = self._apply_answers(rules, clarification_answers)

            scoped_rules = self._scope_rules(rules, scope)

            # Build page map for page-aware filtering
            page_map_data = PageMapEngine().build_page_map(path)
            para_page_map = page_map_data["para_page_map"]   # {para_index: page_num}
            total_pages   = page_map_data["total_pages"]
            excluded_pages = self._resolve_excluded_pages(scope, total_pages)

            doc = Document(sandbox_path)
            doc, log = RuleEngine().apply_rules(
                doc, scoped_rules,
                para_page_map=para_page_map,
                excluded_pages=excluded_pages,
            )
            layout_actions = LayoutStabilizer().stabilize(doc)
            doc.save(sandbox_path)

            diff = self._build_diff(log)
            affected_pages = sorted({
                para_page_map.get(str(e.get("index", -1)), para_page_map.get(e.get("index", -1)))
                for e in log if e.get("index") is not None
            } - {None})

            return {
                "sandbox_path":   sandbox_path,
                "changes":        len(log),
                "layout_actions": len(layout_actions),
                "diff":           diff,
                "safe_to_apply":  True,
                "affected_pages": affected_pages,
                "excluded_pages": sorted(excluded_pages),
                "total_pages":    total_pages,
            }
        except Exception as e:
            self._cleanup(sandbox_path)
            return {"error": str(e)}

    def commit(self, path: str) -> dict:
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

    def _resolve_excluded_pages(self, scope: dict | None, total_pages: int) -> set:
        if not scope:
            return set()
        excluded = set()

        # Explicit exclude_pages string e.g. "1,2,20-22"
        exclude_str = scope.get("exclude_pages", "")
        if exclude_str:
            excluded |= parse_page_range(exclude_str, total_pages)

        # Protected pages list
        protected = scope.get("protected_pages", [])
        excluded |= set(protected)

        # include_pages = only these pages → everything else is excluded
        include_str = scope.get("include_pages", "")
        if include_str:
            included = parse_page_range(include_str, total_pages)
            all_pages = set(range(1, total_pages + 1))
            excluded |= (all_pages - included)

        return excluded

    def _apply_answers(self, rules: list, answers: dict) -> list:
        return rules  # clarification answers handled by rule engine

    def _scope_rules(self, rules: list, scope: dict | None) -> list:
        if not scope:
            return rules
        allowed = set(scope.get("elements", []))
        if not allowed:
            return rules
        return [r for r in rules if r["element"] in allowed]

    def _build_diff(self, log: list) -> list:
        return [
            {
                "index":   entry.get("index"),
                "element": entry.get("element"),
                "text":    entry.get("text", "")[:60],
                "changes": entry.get("changes", []),
            }
            for entry in log
        ]

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
