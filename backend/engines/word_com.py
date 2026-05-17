"""
Word COM Integration Engine — attaches to live Microsoft Word instances.
Detects open documents, monitors saves via COM events, triggers auto-correction.
"""
import threading
import time
import os
import logging

logger = logging.getLogger(__name__)

_word_app = None
_monitored: dict[str, dict] = {}  # path → {profile_id, on_event}
_poll_thread = None
_running = False


def _get_word():
    global _word_app
    try:
        import win32com.client
        _word_app = win32com.client.GetActiveObject("Word.Application")
        return _word_app
    except Exception:
        _word_app = None
        return None


def get_open_documents() -> list[dict]:
    """Return list of currently open Word documents."""
    word = _get_word()
    if not word:
        return []
    docs = []
    try:
        for i in range(1, word.Documents.Count + 1):
            doc = word.Documents(i)
            docs.append({
                "name": doc.Name,
                "path": doc.FullName,
                "saved": doc.Saved,
            })
    except Exception as e:
        logger.warning(f"COM doc enumeration failed: {e}")
    return docs


def attach_word_monitor(path: str, profile_id: int, on_event):
    """Register a document path for COM-based save monitoring."""
    abs_path = os.path.abspath(path)
    _monitored[abs_path] = {"profile_id": profile_id, "on_event": on_event}
    _ensure_poll_thread()


def detach_word_monitor(path: str):
    abs_path = os.path.abspath(path)
    _monitored.pop(abs_path, None)


def _ensure_poll_thread():
    global _poll_thread, _running
    if _poll_thread and _poll_thread.is_alive():
        return
    _running = True
    _poll_thread = threading.Thread(target=_poll_loop, daemon=True)
    _poll_thread.start()


def _poll_loop():
    """Poll Word every 2s for document save state changes."""
    last_saved: dict[str, bool] = {}
    while _running and _monitored:
        try:
            word = _get_word()
            if word:
                for i in range(1, word.Documents.Count + 1):
                    try:
                        doc = word.Documents(i)
                        full_path = os.path.abspath(doc.FullName)
                        if full_path not in _monitored:
                            continue
                        currently_saved = bool(doc.Saved)
                        was_saved = last_saved.get(full_path, True)
                        # Transition: unsaved → saved = user just saved
                        if not was_saved and currently_saved:
                            _trigger_correction(full_path)
                        last_saved[full_path] = currently_saved
                    except Exception:
                        pass
        except Exception as e:
            logger.debug(f"COM poll error: {e}")
        time.sleep(2)


def _trigger_correction(path: str):
    entry = _monitored.get(path)
    if not entry:
        return
    from engines.correction import CorrectionEngine
    engine = CorrectionEngine()
    violations = engine.check_violations(path, entry["profile_id"])
    if violations:
        result = engine.correct(path, entry["profile_id"])
        entry["on_event"]("monitor:corrected", {
            "path": path,
            "source": "word_com",
            "violations": len(violations),
            "changes": result.get("changes", 0),
        })
    else:
        entry["on_event"]("monitor:clean", {"path": path, "source": "word_com"})


def stop_all():
    global _running
    _running = False
    _monitored.clear()
