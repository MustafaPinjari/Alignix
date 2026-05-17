# Alignix

**Autonomous Document Formatting Intelligence Platform**

---

## Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Microsoft Word (for PDF export and live COM automation)

### 2. Setup
```bat
setup.bat
```

### 3. Run (Development)
```bat
run_dev.bat
```

---

## Architecture

```
Alignix/
├── backend/
│   ├── main.py                  # Flask + SocketIO server
│   ├── api/
│   │   ├── routes.py            # REST endpoints
│   │   └── socket_events.py     # Real-time WebSocket events
│   ├── engines/
│   │   ├── analyzer.py          # Document structure analysis
│   │   ├── rule_engine.py       # Formatting rule application
│   │   ├── correction.py        # Correction orchestrator + rollback
│   │   ├── monitor.py           # Watchdog-based live monitoring
│   │   └── export.py            # DOCX/PDF export
│   ├── services/
│   │   ├── profile_service.py   # Profile/template CRUD
│   │   └── document_service.py  # Document session management
│   ├── db/
│   │   └── database.py          # SQLAlchemy models + SQLite
│   └── templates/
│       └── builtin.py           # 6 built-in formatting profiles
│
└── frontend/
    ├── electron/
    │   ├── main.js              # Electron main process
    │   └── preload.js           # Secure IPC bridge
    └── src/
        ├── pages/
        │   ├── dashboard/       # Upload, analyze, correct, export
        │   ├── monitor/         # Live monitoring control + event log
        │   ├── rules/           # Visual rule editor
        │   ├── templates/       # Profile manager
        │   ├── analytics/       # Health scores + charts
        │   └── settings/        # App configuration
        ├── components/          # Layout, Sidebar, TitleBar, UI
        ├── store/appStore.js    # Zustand global state
        ├── services/api.js      # Axios API client
        └── hooks/useSocket.js   # Socket.IO real-time hook
```

---

## Built-in Templates

| Template | Standard |
|---|---|
| IEEE Paper | IEEE conference formatting |
| College Report | Academic report standard |
| Business Proposal | Professional business docs |
| Legal Document | Legal formatting standard |
| Resume | CV/Resume formatting |
| Dissertation | Academic thesis standard |

---

## Core Workflow

```
Open DOCX → Analyze → Detect Issues → Select Profile → Auto-Correct → Export
                                              ↓
                                    Start Live Monitor
                                              ↓
                              Document saved → Violations detected
                                              ↓
                                    Auto-correct + notify
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/document/analyze` | Analyze document structure |
| POST | `/api/document/correct` | Apply formatting corrections |
| POST | `/api/document/health` | Get health scores |
| POST | `/api/document/export` | Export DOCX or PDF |
| GET | `/api/profiles` | List all profiles |
| POST | `/api/profiles` | Create profile |
| GET | `/api/rules/:id` | Get profile rules |
| PUT | `/api/rules/:id` | Update profile rules |
| POST | `/api/monitor/start` | Start live monitoring |
| POST | `/api/monitor/stop` | Stop live monitoring |
