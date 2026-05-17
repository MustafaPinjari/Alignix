"""
Structural Hierarchy Intelligence — deep heuristic document structure analysis.
Detects titles, chapters, sections, subsections, references, appendices
even when formatting is inconsistent.
"""
from docx import Document
from collections import Counter
import re


class StructureAnalyzer:

    def analyze_structure(self, path: str) -> dict:
        doc = Document(path)
        paragraphs = list(doc.paragraphs)
        elements = [self._classify_deep(i, p, paragraphs) for i, p in enumerate(paragraphs)]
        hierarchy = self._build_hierarchy(elements)
        confidence = self._confidence_score(elements)
        return {
            "elements": elements,
            "hierarchy": hierarchy,
            "confidence": confidence,
            "toc_candidates": [e for e in elements if e["role"] in ("title", "chapter", "section", "subsection")],
        }

    # ── Deep Classification ───────────────────────────────────────────────────

    def _classify_deep(self, idx: int, para, all_paras: list) -> dict:
        text = para.text.strip()
        style = para.style.name.lower() if para.style else "normal"
        font_sizes = [r.font.size.pt for r in para.runs if r.font.size]
        size = max(font_sizes) if font_sizes else None
        bold = any(r.bold for r in para.runs if r.bold)

        role = self._infer_role(idx, text, style, size, bold, all_paras)
        confidence = self._element_confidence(text, style, size, bold, role)

        return {
            "index": idx,
            "text": text[:120],
            "style": style,
            "role": role,
            "font_size": size,
            "bold": bold,
            "confidence": confidence,
        }

    def _infer_role(self, idx, text, style, size, bold, all_paras) -> str:
        if not text:
            return "empty"

        # Style-based (most reliable)
        if "heading 1" in style or "title" in style:
            return "title" if idx < 5 else "chapter"
        if "heading 2" in style:
            return "section"
        if "heading 3" in style:
            return "subsection"
        if "heading" in style:
            return "section"
        if "caption" in style:
            return "caption"
        if "list" in style or "bullet" in style:
            return "list_item"

        # Heuristic text patterns
        if re.match(r"^(abstract|introduction|conclusion|references|bibliography|appendix)", text, re.I):
            return "chapter"
        if re.match(r"^\d+\.\s+[A-Z]", text):
            return "section"
        if re.match(r"^\d+\.\d+\s+[A-Z]", text):
            return "subsection"
        if re.match(r"^\d+\.\d+\.\d+\s+", text):
            return "subsubsection"
        if re.match(r"^(table|figure|fig\.|tab\.)\s*\d+", text, re.I):
            return "caption"
        if re.match(r"^\[\d+\]", text):
            return "reference"
        if re.match(r"^appendix\s+[a-z]", text, re.I):
            return "appendix"

        # Size-based heuristics
        if size and bold:
            body_sizes = [r.font.size.pt for p in all_paras for r in p.runs
                          if r.font.size and not any(r2.bold for r2 in p.runs if r2.bold)]
            if body_sizes:
                avg_body = sum(body_sizes) / len(body_sizes)
                if size > avg_body + 4:
                    return "chapter"
                if size > avg_body + 2:
                    return "section"

        return "body"

    def _element_confidence(self, text, style, size, bold, role) -> float:
        score = 0.5
        if "heading" in style and role in ("chapter", "section", "subsection"):
            score += 0.4
        if bold and role in ("chapter", "section"):
            score += 0.1
        if re.match(r"^\d+\.", text) and role in ("section", "subsection"):
            score += 0.2
        return min(1.0, round(score, 2))

    # ── Hierarchy Builder ─────────────────────────────────────────────────────

    def _build_hierarchy(self, elements: list) -> list:
        hierarchy = []
        stack = []
        level_map = {"title": 0, "chapter": 1, "section": 2, "subsection": 3, "subsubsection": 4}

        for el in elements:
            if el["role"] not in level_map:
                continue
            level = level_map[el["role"]]
            node = {"level": level, "text": el["text"], "index": el["index"], "children": []}

            while stack and stack[-1]["level"] >= level:
                stack.pop()

            if stack:
                stack[-1]["children"].append(node)
            else:
                hierarchy.append(node)

            stack.append(node)

        return hierarchy

    def _confidence_score(self, elements: list) -> float:
        if not elements:
            return 0.0
        scores = [e["confidence"] for e in elements if e["role"] != "empty"]
        return round(sum(scores) / max(len(scores), 1), 2)
