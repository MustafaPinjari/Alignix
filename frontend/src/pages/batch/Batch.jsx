import { useState } from "react";
import { Plus, X, Play, CheckCircle, XCircle, RefreshCw, Download } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { runBatch } from "@/services/api";
import clsx from "clsx";

export default function Batch() {
  const { profiles, activeProfileId, setActiveProfileId, notify,
          batchRunning, setBatchRunning, batchProgress, batchResults } = useAppStore();

  const [files, setFiles] = useState([]);
  const [profileId, setProfileId] = useState(activeProfileId || "");
  const [exportFmt, setExportFmt] = useState("");

  async function addFiles() {
    // Open multiple files via electron dialog
    const path = await window.electron?.openFile();
    if (path && !files.includes(path)) {
      setFiles((f) => [...f, path]);
    }
  }

  function removeFile(path) {
    setFiles((f) => f.filter((p) => p !== path));
  }

  async function startBatch() {
    if (!files.length || !profileId) {
      notify("Add files and select a profile first", "warning");
      return;
    }
    setBatchRunning(true);
    try {
      await runBatch(files, Number(profileId), exportFmt);
      notify(`Batch started for ${files.length} files`, "info");
    } catch {
      notify("Batch failed to start", "error");
      setBatchRunning(false);
    }
  }

  const progress = batchProgress
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Batch Automation</h1>
        <p className="text-muted text-sm mt-0.5">Process multiple documents automatically</p>
      </div>

      {/* Config */}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">Formatting Profile</label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="input w-full"
            >
              <option value="">Select profile…</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Export Format (optional)</label>
            <select
              value={exportFmt}
              onChange={(e) => setExportFmt(e.target.value)}
              className="input w-full"
            >
              <option value="">No export</option>
              <option value="docx">DOCX</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        {/* File List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted">Documents ({files.length})</label>
            <button onClick={addFiles} className="btn-ghost text-xs flex items-center gap-1.5 border border-border">
              <Plus size={13} /> Add File
            </button>
          </div>
          {files.length === 0 ? (
            <div
              onClick={addFiles}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent transition-colors"
            >
              <p className="text-muted text-sm">Click to add DOCX files</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2 text-xs">
                  <span className="text-white flex-1 truncate">{f.split(/[\\/]/).pop()}</span>
                  <span className="text-muted truncate max-w-xs hidden sm:block">{f}</span>
                  <button onClick={() => removeFile(f)} className="text-muted hover:text-danger transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={startBatch}
          disabled={batchRunning || !files.length || !profileId}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {batchRunning
            ? <><RefreshCw size={15} className="animate-spin" /> Processing…</>
            : <><Play size={15} /> Run Batch ({files.length} files)</>
          }
        </button>
      </div>

      {/* Progress */}
      {batchRunning && batchProgress && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">
              Processing {batchProgress.current} / {batchProgress.total}
            </span>
            <span className="text-sm text-accent font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {batchProgress.result && (
            <div className="mt-3 text-xs text-muted">
              Last: {batchProgress.result.name} —{" "}
              <span className={batchProgress.result.status === "done" ? "text-success" : "text-danger"}>
                {batchProgress.result.status === "done"
                  ? `${batchProgress.result.changes} corrections`
                  : batchProgress.result.error}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {batchResults.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white text-sm mb-3">
            Results
            <span className="ml-2 text-muted font-normal">
              {batchResults.filter((r) => r.status === "done").length}/{batchResults.length} succeeded
            </span>
          </h2>
          <div className="space-y-2">
            {batchResults.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 text-xs">
                {r.status === "done"
                  ? <CheckCircle size={14} className="text-success shrink-0" />
                  : <XCircle size={14} className="text-danger shrink-0" />
                }
                <span className="text-white font-medium flex-1 truncate">{r.name}</span>
                {r.status === "done" ? (
                  <>
                    <span className="text-muted">{r.changes} fixes</span>
                    {r.health_after && (
                      <span className="badge bg-accent/10 text-accent border border-accent/20">
                        {r.health_after.overall}
                      </span>
                    )}
                    {r.exported && (
                      <button
                        onClick={() => window.electron?.openPath(r.exported)}
                        className="text-accent hover:underline flex items-center gap-1"
                      >
                        <Download size={12} /> Open
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-danger truncate">{r.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
