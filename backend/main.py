"""
Alignix Backend Entry Point
Flask + SocketIO server bridging Python engines to Electron frontend
"""
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from db.database import init_db
from api.routes import register_routes
from api.socket_events import register_socket_events

app = Flask(__name__)
app.config["SECRET_KEY"] = "alignix-secret-2024"
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

init_db()
from templates.builtin import seed_templates
seed_templates()
register_routes(app)
register_socket_events(socketio)

if __name__ == "__main__":
    socketio.run(app, host="127.0.0.1", port=5000, debug=False, allow_unsafe_werkzeug=True)
