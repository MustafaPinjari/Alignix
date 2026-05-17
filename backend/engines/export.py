"""
Export Engine — DOCX and PDF export with professional cleanup.
"""
import os
import shutil
from docx import Document


class ExportEngine:

    def export(self, path: str, fmt: str = "docx") -> str:
        base, _ = os.path.splitext(path)
        if fmt == "docx":
            return self._export_docx(path, base)
        elif fmt == "pdf":
            return self._export_pdf(path, base)
        raise ValueError(f"Unsupported format: {fmt}")

    def _export_docx(self, path: str, base: str) -> str:
        out = f"{base}_alignix_export.docx"
        shutil.copy2(path, out)
        return out

    def _export_pdf(self, path: str, base: str) -> str:
        """Uses Microsoft Word COM automation via pywin32 for PDF export."""
        out = f"{base}_alignix_export.pdf"
        try:
            import win32com.client
            word = win32com.client.Dispatch("Word.Application")
            word.Visible = False
            doc = word.Documents.Open(os.path.abspath(path))
            doc.SaveAs(os.path.abspath(out), FileFormat=17)  # 17 = wdFormatPDF
            doc.Close()
            word.Quit()
        except Exception as e:
            raise RuntimeError(f"PDF export failed (requires Microsoft Word): {e}")
        return out
