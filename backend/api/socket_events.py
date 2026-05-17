"""
Socket.IO events — real-time push to frontend
"""
from services.document_service import DocumentService

_socketio = None

def register_socket_events(socketio):
    global _socketio
    _socketio = socketio

    @socketio.on("connect")
    def on_connect():
        pass

    @socketio.on("disconnect")
    def on_disconnect():
        pass

    @socketio.on("monitor:start")
    def on_monitor_start(data):
        DocumentService().start_monitor(
            data["path"], data.get("profile_id"), socketio=socketio
        )

    @socketio.on("monitor:stop")
    def on_monitor_stop(data):
        DocumentService().stop_monitor(data["path"])


def emit_event(event: str, data: dict):
    """Called by background threads to push events to frontend."""
    if _socketio:
        _socketio.emit(event, data)
