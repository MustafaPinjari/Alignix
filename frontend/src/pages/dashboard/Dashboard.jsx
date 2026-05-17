import { useState, useEffect } from "react";
import { Upload, Zap, FileCheck, Download, Lock, Unlock, RefreshCw, Eye } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import {
  analyzeDocument, correctDocument, exportDocument, getHealthScore,
  getProfiles, getOverlay, getLockStatus, enableLock, disableLock, getHistory,
} from "@/services/api";
import { ScoreRing } from "@/components/ui/ScoreRing";
import IssueOverlay from "@/components/ui/IssueOverlay";
import clsx from "clsx";

export default function Dashboard() {
  const {
    activeDocument, setActiveDocument, analysisResult, setAnalysisResult,
    healthScore, setHealthScore, profiles, setProfiles, activeProfileId,
    setActiveProfileId, notify, setLoading, loading,
    overlayData, setOverlayData, integrityLocked, setIntegrityLocked,
    correctionHistory, setCorrectionHistory,
  } = useAppStore();

  const [exporting, setExporting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  async function handleOpenFile() {
    const path = await window.electron?.openFile();
    if (!path) return;
    setActiveDocument(path);
    await loadDocument(path);
  }

  async function loadDocument(path) {
    setLoading("analyze", true);
    try {
      const [analysis, health, profilesRes] = await Promise.all([
        analyzeDocument(path),
        getHealthScore(path),
        getProfiles(),
      ]);
      setAnalysisResult(analysis.data);
      setHealthScore(health.data);
      setProfiles(profilesRes.data);
      if (profilesRes.data.length && !activeProfileId) {
        setActiveProfileId(profilesRes.data[0].id);
      }
      // Load lock status
      const lockRes = await getLockStatus(path);
      setIntegrityLocked(lockRes.data.locked);
      notify("Document analyzed", "success");
    } catch {
      notify("Analysis failed — is the backend running?", "error");
    } finally {
      setLoading("analyze", false);
    }
  }

  async function handleCorrect() {
    if (!activeDocument || !activeProfileId) return;
    setLoading("correct", true);
    try {
      const res = await correctDocument(activeDocument, activeProfileId);
      notify(`Corrected ${res.data.changes} formatting issues`, "success");
      const [health, overlay, hist] = await Promise.all([
        getHealthScore(activeDocument),
        getOverlay(activeDocument, activeProfileId),
        getHistory(activeDocument),
      ]);
      setHealthScore(health.data);
      setOverlayData(overlay.data);
      setCorrectionHistory(hist.data);
    } catch {
      notify("Correction failed", "error");
    } finally {
      setLoading("correct", false);
    }
  }

  async function handleLoadOverlay() {
    if (!activeDocument || !activeProfileId) return;
    try {
      const res = await getOverlay(activeDocument, activeProfileId);
      setOverlayData(res.data);
      setShowOverlay(true);
    } catch {
      notify("Could not load overlay", "error");
    }
  }

  async function toggleLock() {
    if (!activeDocument || !activeProfileId) return;
    setLoading("lock", true);
    try {
      if (integrityLocked) {
        await disableLock(activeDocument);
        setIntegrityLocked(false);
        notify("Integrity Lock disabled", "info");
      } else {
        await enableLock(activeDocument, activeProfileId);
        setIntegrityLocked(true);
        notify("Integrity Lock enabled — formatting is now protected", "success");
      }
    } catch {
      notify("Lock toggle failed", "error");
    } finally {
      setLoading("lock", false);
    }
  }

  async function handleExport(fmt) {
    if (!activeDocument) return;
    setExporting(true);
    try {
      const res = await exportDocument(activeDocument, fmt);
      await window.electron?.openPath(res.data.output);
      notify(`Exported as ${fmt.toUpperCase()}`, "success");
    } catch {
      notify("Export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  const scores = healthScore
    ? [
        { label: "Integrity", value: healthScore.integrity, color: "#4f8ef7" },
        { label: "Professional", value: healthScore.professionalism, color: "#22c55e" },
        { label: "Readability", value: healthScore.readability, color: "#f59e0b" },
        { label: "Structure", value: healthScore.structural, color: "#a78bfa" },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-muted text-sm mt-0.5">Autonomous document formatting intelligence</p>
        </div>
        {activeDocument && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadOverlay}
              className="btn-ghost border border-border flex items-center gap-2 text-sm"
            >
              <Eye size={15} /> Overlay
            </button>
            <button
              onClick={toggleLock}
              disabled={loading.lock}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all",
                integrityLocked
                  ? "bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25"
                  : "btn-ghost border border-border"
              )}
            >
              {integrityLocked ? <Lock size={15} /> : <Unlock size={15} />}
              {integrityLocked ? "Locked" : "Lock"}
            </button>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onClick={handleOpenFile}
        className={clsx(
          "card p-8 flex flex-col items-center justify-center gap-3 cursor-pointer",
          "border-dashed border-2 transition-all duration-200 group",
          activeDocument
            ? "border-border hover:border-accent/50"
            : "border-border hover:border-accent hover:shadow-glow"
        )}
      >
        {loading.analyze ? (
          <RefreshCw size={28} className="text-accent animate-spin" />
        ) : (
          <Upload size={28} className="text-muted group-hover:text-accent transition-colors" />
        )}
        <div className="text-center">
          <p className="text-white font-medium text-sm">
            {loading.analyze
              ? "Analyzing document…"
              : activeDocument
              ? activeDocument.split(/[\\/]/).pop()
              : "Click to open a DOCX file"}
          </p>
          {activeDocument && !loading.analyze && (
            <p className="text-muted text-xs mt-1 truncate max-w-md">{activeDocument}</p>
          )}
        </div>
      </div>

      {/* Integrity Lock Banner */}
      {integrityLocked && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/8 border border-accent/20">
          <Lock size={16} className="text-accent shrink-0" />
          <div className="flex-1">
            <span className="text-accent text-sm font-medium">Formatting Integrity Lock Active</span>
            <span className="text-muted text-xs ml-2">
              Violations are automatically corrected on every save
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
      )}

      {/* Health Scores */}
      {healthScore && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="font-semibold text-white text-sm">Document Health</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">{healthScore.overall}</span>
              <span className="text-muted text-sm">/100</span>
            </div>
          </div>
          <div className="flex justify-around">
            {scores.map((s) => (
              <ScoreRing key={s.label} value={s.value} label={s.label} color={s.color} />
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      {analysisResult && (
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(analysisResult.stats).map(([key, val], i) => {
            const colors = ["text-accent", "text-success", "text-warning", "text-purple-400", "text-pink-400"];
            return (
              <div key={key} className="card p-3 text-center">
                <div className={`text-xl font-bold ${colors[i % colors.length]}`}>{val}</div>
                <div className="text-xs text-muted mt-0.5 capitalize">{key.replace(/_/g, " ")}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Overlay Panel */}
      {showOverlay && overlayData.length > 0 && (
        <IssueOverlay
          issues={overlayData}
          onClose={() => setShowOverlay(false)}
          onFixAll={handleCorrect}
        />
      )}

      {/* Issues Summary */}
      {analysisResult?.issues?.length > 0 && !showOverlay && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white text-sm">
              Detected Issues
              <span className="ml-2 badge bg-danger/10 text-danger border border-danger/20">
                {analysisResult.issues.length}
              </span>
            </h2>
            <button onClick={handleLoadOverlay} className="text-xs text-accent hover:underline">
              View overlay →
            </button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {analysisResult.issues.slice(0, 8).map((issue, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface-2 text-xs">
                <span className={clsx(
                  "badge shrink-0",
                  issue.type === "font_inconsistency" ? "bg-danger/10 text-danger border border-danger/20" :
                  issue.type === "size_inconsistency" ? "bg-warning/10 text-warning border border-warning/20" :
                  "bg-muted/10 text-muted border border-border"
                )}>
                  {issue.type.replace(/_/g, " ")}
                </span>
                <span className="text-muted truncate">{issue.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {activeDocument && (
        <div className="flex gap-2">
          {profiles.length > 0 && (
            <select
              value={activeProfileId || ""}
              onChange={(e) => setActiveProfileId(Number(e.target.value))}
              className="input flex-1 text-sm"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleCorrect}
            disabled={loading.correct || !activeProfileId}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Zap size={15} />
            {loading.correct ? "Correcting…" : "Auto-Correct"}
          </button>
          <button
            onClick={() => handleExport("docx")}
            disabled={exporting}
            className="btn-ghost flex items-center gap-2 border border-border text-sm"
          >
            <FileCheck size={15} /> DOCX
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="btn-ghost flex items-center gap-2 border border-border text-sm"
          >
            <Download size={15} /> PDF
          </button>
        </div>
      )}

      {/* Correction History */}
      {correctionHistory.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold text-white text-sm mb-3">Recent Corrections</h2>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {correctionHistory.slice(0, 10).map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-surface-2">
                <span className="badge bg-success/10 text-success border border-success/20 shrink-0">
                  {log.element}
                </span>
                <span className="text-muted flex-1 truncate">{log.issue}</span>
                <span className="text-muted shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
