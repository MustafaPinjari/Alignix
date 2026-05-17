"""
Document Service — manages active document sessions and monitoring lifecycle.
"""
from engines.monitor import get_monitor
from engines.analyzer import DocumentAnalyzer
from db.database import get_session, DocumentSession


class DocumentService:

    def start_monitor(self, path: str, profile_id: int, socketio=None):
        from api.socket_events import emit_event

        def on_event(event_name, data):
            emit_event(event_name, data)

        get_monitor().start(path, profile_id, on_event)
        self._upsert_session(path, profile_id)

    def stop_monitor(self, path: str):
        get_monitor().stop(path)

    def monitor_status(self) -> dict:
        return {"active": get_monitor().active_paths()}

    def _upsert_session(self, path: str, profile_id: int):
        db = get_session()
        try:
            session = db.query(DocumentSession).filter_by(path=path).first()
            if not session:
                session = DocumentSession(path=path, profile_id=profile_id)
                db.add(session)
                db.commit()
        finally:
            db.close()
