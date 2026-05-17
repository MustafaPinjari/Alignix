"""
Page Map Engine — maps document paragraphs to logical page numbers.
Detects page breaks, estimates page boundaries, auto-detects protected pages.

DOCX has no true page number API — we estimate using:
  1. Explicit page break markers (w:pageBreak, w:lastRenderedPageBreak)
  2. Section properties (w:sectPr)
  3. Paragraph count heuristics for large documents
"""
from docx import Document
from docx.oxml.ns import qn
import re


# Heuristic: average paragraphs per page for a standard document
AVG_PARAS_PER_PAGE = 12

# Roles that suggest a protected/special page
PROTECTED_ROLES = {
    "title", "certificate", "declaration", "approval",
    "signature", "toc", "index", "appendix",
}

PROTECTED_PATTERNS = [
    r"^(title\s*page|cover\s*page)",
    r"^(table\s*of\s*contents|contents)",
    r"^(certificate|declaration|approval|acknowledgement)",
    r"^(index|appendix\s+[a-z])",
    r"^(signature|signed\s*by)",
    r"^(list\s*of\s*(figures|tables|abbreviations))",
]


class PageMapEngine:

    def build_page_map(self, path: str) -> dict:
        doc = Document(path)
        paras = list(doc.paragraphs)

        pages = self._assign_pages(paras)
        total_pages = max((p["page"] for p in pages), default=1)
        suggested_protected = self._detect_protected_pages(pages, total_pages)
        issue_density = self._issue_density_per_page(pages, total_pages)

        return {
            "total_pages": total_pages,
            "pages": self._summarize_pages(pages, total_pages),
            "suggested_protected": suggested_protected,
            "issue_density": issue_density,
            "para_page_map": {p["index"]: p["page"] for p in pages},
        }

    # ── Page Assignment ───────────────────────────────────────────────────────

    def _assign_pages(self, paras: list) -> list:
        result = []
        current_page = 1

        for i, para in enumerate(paras):
            # Check for explicit page break in this paragraph
            if self._has_page_break(para):
                current_page += 1

            result.append({
                "index": i,
                "page": current_page,
                "text": para.text.strip()[:80],
                "style": para.style.name if para.style else "Normal",
                "empty": not para.text.strip(),
            })

        # If no explicit breaks found, estimate from paragraph count
        if current_page == 1 and len(paras) > AVG_PARAS_PER_PAGE:
            return self._estimate_pages(paras)

        return result

    def _estimate_pages(self, paras: list) -> list:
        """Fallback: distribute paragraphs evenly across estimated pages."""
        result = []
        for i, para in enumerate(paras):
            page = (i // AVG_PARAS_PER_PAGE) + 1
            result.append({
                "index": i,
                "page": page,
                "text": para.text.strip()[:80],
                "style": para.style.name if para.style else "Normal",
                "empty": not para.text.strip(),
            })
        return result

    def _has_page_break(self, para) -> bool:
        """Check for explicit page break in paragraph XML."""
        p_xml = para._p
        # w:br w:type="page"
        for br in p_xml.iter(qn("w:br")):
            if br.get(qn("w:type")) == "page":
                return True
        # w:lastRenderedPageBreak
        for _ in p_xml.iter(qn("w:lastRenderedPageBreak")):
            return True
        # Section break (sectPr) at end of paragraph = page break
        pPr = p_xml.find(qn("w:pPr"))
        if pPr is not None:
            sectPr = pPr.find(qn("w:sectPr"))
            if sectPr is not None:
                return True
        return False

    # ── Protected Page Detection ──────────────────────────────────────────────

    def _detect_protected_pages(self, pages: list, total_pages: int) -> list:
        """Auto-detect pages that are likely special/protected."""
        protected = set()
        page_texts = {}

        for p in pages:
            pg = p["page"]
            if pg not in page_texts:
                page_texts[pg] = []
            if p["text"]:
                page_texts[pg].append(p["text"])

        for pg, texts in page_texts.items():
            combined = " ".join(texts).lower()
            for pattern in PROTECTED_PATTERNS:
                if re.search(pattern, combined, re.I):
                    protected.add(pg)
                    break
            # First page is almost always a title/cover
            if pg == 1:
                protected.add(pg)
            # Last page often has signatures/appendices
            if pg == total_pages and total_pages > 3:
                protected.add(pg)

        return sorted(protected)

    # ── Issue Density ─────────────────────────────────────────────────────────

    def _issue_density_per_page(self, pages: list, total_pages: int) -> dict:
        """Returns {page_num: issue_count} — placeholder, filled by understanding engine."""
        return {str(pg): 0 for pg in range(1, total_pages + 1)}

    # ── Page Summary ──────────────────────────────────────────────────────────

    def _summarize_pages(self, pages: list, total_pages: int) -> list:
        summaries = []
        page_data = {}
        for p in pages:
            pg = p["page"]
            if pg not in page_data:
                page_data[pg] = {"paragraphs": 0, "headings": 0, "preview": ""}
            if not p["empty"]:
                page_data[pg]["paragraphs"] += 1
                style = p["style"].lower()
                if "heading" in style or "title" in style:
                    page_data[pg]["headings"] += 1
                if not page_data[pg]["preview"]:
                    page_data[pg]["preview"] = p["text"][:50]

        for pg in range(1, total_pages + 1):
            data = page_data.get(pg, {"paragraphs": 0, "headings": 0, "preview": ""})
            summaries.append({
                "page": pg,
                "paragraphs": data["paragraphs"],
                "headings": data["headings"],
                "preview": data["preview"],
            })
        return summaries


def parse_page_range(range_str: str, total_pages: int) -> set:
    """
    Parse a page range string like '1-5', '3,5,8', '1,3,7-12'
    into a set of page numbers.
    """
    pages = set()
    if not range_str or range_str.strip().lower() == "all":
        return set(range(1, total_pages + 1))

    for part in range_str.split(","):
        part = part.strip()
        if "-" in part:
            try:
                start, end = part.split("-", 1)
                pages.update(range(int(start.strip()), int(end.strip()) + 1))
            except ValueError:
                pass
        elif part.isdigit():
            pages.add(int(part))

    return {p for p in pages if 1 <= p <= total_pages}
