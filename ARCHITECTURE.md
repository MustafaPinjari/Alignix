# Alignix — Architecture & Diagrams

> Autonomous Document Formatting Intelligence Platform

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ALIGNIX DESKTOP APP                          │
│                     (Electron Shell — Windows)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    FRONTEND LAYER                           │   │
│   │              React + Tailwind CSS + Zustand                 │   │
│   │                                                             │   │
│   │  Dashboard │ Safe Review │ Monitor │ Rules │ Templates      │   │
│   │  Batch     │ Insights    │ Settings                         │   │
│   └──────────────────────┬──────────────────────────────────────┘   │
│                          │  HTTP (Axios) + WebSocket (Socket.IO)    │
│   ┌──────────────────────▼──────────────────────────────────────┐   │
│   │                    BACKEND LAYER                            │   │
│   │              Python — Flask + Flask-SocketIO                │   │
│   │                                                             │   │
│   │  REST API (routes.py)  │  Socket Events (socket_events.py)  │   │
│   └──────────────────────┬──────────────────────────────────────┘   │
│                          │                                          │
│   ┌──────────────────────▼──────────────────────────────────────┐   │
│   │                    ENGINE LAYER                             │   │
│   │                                                             │   │
│   │  Understanding  │  Rule Engine  │  Correction Engine        │   │
│   │  Page Map       │  Sandbox      │  Layout Stabilizer        │   │
│   │  Structure      │  Monitor      │  Batch Engine             │   │
│   │  Word COM       │  Export       │  Analyzer                 │   │
│   └──────────────────────┬──────────────────────────────────────┘   │
│                          │                                          │
│   ┌──────────────────────▼──────────────────────────────────────┐   │
│   │                  PERSISTENCE LAYER                          │   │
│   │           SQLite (SQLAlchemy) — alignix.db                  │   │
│   │                                                             │   │
│   │  profiles │ rules │ document_sessions │ correction_logs     │   │
│   │  integrity_locks                                            │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Folder Structure

```
Alignix/
│
├── backend/
│   ├── main.py                      # Flask + SocketIO entry point
│   ├── requirements.txt
│   │
│   ├── api/
│   │   ├── routes.py                # All REST endpoints
│   │   └── socket_events.py         # WebSocket event handlers
│   │
│   ├── engines/
│   │   ├── analyzer.py              # Basic document analysis
│   │   ├── understanding_engine.py  # Deep structural analysis + confidence
│   │   ├── rule_engine.py           # Formatting rule application
│   │   ├── correction.py            # Correction orchestrator + rollback
│   │   ├── sandbox_engine.py        # Safe preview environment
│   │   ├── page_map_engine.py       # Page boundary detection + protection
│   │   ├── layout_stabilizer.py     # Orphan/overflow/spacing fixes
│   │   ├── structure_analyzer.py    # Hierarchy detection
│   │   ├── monitor.py               # Watchdog file monitoring
│   │   ├── word_com.py              # Microsoft Word COM integration
│   │   ├── batch_engine.py          # Multi-document processing
│   │   └── export.py                # DOCX / PDF export
│   │
│   ├── services/
│   │   ├── profile_service.py       # Profile + rule CRUD
│   │   └── document_service.py      # Session + monitor lifecycle
│   │
│   ├── db/
│   │   └── database.py              # SQLAlchemy models + migrations
│   │
│   └── templates/
│       └── builtin.py               # 6 built-in formatting profiles
│
└── frontend/
    ├── electron/
    │   ├── main.cjs                 # Electron main process
    │   └── preload.cjs              # Secure IPC bridge
    │
    └── src/
        ├── pages/
        │   ├── dashboard/           # Upload, analyze, correct, export
        │   ├── review/              # Safe Review 5-step workflow
        │   ├── monitor/             # Live monitoring + Word COM
        │   ├── rules/               # Visual rule editor
        │   ├── templates/           # Profile manager
        │   ├── batch/               # Multi-file automation
        │   ├── insights/            # Health scores + charts
        │   └── settings/            # App configuration
        │
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   ├── TitleBar.jsx
        │   ├── ErrorBoundary.jsx
        │   └── ui/
        │       ├── ScoreRing.jsx
        │       ├── IssueOverlay.jsx
        │       └── NotificationStack.jsx
        │
        ├── store/appStore.js         # Zustand global state
        ├── services/api.js           # Axios API client
        ├── hooks/useSocket.js        # Socket.IO real-time hook
        └── styles/globals.css        # Tailwind base styles
```

---

## 3. Safe Review Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAFE REVIEW WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

  User Opens DOCX
        │
        ▼
┌───────────────┐
│   STEP 1      │  DocumentUnderstandingEngine.understand()
│   ANALYZE     │  → Assigns role + confidence to every element
│               │  → Calculates structure / layout / risk scores
└───────┬───────┘
        │
        ▼
  Clarifications needed?
  (confidence < 60%)
        │
   YES  │  NO
        │   └──────────────────────┐
        ▼                          ▼
┌───────────────┐          ┌───────────────┐
│   STEP 2      │          │   STEP 3      │
│   CLARIFY     │─────────▶│   SCOPE       │
│               │          │               │
│ Ask targeted  │          │ Page ranges   │
│ questions for │          │ Exclude pages │
│ low-conf      │          │ Protect pages │
│ elements only │          │ Element types │
└───────────────┘          └───────┬───────┘
                                   │
                                   ▼
                           ┌───────────────┐
                           │   STEP 4      │  SandboxEngine.create_preview()
                           │   PREVIEW     │  → Clone document
                           │               │  → Apply scoped rules
                           │ Show diff     │  → Skip excluded pages
                           │ Affected pages│  → Layout stabilization
                           │ Change count  │  → Return diff (no save)
                           └───────┬───────┘
                                   │
                          User approves?
                                   │
                        YES        │  NO
                         │         └──── Discard sandbox
                         ▼
                 ┌───────────────┐
                 │   STEP 5      │  SandboxEngine.commit()
                 │   DONE        │  → Replace original with sandbox
                 │               │  → Persist correction log
                 │ Re-analyze    │  → Re-analyze document
                 └───────────────┘
```

---

## 4. Page-Scoped Correction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  PAGE SCOPE RESOLUTION                          │
└─────────────────────────────────────────────────────────────────┘

  User defines scope:
  ┌─────────────────────────────────────────────────────────┐
  │  include_pages:   "3-15"      (only these pages)        │
  │  exclude_pages:   "1,2,20"    (never touch these)       │
  │  protected_pages: [1, 2, 21]  (locked by user)          │
  └─────────────────────────────────────────────────────────┘
                          │
                          ▼
              PageMapEngine.build_page_map()
              ┌─────────────────────────────┐
              │ Detect page breaks in XML   │
              │ Assign para → page number   │
              │ Auto-detect protected pages │
              │ (title, TOC, appendix, etc) │
              └──────────────┬──────────────┘
                             │
                             ▼
              Resolve excluded_pages set:
              excluded = exclude_pages
                       ∪ protected_pages
                       ∪ (all_pages − include_pages)
                             │
                             ▼
              RuleEngine.apply_rules()
              ┌─────────────────────────────┐
              │ For each paragraph:         │
              │   page = para_page_map[i]   │
              │   if page in excluded_pages │
              │     → SKIP (never modify)   │
              │   else                      │
              │     → Apply formatting rule │
              └─────────────────────────────┘
                             │
                             ▼
              Preview diff shows:
              ┌─────────────────────────────┐
              │  Pages modified:  4-15      │
              │  Pages excluded:  1, 2, 20  │
              │  Total pages:     22        │
              └─────────────────────────────┘
```

---

## 5. Document Understanding Engine

```
┌─────────────────────────────────────────────────────────────────┐
│              DOCUMENT UNDERSTANDING ENGINE                      │
└─────────────────────────────────────────────────────────────────┘

  Input: DOCX file
        │
        ▼
  For each paragraph:
  ┌─────────────────────────────────────────────────────────┐
  │                   ROLE INFERENCE                        │
  │                                                         │
  │  1. Style-based    → "Heading 1" style → heading1 (97%)│
  │  2. Pattern-based  → "^\d+\.\d+" → heading2 (75%)      │
  │  3. Size+Bold      → size > body+6pt → heading1 (70%)  │
  │  4. ALL CAPS short → heading1 (55%)                    │
  │  5. Default        → body (90%)                        │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │                CONFIDENCE SCORING                       │
  │                                                         │
  │  HIGH   ≥ 85%  → Apply correction automatically        │
  │  MEDIUM 60-85% → Apply with caution                    │
  │  LOW    < 60%  → Ask clarification question            │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │              DOCUMENT-LEVEL SCORES                      │
  │                                                         │
  │  Structure Confidence  = avg(element confidences)       │
  │  Layout Confidence     = 1 - (high_risk / total)        │
  │  Correction Risk       = low_conf_count / total         │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  Output:
  ┌─────────────────────────────────────────────────────────┐
  │  elements[]      → role, confidence, risk, issues       │
  │  clarifications  → max 5 targeted questions             │
  │  issues[]        → font, size, alignment, orphan        │
  │  confidence{}    → structure, layout, correction_risk   │
  │  stats{}         → counts per element type              │
  └─────────────────────────────────────────────────────────┘
```

---

## 6. Live Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  LIVE MONITORING SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

  Two monitoring modes run in parallel:

  MODE A — File System (Watchdog)
  ┌─────────────────────────────────────────────────────────┐
  │  watchdog.Observer watches document directory           │
  │        │                                                │
  │        ▼  on_modified event                             │
  │  Debounce timer (1.5s)                                  │
  │        │                                                │
  │        ▼                                                │
  │  CorrectionEngine.check_violations()                    │
  │        │                                                │
  │  violations?  YES → correct() → emit monitor:corrected  │
  │               NO  →            emit monitor:clean       │
  └─────────────────────────────────────────────────────────┘

  MODE B — Word COM (pywin32)
  ┌─────────────────────────────────────────────────────────┐
  │  Poll Word.Application every 2 seconds                  │
  │        │                                                │
  │        ▼  doc.Saved transition: False → True            │
  │  User just saved the document                           │
  │        │                                                │
  │        ▼                                                │
  │  CorrectionEngine.check_violations()                    │
  │        │                                                │
  │  violations?  YES → correct() → emit monitor:corrected  │
  │               NO  →            emit monitor:clean       │
  └─────────────────────────────────────────────────────────┘

  Both modes push events via Socket.IO → Frontend useSocket hook
  → Zustand store → NotificationStack + Monitor event log
```

---

## 7. Correction Engine & Rollback

```
┌─────────────────────────────────────────────────────────────────┐
│              CORRECTION ENGINE — TRANSACTION FLOW               │
└─────────────────────────────────────────────────────────────────┘

  correct(path, profile_id)
        │
        ▼
  1. BACKUP
     └─ copy original → .alignix_backups/{name}.{timestamp}.bak
        │
        ▼
  2. LOAD
     └─ Document(path) → python-docx object
        │
        ▼
  3. APPLY RULES
     └─ RuleEngine.apply_rules(doc, rules, page_map, excluded_pages)
        │  → skip excluded pages
        │  → apply font, size, bold, color, alignment, spacing
        │  → returns change log
        │
        ▼
  4. LAYOUT STABILIZATION
     └─ LayoutStabilizer.stabilize(doc)
        │  → keep-with-next on headings
        │  → table autofit
        │  → spacing collapse prevention
        │  → widow/orphan control
        │
        ▼
  5. SAFE SAVE
     └─ doc.save(path + ".alignix_tmp")
        └─ _safe_replace(tmp → original)  ← retries 5× if file locked
        │
        ▼
  6. PERSIST LOG
     └─ CorrectionLog entries → SQLite
        │
        ▼
  SUCCESS → return {status, changes, log, layout_actions}

  ON ANY ERROR:
        └─ shutil.copy2(backup → original)  ← restore
           return {error, restored: True}
```

---

## 8. Batch Automation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   BATCH AUTOMATION ENGINE                       │
└─────────────────────────────────────────────────────────────────┘

  User selects N documents + profile + export format
        │
        ▼
  BatchEngine.run() → background thread
        │
        ▼
  For each document:
  ┌─────────────────────────────────────────────────────────┐
  │  1. health_score()     → score before                   │
  │  2. correct()          → apply formatting               │
  │  3. health_score()     → score after                    │
  │  4. export()           → DOCX or PDF (optional)         │
  │  5. emit batch:progress → {current, total, result}      │
  └─────────────────────────────────────────────────────────┘
        │
        ▼
  emit batch:complete → {total, succeeded, failed, results[]}
        │
        ▼
  Frontend: progress bar → results table with health delta
```

---

## 9. Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                            │
│                    SQLite — alignix.db                          │
└─────────────────────────────────────────────────────────────────┘

  profiles
  ┌──────────────────────────────────────────┐
  │ id            INTEGER  PK                │
  │ name          TEXT     NOT NULL          │
  │ description   TEXT                       │
  │ integrity_lock BOOLEAN DEFAULT 0         │
  │ created_at    DATETIME                   │
  └──────────────────────────────────────────┘
          │ 1
          │ has many
          │ N
  rules
  ┌──────────────────────────────────────────┐
  │ id            INTEGER  PK                │
  │ profile_id    INTEGER  FK → profiles     │
  │ element       TEXT     (heading1, body…) │
  │ font_name     TEXT                       │
  │ font_size     REAL                       │
  │ bold          INTEGER                    │
  │ italic        INTEGER                    │
  │ color         TEXT                       │
  │ alignment     TEXT                       │
  │ line_spacing  REAL                       │
  │ space_before  REAL                       │
  │ space_after   REAL                       │
  └──────────────────────────────────────────┘

  document_sessions
  ┌──────────────────────────────────────────┐
  │ id                  INTEGER  PK          │
  │ path                TEXT     NOT NULL    │
  │ profile_id          INTEGER  FK          │
  │ integrity_score     REAL                 │
  │ professionalism_score REAL               │
  │ readability_score   REAL                 │
  │ structural_score    REAL                 │
  │ total_corrections   INTEGER              │
  │ last_analyzed       DATETIME             │
  └──────────────────────────────────────────┘
          │ 1
          │ has many
          │ N
  correction_logs
  ┌──────────────────────────────────────────┐
  │ id            INTEGER  PK                │
  │ session_id    INTEGER  FK → sessions     │
  │ element       TEXT                       │
  │ issue         TEXT                       │
  │ action        TEXT                       │
  │ timestamp     DATETIME                   │
  └──────────────────────────────────────────┘

  integrity_locks
  ┌──────────────────────────────────────────┐
  │ id            INTEGER  PK                │
  │ path          TEXT     UNIQUE            │
  │ profile_id    INTEGER  FK → profiles     │
  │ enabled       BOOLEAN                    │
  │ created_at    DATETIME                   │
  └──────────────────────────────────────────┘
```

---

## 10. API Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                       REST API ENDPOINTS                        │
│                    Base URL: http://127.0.0.1:5000/api          │
└─────────────────────────────────────────────────────────────────┘

  DOCUMENT
  ─────────────────────────────────────────────────────────────────
  POST  /document/analyze       Basic structural analysis
  POST  /document/understand    Deep analysis + confidence scores
  POST  /document/health        Health score (integrity/prof/read)
  POST  /document/structure     Hierarchy detection
  POST  /document/overlay       Violation data for UI overlay
  POST  /document/history       Correction log for document
  POST  /document/correct       Apply corrections directly
  POST  /document/export        Export as DOCX or PDF
  POST  /document/pagemap       Page boundary map + protected pages

  SANDBOX (Safe Preview)
  ─────────────────────────────────────────────────────────────────
  POST  /sandbox/preview        Create sandbox + return diff
  POST  /sandbox/commit         Apply sandbox to original
  POST  /sandbox/discard        Delete sandbox copy

  PROFILES & RULES
  ─────────────────────────────────────────────────────────────────
  GET   /profiles               List all profiles
  POST  /profiles               Create profile
  GET   /profiles/:id           Get profile
  PUT   /profiles/:id           Update profile
  DELETE /profiles/:id          Delete profile
  GET   /rules/:profile_id      Get rules for profile
  PUT   /rules/:profile_id      Update rules for profile

  MONITOR
  ─────────────────────────────────────────────────────────────────
  POST  /monitor/start          Start file system monitoring
  POST  /monitor/stop           Stop monitoring
  GET   /monitor/status         Active monitored paths

  INTEGRITY LOCK
  ─────────────────────────────────────────────────────────────────
  POST  /lock/enable            Enable integrity lock for document
  POST  /lock/disable           Disable integrity lock
  POST  /lock/status            Check lock status

  WORD COM
  ─────────────────────────────────────────────────────────────────
  GET   /word/documents         List open Word documents
  POST  /word/attach            Attach COM monitor to document
  POST  /word/detach            Detach COM monitor

  BATCH
  ─────────────────────────────────────────────────────────────────
  POST  /batch/run              Start batch processing (async)

  WEBSOCKET EVENTS (Socket.IO)
  ─────────────────────────────────────────────────────────────────
  monitor:corrected   → {path, source, violations, changes}
  monitor:clean       → {path, source}
  batch:progress      → {current, total, result}
  batch:complete      → {total, succeeded, failed, results[]}
```

---

## 11. Frontend State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  ZUSTAND GLOBAL STATE                           │
│                      appStore.js                                │
└─────────────────────────────────────────────────────────────────┘

  Document State
  ├── activeDocument        string | null
  ├── analysisResult        object | null
  ├── understanding         object | null   (deep analysis)
  ├── healthScore           object | null
  ├── overlayData           array
  ├── structureResult       object | null
  └── correctionHistory     array

  Page Scope State
  ├── pageMap               object | null
  └── pageScope
      ├── include_pages     string  "3-15"
      ├── exclude_pages     string  "1,2,20"
      ├── protected_pages   number[]
      └── elements          string[]

  Safe Review State
  ├── sandboxPreview        object | null
  ├── sandboxScope          object | null
  ├── clarificationAnswers  {[id]: value}
  └── reviewStep            string

  Profile State
  ├── profiles              array
  └── activeProfileId       number | null

  Monitor State
  ├── isMonitoring          boolean
  ├── integrityLocked       boolean
  ├── monitorEvents         array (max 200)
  └── wordDocuments         array

  Batch State
  ├── batchRunning          boolean
  ├── batchProgress         object | null
  └── batchResults          array

  UI State
  ├── loading               {[key]: boolean}
  └── notifications         array (max 8, auto-dismiss 4s)
```

---

## 12. Electron IPC Bridge

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELECTRON IPC BRIDGE                          │
└─────────────────────────────────────────────────────────────────┘

  Renderer Process (React)          Main Process (Electron)
  ────────────────────────          ───────────────────────
  window.electron.openFile()   →    dialog.showOpenDialog()
  window.electron.saveFile()   →    dialog.showSaveDialog()
  window.electron.openPath()   →    shell.openPath()
  window.electron.minimize()   →    mainWindow.minimize()
  window.electron.maximize()   →    mainWindow.maximize()
  window.electron.close()      →    app.quit()

  Security model:
  ├── contextIsolation: true
  ├── nodeIntegration: false
  └── All APIs exposed via contextBridge (preload.cjs)

  Python Backend Lifecycle:
  ├── Spawned on app.whenReady()
  ├── Uses venv/Scripts/python.exe (dev)
  ├── Killed on window-all-closed
  └── Retry on did-fail-load (React not ready yet)
```

---

## 13. Built-in Formatting Profiles

```
┌─────────────────────────────────────────────────────────────────┐
│                  BUILT-IN TEMPLATES                             │
└─────────────────────────────────────────────────────────────────┘

  Profile           Font              Body    Heading 1   Spacing
  ──────────────────────────────────────────────────────────────
  IEEE Paper        Times New Roman   10pt    14pt Bold   1.0×
  College Report    Times New Roman   12pt    18pt Bold   1.5×
  Business Proposal Calibri           11pt    20pt Bold   1.15×
  Legal Document    Times New Roman   12pt    14pt Bold   2.0×
  Resume            Calibri           11pt    16pt Bold   1.15×
  Dissertation      Times New Roman   12pt    16pt Bold   2.0×
```

---

## 14. Confidence Scoring Reference

```
┌─────────────────────────────────────────────────────────────────┐
│               CONFIDENCE SCORING SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

  Element Detection Confidence:
  ┌──────────────────────────────────────────────────────────┐
  │  Source              Example              Confidence     │
  │  ──────────────────────────────────────────────────────  │
  │  Style "Heading 1"   Word built-in style  97%            │
  │  Style "Title"       Word title style     95%            │
  │  Style "Caption"     Word caption style   92%            │
  │  Pattern "^\d+\.\d+" Numbered section     75-78%         │
  │  Size+Bold > +6pt    Large bold text      70%            │
  │  ALL CAPS < 60 chars Short caps line      55%            │
  │  Default body text   Normal paragraph     90%            │
  └──────────────────────────────────────────────────────────┘

  Thresholds:
  ┌──────────────────────────────────────────────────────────┐
  │  ≥ 85%   HIGH    → Auto-correct, no question asked       │
  │  60-85%  MEDIUM  → Correct with caution                  │
  │  < 60%   LOW     → Ask clarification question            │
  └──────────────────────────────────────────────────────────┘

  Document-Level Risk:
  ┌──────────────────────────────────────────────────────────┐
  │  Correction Risk = low_confidence_elements / total       │
  │  > 50%  → High risk warning shown                        │
  │  > 40%  → Warning in scope selector                      │
  │  < 25%  → Safe to proceed automatically                  │
  └──────────────────────────────────────────────────────────┘
```

---

## 15. Tech Stack Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECH STACK                                 │
└─────────────────────────────────────────────────────────────────┘

  Layer             Technology              Purpose
  ──────────────────────────────────────────────────────────────
  Desktop Shell     Electron 31             Window management, IPC
  UI Framework      React 18                Component rendering
  Styling           Tailwind CSS 3          Utility-first CSS
  State             Zustand 4               Global state management
  Routing           React Router 6          Page navigation
  Charts            Recharts 2              Health score charts
  Icons             Lucide React            UI icons
  HTTP Client       Axios                   REST API calls
  WebSocket         Socket.IO Client 4      Real-time events
  Build Tool        Vite 5                  Dev server + bundler
  Packaging         Electron Builder        Windows installer

  Backend           Python 3.13             Runtime
  Web Framework     Flask 3 + Flask-SocketIO REST + WebSocket server
  DOCX Processing   python-docx 1.1         Document read/write
  XML Processing    lxml 6                  Low-level XML ops
  File Monitoring   watchdog 5              File system events
  Word Automation   pywin32 311             COM automation
  Database ORM      SQLAlchemy 2.0          DB abstraction
  Database          SQLite                  Local persistence
  CORS              Flask-CORS              Cross-origin requests
```
