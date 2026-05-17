"""
Live Monitoring Engine — watchdog-based file watcher.
Detects document saves → triggers violation check → auto-corrects.
"""
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from engines.correction import CorrectionEngine


class _DocHandler(FileSystemEventHandler):

    def __init__(self, path: str, profile_id: int, on_event):
        self.path = os.path.abspath(path)
        self.profile_id = profile_id
        self.on_event = on_event
        self._debounce_timer = None

    def on_modified(self, event):
        import os
        if os.path.abspath(event.src_path) != self.path:
            return
        if self._debounce_timer:
            self._debounce_timer.cancel()
        self._debounce_timer = threading.Timer(1.5, self._process)
        self._debounce_timer.start()

    def _process(self):
        import os
        engine = CorrectionEngine()
        violations = engine.check_violations(self.path, self.profile_id)
        if violations:
            result = engine.correct(self.path, self.profile_id)
            self.on_event("monitor:corrected", {
                "path": self.path,
                "violations": len(violations),
                "changes": result.get("changes", 0),
            })
        else:
            self.on_event("monitor:clean", {"path": self.path})


import os

class MonitoringEngine:

    def __init__(self):
        self._observers: dict[str, Observer] = {}

    def start(self, path: str, profile_id: int, on_event):
        abs_path = os.path.abspath(path)
        if abs_path in self._observers:
            return
        handler = _DocHandler(abs_path, profile_id, on_event)
        observer = Observer()
        observer.schedule(handler, path=os.path.dirname(abs_path), recursive=False)
        observer.start()
        self._observers[abs_path] = observer

    def stop(self, path: str):
        abs_path = os.path.abspath(path)
        observer = self._observers.pop(abs_path, None)
        if observer:
            observer.stop()
            observer.join()

    def stop_all(self):
        for path in list(self._observers.keys()):
            self.stop(path)

    def active_paths(self) -> list:
        return list(self._observers.keys())


# Singleton
_engine = MonitoringEngine()

def get_monitor() -> MonitoringEngine:
    return _engine
