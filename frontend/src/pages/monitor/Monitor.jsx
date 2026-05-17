import { useState, useEffect } from "react";
import { Play, Square, Activity, CheckCircle, AlertTriangle, RefreshCw, FileText, Lock } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { startMonitor, stopMonitor, getWordDocuments, attachWordMonitor } from "@/services/api";
import clsx from "clsx";

export default function Monitor() {
  const {
    activeDocument, activeProfileId, isMonitoring, setMonitoring,
    monitorEvents, notify, integrityLocked, wordDocuments, setWordDocuments,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);

  async function toggleMonitor() {
    if (!activeDocument) { notify("Open a document first", "warning"); return; }
    setLoading(true);
    try {
      if (isMonitoring) {
        await stopMonitor(activeDocument);
        setMonitoring(false);
        notify("Monitoring stopped", "info");
      } else {
        await startMonitor(activeDocument, activeProfileId);
        setMonitoring(true);
        notify("Live monitoring started", "success");
      }
    } catch {
      notify("Monitor action failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function refreshWordDocs() {
    setWordLoading(true);
    try {
      const res = await getWordDocuments();
      setWordDocuments(res.data);
    } catch {
      notify("Could not connect to Word (is it open?)", "warning");
    } finally {
      setWordLoading(false);
    }
  }

  async function attachToWordDoc(path) {
    if (!activeProfileId) { notify("Select a profile first", "warning"); return; }
    try {
      await attachWordMonitor(path, activeProfileId);
      notify(`Attached to ${path.split(/[\\/]/).pop()}`, "success");
    } catch {
      notify("Attach failed", "error");
    }
  }

  const correctedCount = monitorEvents.filter((e) => e.type === "corrected").length;
  const totalFixes = monitorEvents
    .filter((e) => e.type === "corrected")
    .reduce((sum, e) => sum + (e.changes || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Monitor</h1>
          <p className="text-muted text-sm mt-0.5">Autonomous real-time formatting enforcement</p>
        </div>
        <button
          onClick={toggleMonitor}
          disabled={loading}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all",
            isMonitoring
              ? "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20"
              : "btn-primary"
          )}
        >
          {loading
            ? <RefreshCw size={15} className="animate-spin" />
            : isMonitoring ? <Square size={15} /> : <Play size={15} />
          }
          {isMonitoring ? "Stop Monitor" : "Start Monitor"}
        </button>
      </div>

      {/* Status + Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 col-span-1 flex items-center gap-3">
          <div className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isMonitoring ? "bg-success/10" : "bg-surface-2"
          )}>
            <Activity size={18} className={isMonitoring ? "text-success" : "text-muted"} />
          </div>
          <div>
            <div className="text-xs text-muted">Status</div>
            <div className={clsx("font-semibold text-sm", isMonitoring ? "text-success" : "text-muted")}>
              {isMonitoring ? "Active" : "Inactive"}
            </div>
          </div>
          {isMonitoring && <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />}
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{correctedCount}</div>
          <div className="text-xs text-muted mt-0.5">Auto-corrections</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-success">{totalFixes}</div>
          <div className="text-xs text-muted mt-0.5">Issues fixed</div>
        </div>
      </div>

      {/* Active Document */}
      {activeDocument && (
        <div className="card p-4 flex items-center gap-3">
          <FileText size={16} className="text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate">
              {activeDocument.split(/[\\/]/).pop()}
            </div>
            <div className="text-xs text-muted truncate">{activeDocument}</div>
          </div>
          {integrityLocked && (
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <Lock size={12} />
              <span>Integrity Lock</span>
            </div>
          )}
        </div>
      )}

      {/* Word COM Integration */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white text-sm">Word Integration</h2>
          <button
            onClick={refreshWordDocs}
            disabled={wordLoading}
            className="btn-ghost text-xs flex items-center gap-1.5 border border-border"
          >
            <RefreshCw size={12} className={wordLoading ? "animate-spin" : ""} />
            Detect Open Docs
          </button>
        </div>
        {wordDocuments.length === 0 ? (
          <p className="text-muted text-xs py-3 text-center">
            Click "Detect Open Docs" to find active Word documents
          </p>
        ) : (
          <div className="space-y-2">
            {wordDocuments.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2 text-xs">
                <FileText size={14} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{doc.name}</div>
                  <div className="text-muted truncate">{doc.path}</div>
                </div>
                <span className={clsx(
                  "badge shrink-0",
                  doc.saved ? "bg-success/10 text-success border border-success/20"
                            : "bg-warning/10 text-warning border border-warning/20"
                )}>
                  {doc.saved ? "Saved" : "Unsaved"}
                </span>
                <button
                  onClick={() => attachToWordDoc(doc.path)}
                  className="btn-primary text-xs py-1 px-2.5 shrink-0"
                >
                  Attach
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Log */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white text-sm">Event Log</h2>
          {monitorEvents.length > 0 && (
            <span className="text-xs text-muted">{monitorEvents.length} events</span>
          )}
        </div>
        {monitorEvents.length === 0 ? (
          <div className="text-center py-10 text-muted text-sm">
            No events yet — start monitoring to see real-time corrections
          </div>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {monitorEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2 text-xs">
                {ev.type === "corrected"
                  ? <AlertTriangle size={14} className="text-warning shrink-0" />
                  : <CheckCircle size={14} className="text-success shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium">
                    {ev.type === "corrected"
                      ? `Auto-corrected ${ev.changes} issues`
                      : "Document is clean"}
                  </span>
                  {ev.source === "word_com" && (
                    <span className="ml-2 badge bg-accent/10 text-accent border border-accent/20">Word</span>
                  )}
                  <span className="text-muted ml-2">{ev.path?.split(/[\\/]/).pop()}</span>
                </div>
                <span className="text-muted shrink-0">{new Date(ev.ts).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
