<div align="center">

<img src="https://img.shields.io/badge/Alignix-Autonomous%20Formatting-4f8ef7?style=for-the-badge&logo=microsoftword&logoColor=white" />

# 🧠 Alignix

### Autonomous Document Formatting Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Electron](https://img.shields.io/badge/Electron-31-47848F?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> *"The document maintains itself automatically."*

</div>

---

## ⚡ Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| 🐍 Python | 3.10+ |
| 🟢 Node.js | 18+ |
| 📝 Microsoft Word | Any (for PDF export & COM automation) |

```bat
# 1 — Install everything
setup.bat

# 2 — Run in development
run_dev.bat
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Desktop["🖥️ Alignix Desktop App — Electron Shell"]
        subgraph Frontend["🎨 Frontend Layer"]
            UI["React 18 + Tailwind CSS + Zustand"]
            Pages["Dashboard · Safe Review · Monitor · Rules · Templates · Batch · Insights · Settings"]
        end

        subgraph Backend["⚙️ Backend Layer"]
            Flask["Flask 3 + Flask-SocketIO"]
            REST["REST API — routes.py"]
            WS["WebSocket Events — socket_events.py"]
        end

        subgraph Engines["🔧 Engine Layer"]
            UE["🧠 Understanding Engine"]
            RE["📐 Rule Engine"]
            CE["✏️ Correction Engine"]
            PM["📄 Page Map Engine"]
            SB["🔒 Sandbox Engine"]
            LS["📏 Layout Stabilizer"]
            MON["👁️ Monitor Engine"]
            COM["🔗 Word COM"]
            BE["📦 Batch Engine"]
            EX["📤 Export Engine"]
        end

        subgraph DB["💾 Persistence Layer"]
            SQLite["SQLite — alignix.db"]
            Tables["profiles · rules · document_sessions · correction_logs · integrity_locks"]
        end
    end

    UI -->|"HTTP Axios + Socket.IO"| Flask
    Flask --> REST
    Flask --> WS
    REST --> UE & RE & CE & PM & SB & BE & EX
    CE --> LS
    MON --> CE
    COM --> CE
    CE --> SQLite
    SQLite --- Tables
```

---

## 📁 Folder Structure

```mermaid
graph LR
    Root["📁 Alignix/"]

    Root --> B["📁 backend/"]
    Root --> F["📁 frontend/"]

    B --> BM["🐍 main.py"]
    B --> API["📁 api/"]
    B --> ENG["📁 engines/"]
    B --> SVC["📁 services/"]
    B --> DBS["📁 db/"]
    B --> TPL["📁 templates/"]

    API --> R["routes.py"]
    API --> SE["socket_events.py"]

    ENG --> E1["analyzer.py"]
    ENG --> E2["understanding_engine.py"]
    ENG --> E3["rule_engine.py"]
    ENG --> E4["correction.py"]
    ENG --> E5["sandbox_engine.py"]
    ENG --> E6["page_map_engine.py"]
    ENG --> E7["layout_stabilizer.py"]
    ENG --> E8["monitor.py"]
    ENG --> E9["word_com.py"]
    ENG --> E10["batch_engine.py"]
    ENG --> E11["export.py"]

    F --> EL["📁 electron/"]
    F --> SRC["📁 src/"]

    EL --> MC["main.cjs"]
    EL --> PC["preload.cjs"]

    SRC --> PG["📁 pages/"]
    SRC --> CO["📁 components/"]
    SRC --> ST["appStore.js"]
    SRC --> AX["api.js"]

    PG --> P1["dashboard/"]
    PG --> P2["review/"]
    PG --> P3["monitor/"]
    PG --> P4["rules/"]
    PG --> P5["batch/"]
    PG --> P6["insights/"]
```

---

## 🔄 Safe Review Workflow

```mermaid
flowchart TD
    A([🗂️ User Opens DOCX]) --> B

    B["🧠 STEP 1 — ANALYZE\nDocumentUnderstandingEngine.understand()\nAssigns role + confidence to every element\nCalculates structure / layout / risk scores"]

    B --> C{Confidence < 60%?\nClarifications needed?}

    C -->|YES| D["❓ STEP 2 — CLARIFY\nAsk targeted questions\nfor low-confidence elements only\nMax 5 questions"]

    C -->|NO| E
    D --> E

    E["🎯 STEP 3 — SCOPE\nPage Range Selector\nExclude Pages Input\nProtected Pages Manager\nElement Type Filter\nVisual Page Map"]

    E --> F["👁️ STEP 4 — PREVIEW\nSandboxEngine.create_preview()\nClone document\nApply scoped rules\nSkip excluded pages\nLayout stabilization\nReturn diff — original untouched"]

    F --> G{User approves?}

    G -->|✅ YES| H["✅ STEP 5 — DONE\nSandboxEngine.commit()\nReplace original with sandbox\nPersist correction log\nRe-analyze document"]

    G -->|❌ NO| I([🗑️ Discard sandbox\nReturn to Scope])

    I --> E

    style A fill:#1e2535,stroke:#4f8ef7,color:#fff
    style B fill:#1e3a6e,stroke:#4f8ef7,color:#fff
    style D fill:#3d2a00,stroke:#f59e0b,color:#fff
    style E fill:#1e2535,stroke:#a78bfa,color:#fff
    style F fill:#1e2535,stroke:#22c55e,color:#fff
    style H fill:#0f2a1a,stroke:#22c55e,color:#fff
    style I fill:#2a1515,stroke:#ef4444,color:#fff
```

---

## 📄 Page-Scoped Correction Flow

```mermaid
flowchart TD
    A["👤 User defines scope\ninclude_pages: '3-15'\nexclude_pages: '1,2,20'\nprotected_pages: [1, 2, 21]"]

    A --> B["🗺️ PageMapEngine.build_page_map()\nDetect page breaks in XML\nAssign paragraph → page number\nAuto-detect protected pages\nTitle · TOC · Appendix · Signature"]

    B --> C["🔢 Resolve excluded_pages set\nexcluded = exclude_pages\n∪ protected_pages\n∪ all_pages − include_pages"]

    C --> D["📐 RuleEngine.apply_rules()"]

    D --> E{Page in\nexcluded_pages?}

    E -->|YES 🔒| F([⏭️ SKIP — never modify])
    E -->|NO ✅| G([✏️ Apply formatting rule])

    G --> H["📊 Preview diff shows\nPages modified: 4-15\nPages excluded: 1, 2, 20\nTotal pages: 22"]

    style A fill:#1e2535,stroke:#4f8ef7,color:#fff
    style B fill:#1e2535,stroke:#a78bfa,color:#fff
    style C fill:#1e2535,stroke:#f59e0b,color:#fff
    style D fill:#1e3a6e,stroke:#4f8ef7,color:#fff
    style F fill:#2a1515,stroke:#ef4444,color:#fff
    style G fill:#0f2a1a,stroke:#22c55e,color:#fff
    style H fill:#1e2535,stroke:#22c55e,color:#fff
```

---

## 🧠 Document Understanding Engine

```mermaid
flowchart TD
    IN([📄 Input: DOCX file]) --> PARA

    PARA["🔍 For each paragraph"]

    PARA --> ROLE["🏷️ ROLE INFERENCE\n1. Style-based → Heading 1 style → heading1 97%\n2. Pattern-based → ^\d+\.\d+ → heading2 75%\n3. Size+Bold → size > body+6pt → heading1 70%\n4. ALL CAPS short → heading1 55%\n5. Default → body 90%"]

    ROLE --> CONF["📊 CONFIDENCE SCORING\nHIGH ≥ 85% → Auto-correct\nMEDIUM 60-85% → Apply with caution\nLOW < 60% → Ask clarification"]

    CONF --> SCORES["📈 DOCUMENT-LEVEL SCORES\nStructure Confidence = avg element confidences\nLayout Confidence = 1 − high_risk / total\nCorrection Risk = low_conf_count / total"]

    SCORES --> OUT["📦 Output\nelements[] → role, confidence, risk, issues\nclarifications → max 5 targeted questions\nissues[] → font, size, alignment, orphan\nconfidence{} → structure, layout, risk\nstats{} → counts per element type"]

    style IN fill:#1e2535,stroke:#4f8ef7,color:#fff
    style ROLE fill:#1e3a6e,stroke:#4f8ef7,color:#fff
    style CONF fill:#3d2a00,stroke:#f59e0b,color:#fff
    style SCORES fill:#1e2535,stroke:#a78bfa,color:#fff
    style OUT fill:#0f2a1a,stroke:#22c55e,color:#fff
```

---

## 👁️ Live Monitoring Architecture

```mermaid
flowchart LR
    subgraph ModeA["📁 Mode A — File System Watchdog"]
        W1["watchdog.Observer\nwatches document directory"]
        W2["on_modified event"]
        W3["Debounce timer 1.5s"]
        W4["check_violations()"]
        W1 --> W2 --> W3 --> W4
    end

    subgraph ModeB["🔗 Mode B — Word COM pywin32"]
        C1["Poll Word.Application\nevery 2 seconds"]
        C2["doc.Saved transition\nFalse → True"]
        C3["User just saved"]
        C4["check_violations()"]
        C1 --> C2 --> C3 --> C4
    end

    W4 --> DEC{Violations\nfound?}
    C4 --> DEC

    DEC -->|YES| FIX["✏️ correct()\nauto-repair formatting"]
    DEC -->|NO| CLEAN["✅ emit monitor:clean"]

    FIX --> EMIT["📡 emit monitor:corrected\n{path, source, violations, changes}"]

    EMIT --> SOCK["🔌 Socket.IO → useSocket hook"]
    CLEAN --> SOCK

    SOCK --> STORE["🗃️ Zustand Store"]
    STORE --> UI["🔔 NotificationStack\n📋 Monitor Event Log"]

    style ModeA fill:#1e2535,stroke:#4f8ef7
    style ModeB fill:#1e2535,stroke:#a78bfa
    style FIX fill:#0f2a1a,stroke:#22c55e,color:#fff
    style CLEAN fill:#0f2a1a,stroke:#22c55e,color:#fff
```

---

## 🔁 Correction Engine & Rollback

```mermaid
flowchart TD
    START(["⚡ correct(path, profile_id)"]) --> BACKUP

    BACKUP["💾 1. BACKUP\ncopy original →\n.alignix_backups/name.timestamp.bak"]

    BACKUP --> LOAD["📂 2. LOAD\nDocument(path) → python-docx object"]

    LOAD --> RULES["📐 3. APPLY RULES\nRuleEngine.apply_rules()\nSkip excluded pages\nApply font · size · bold · color · alignment · spacing\nReturns change log"]

    RULES --> LAYOUT["📏 4. LAYOUT STABILIZATION\nLayoutStabilizer.stabilize()\nKeep-with-next on headings\nTable autofit\nSpacing collapse prevention\nWidow/orphan control"]

    LAYOUT --> SAVE["💿 5. SAFE SAVE\ndoc.save(path + .alignix_tmp)\n_safe_replace(tmp → original)\nRetries 5× if file locked"]

    SAVE --> LOG["🗃️ 6. PERSIST LOG\nCorrectionLog entries → SQLite"]

    LOG --> SUCCESS(["✅ Return\nstatus · changes · log · layout_actions"])

    RULES -->|Exception| ERR
    LAYOUT -->|Exception| ERR
    SAVE -->|Exception| ERR

    ERR["❌ ERROR HANDLER"]
    ERR --> RESTORE["♻️ shutil.copy2(backup → original)\nRestore original file"]
    RESTORE --> FAIL(["⚠️ Return\nerror · restored: True"])

    style BACKUP fill:#1e2535,stroke:#f59e0b,color:#fff
    style RULES fill:#1e3a6e,stroke:#4f8ef7,color:#fff
    style LAYOUT fill:#1e2535,stroke:#a78bfa,color:#fff
    style SAVE fill:#1e2535,stroke:#22c55e,color:#fff
    style SUCCESS fill:#0f2a1a,stroke:#22c55e,color:#fff
    style ERR fill:#2a1515,stroke:#ef4444,color:#fff
    style RESTORE fill:#3d2a00,stroke:#f59e0b,color:#fff
    style FAIL fill:#2a1515,stroke:#ef4444,color:#fff
```

---

## 📦 Batch Automation Flow

```mermaid
flowchart TD
    A(["👤 User selects N documents\n+ profile + export format"]) --> B

    B["🚀 BatchEngine.run()\nBackground thread"]

    B --> LOOP["🔄 For each document"]

    LOOP --> S1["📊 1. health_score() — score before"]
    S1 --> S2["✏️ 2. correct() — apply formatting"]
    S2 --> S3["📊 3. health_score() — score after"]
    S3 --> S4["📤 4. export() — DOCX or PDF optional"]
    S4 --> S5["📡 5. emit batch:progress\n{current, total, result}"]

    S5 --> MORE{More\ndocuments?}
    MORE -->|YES| LOOP
    MORE -->|NO| DONE

    DONE["📡 emit batch:complete\n{total, succeeded, failed, results[]}"]

    DONE --> UI["🖥️ Frontend\nProgress bar → Results table\nHealth delta per document"]

    style A fill:#1e2535,stroke:#4f8ef7,color:#fff
    style B fill:#1e3a6e,stroke:#4f8ef7,color:#fff
    style DONE fill:#0f2a1a,stroke:#22c55e,color:#fff
    style UI fill:#1e2535,stroke:#a78bfa,color:#fff
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    profiles {
        INTEGER id PK
        TEXT name
        TEXT description
        BOOLEAN integrity_lock
        DATETIME created_at
    }

    rules {
        INTEGER id PK
        INTEGER profile_id FK
        TEXT element
        TEXT font_name
        REAL font_size
        INTEGER bold
        INTEGER italic
        TEXT color
        TEXT alignment
        REAL line_spacing
        REAL space_before
        REAL space_after
    }

    document_sessions {
        INTEGER id PK
        TEXT path
        INTEGER profile_id FK
        REAL integrity_score
        REAL professionalism_score
        REAL readability_score
        REAL structural_score
        INTEGER total_corrections
        DATETIME last_analyzed
    }

    correction_logs {
        INTEGER id PK
        INTEGER session_id FK
        TEXT element
        TEXT issue
        TEXT action
        DATETIME timestamp
    }

    integrity_locks {
        INTEGER id PK
        TEXT path
        INTEGER profile_id FK
        BOOLEAN enabled
        DATETIME created_at
    }

    profiles ||--o{ rules : "has many"
    profiles ||--o{ document_sessions : "used in"
    document_sessions ||--o{ correction_logs : "has many"
    profiles ||--o{ integrity_locks : "locked by"
```

---

## 🌐 API Reference

```mermaid
mindmap
  root((🔌 API\n:5000))
    📄 Document
      POST /document/analyze
      POST /document/understand
      POST /document/health
      POST /document/structure
      POST /document/overlay
      POST /document/history
      POST /document/correct
      POST /document/export
      POST /document/pagemap
    🔒 Sandbox
      POST /sandbox/preview
      POST /sandbox/commit
      POST /sandbox/discard
    👤 Profiles
      GET /profiles
      POST /profiles
      PUT /profiles/:id
      DELETE /profiles/:id
    📐 Rules
      GET /rules/:id
      PUT /rules/:id
    👁️ Monitor
      POST /monitor/start
      POST /monitor/stop
      GET /monitor/status
    🔐 Lock
      POST /lock/enable
      POST /lock/disable
      POST /lock/status
    🔗 Word COM
      GET /word/documents
      POST /word/attach
      POST /word/detach
    📦 Batch
      POST /batch/run
```

---

## 🗃️ Frontend State Architecture

```mermaid
graph TD
    STORE["🗃️ Zustand — appStore.js"]

    STORE --> DOC["📄 Document State\nactiveDocument\nanalysisResult\nunderstanding\nhealthScore\noverlayData\ncorrectionHistory"]

    STORE --> PAGE["📄 Page Scope State\npageMap\npageScope\n  include_pages\n  exclude_pages\n  protected_pages\n  elements"]

    STORE --> REVIEW["🔒 Safe Review State\nsandboxPreview\nsandboxScope\nclarificationAnswers\nreviewStep"]

    STORE --> PROFILE["👤 Profile State\nprofiles\nactiveProfileId"]

    STORE --> MONITOR["👁️ Monitor State\nisMonitoring\nintegrityLocked\nmonitorEvents max 200\nwordDocuments"]

    STORE --> BATCH["📦 Batch State\nbatchRunning\nbatchProgress\nbatchResults"]

    STORE --> UI["🎨 UI State\nloading key boolean\nnotifications max 8"]

    style STORE fill:#1e3a6e,stroke:#4f8ef7,color:#fff
    style DOC fill:#1e2535,stroke:#4f8ef7,color:#fff
    style PAGE fill:#1e2535,stroke:#a78bfa,color:#fff
    style REVIEW fill:#1e2535,stroke:#22c55e,color:#fff
    style PROFILE fill:#1e2535,stroke:#f59e0b,color:#fff
    style MONITOR fill:#1e2535,stroke:#ef4444,color:#fff
    style BATCH fill:#1e2535,stroke:#f472b6,color:#fff
    style UI fill:#1e2535,stroke:#6b7280,color:#fff
```

---

## 🔌 Electron IPC Bridge

```mermaid
sequenceDiagram
    participant R as 🎨 Renderer (React)
    participant P as 🔒 Preload (contextBridge)
    participant M as ⚙️ Main Process (Electron)
    participant PY as 🐍 Python Backend

    Note over M,PY: App startup
    M->>PY: spawn venv/Scripts/python.exe main.py
    PY-->>M: Flask running on :5000

    Note over R,M: Window controls
    R->>P: window.electron.minimize()
    P->>M: ipcRenderer.invoke("window:minimize")
    M-->>R: mainWindow.minimize()

    Note over R,M: File dialogs
    R->>P: window.electron.openFile()
    P->>M: ipcRenderer.invoke("dialog:openFile")
    M-->>R: filePath string

    Note over R,PY: API calls (direct HTTP)
    R->>PY: POST /api/document/analyze
    PY-->>R: {paragraphs, issues, stats}

    Note over PY,R: Real-time events
    PY->>R: Socket.IO emit monitor:corrected
    R-->>R: Zustand store update → UI notification
```

---

## 🎯 Confidence Scoring Reference

```mermaid
graph LR
    subgraph Sources["🔍 Detection Sources"]
        S1["📝 Style 'Heading 1'\nWord built-in → 97%"]
        S2["📝 Style 'Title'\nWord title → 95%"]
        S3["📝 Style 'Caption'\nWord caption → 92%"]
        S4["🔢 Pattern ^\d+\.\d+\nNumbered section → 75-78%"]
        S5["🔠 Size+Bold > +6pt\nLarge bold text → 70%"]
        S6["🔡 ALL CAPS < 60 chars\nShort caps line → 55%"]
        S7["📄 Default body text\nNormal paragraph → 90%"]
    end

    subgraph Thresholds["⚖️ Thresholds"]
        T1["🟢 ≥ 85% HIGH\nAuto-correct\nno question asked"]
        T2["🟡 60-85% MEDIUM\nCorrect with caution"]
        T3["🔴 < 60% LOW\nAsk clarification question"]
    end

    subgraph Risk["📊 Document Risk"]
        R1["Correction Risk =\nlow_conf_elements / total"]
        R2["🔴 > 50% → High risk warning"]
        R3["🟡 > 40% → Warning shown"]
        R4["🟢 < 25% → Safe to proceed"]
    end

    S1 & S2 & S3 --> T1
    S4 & S5 --> T2
    S6 --> T3
    S7 --> T1
    R1 --> R2 & R3 & R4
```

---

## 🛠️ Tech Stack

```mermaid
graph TB
    subgraph Desktop["🖥️ Desktop Layer"]
        EL["⚡ Electron 31\nWindow · IPC · Dialogs"]
    end

    subgraph Frontend["🎨 Frontend Layer"]
        RE["⚛️ React 18\nComponent rendering"]
        TW["🎨 Tailwind CSS 3\nUtility-first styling"]
        ZU["🐻 Zustand 4\nGlobal state"]
        RR["🔀 React Router 6\nPage navigation"]
        RC["📊 Recharts 2\nHealth score charts"]
        AX["📡 Axios\nREST API calls"]
        SI["🔌 Socket.IO Client 4\nReal-time events"]
        VI["⚡ Vite 5\nDev server + bundler"]
    end

    subgraph Backend["⚙️ Backend Layer"]
        PY["🐍 Python 3.13\nRuntime"]
        FL["🌶️ Flask 3\nWeb framework"]
        FS["🔌 Flask-SocketIO\nWebSocket server"]
        PD["📄 python-docx 1.1\nDOCX read/write"]
        LX["🔬 lxml 6\nXML processing"]
        WD["👁️ watchdog 5\nFile monitoring"]
        PW["🔗 pywin32 311\nWord COM automation"]
        SA["🗃️ SQLAlchemy 2.0\nDatabase ORM"]
        SL["💾 SQLite\nLocal persistence"]
    end

    EL --> RE
    RE --> TW & ZU & RR & RC & AX & SI
    AX & SI --> FL
    FL --> FS & PD & LX & WD & PW & SA
    SA --> SL
```

---

## 📋 Built-in Templates

| 📄 Template | 🔤 Font | 📏 Body | 📌 Heading 1 | ↕️ Spacing |
|---|---|---|---|---|
| 🔬 IEEE Paper | Times New Roman | 10pt | 14pt Bold | 1.0× |
| 🎓 College Report | Times New Roman | 12pt | 18pt Bold | 1.5× |
| 💼 Business Proposal | Calibri | 11pt | 20pt Bold | 1.15× |
| ⚖️ Legal Document | Times New Roman | 12pt | 14pt Bold | 2.0× |
| 📋 Resume | Calibri | 11pt | 16pt Bold | 1.15× |
| 🎓 Dissertation | Times New Roman | 12pt | 16pt Bold | 2.0× |

---

## 🔗 Core Workflow

```mermaid
flowchart LR
    A([📂 Open DOCX]) --> B[🧠 Analyze Structure]
    B --> C[🔍 Detect Issues]
    C --> D[🎯 Select Profile]
    D --> E[📄 Set Page Scope]
    E --> F[👁️ Preview Changes]
    F --> G{Approve?}
    G -->|✅| H[✏️ Apply Corrections]
    G -->|❌| E
    H --> I[📤 Export DOCX/PDF]
    H --> J[👁️ Start Live Monitor]
    J --> K{Document saved?}
    K -->|Violations| L[⚡ Auto-correct]
    K -->|Clean| M[✅ Notify clean]
    L --> K

    style A fill:#1e2535,stroke:#4f8ef7,color:#fff
    style H fill:#0f2a1a,stroke:#22c55e,color:#fff
    style L fill:#1e3a6e,stroke:#4f8ef7,color:#fff
    style I fill:#1e2535,stroke:#a78bfa,color:#fff
```

---

<div align="center">

**Built with ❤️ — Alignix © 2024**

*A self-maintaining professional document intelligence platform*

</div>
