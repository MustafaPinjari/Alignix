"""
Batch Automation Engine — analyze, correct, and export multiple DOCX files.
Runs in a background thread with progress events pushed via SocketIO.
"""
import threading
import os
from engines.analyzer import DocumentAnalyzer
from engines.correction import CorrectionEngine
from engines.export import ExportEngine


class BatchEngine:

    def run(self, paths: list[str], profile_id: int, export_fmt: str, on_progress):
        """Start batch processing in background thread."""
        t = threading.Thread(
            target=self._process,
            args=(paths, profile_id, export_fmt, on_progress),
            daemon=True,
        )
        t.start()

    def _process(self, paths, profile_id, export_fmt, on_progress):
        total = len(paths)
        results = []

        for i, path in enumerate(paths):
            result = {"path": path, "name": os.path.basename(path)}
            try:
                # Analyze
                analyzer = DocumentAnalyzer()
                health = analyzer.health_score(path)
                result["health_before"] = health

                # Correct
                correction = CorrectionEngine().correct(path, profile_id)
                result["changes"] = correction.get("changes", 0)
                result["error"] = correction.get("error")

                # Re-score
                health_after = analyzer.health_score(path)
                result["health_after"] = health_after

                # Export
                if export_fmt and not result["error"]:
                    out = ExportEngine().export(path, export_fmt)
                    result["exported"] = out

                result["status"] = "error" if result["error"] else "done"

            except Exception as e:
                result["status"] = "error"
                result["error"] = str(e)

            results.append(result)
            on_progress("batch:progress", {
                "current": i + 1,
                "total": total,
                "result": result,
            })

        on_progress("batch:complete", {
            "total": total,
            "succeeded": len([r for r in results if r["status"] == "done"]),
            "failed": len([r for r in results if r["status"] == "error"]),
            "results": results,
        })
