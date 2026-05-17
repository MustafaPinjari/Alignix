import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import {
  understandDocument, sandboxPreview, sandboxCommit, sandboxDiscard,
  getProfiles,
} from "@/services/api";
import StepIndicator from "./StepIndicator";
import AnalyzeStep    from "./AnalyzeStep";
import ClarifyStep    from "./ClarifyStep";
import PreviewStep    from "./PreviewStep";
import ScopeSelector  from "./ScopeSelector";

const STEPS = ["analyze", "clarify", "scope", "preview", "done"];

export default function Review() {
  const {
    activeDocument, setActiveDocument,
    understanding, setUnderstanding,
    sandboxPreview: preview, setSandboxPreview,
    sandboxScope, setSandboxScope,
    clarificationAnswers, clearClarifications,
    profiles, setProfiles, activeProfileId, setActiveProfileId,
    notify, setLoading, loading,
    reviewStep, setReviewStep,
  } = useAppStore();

  const [step, setStep] = useState("idle"); // idle|analyze|clarify|scope|preview|done

  async function handleOpenFile() {
    const path = await window.electron?.openFile();
    if (!path) return;
    setActiveDocument(path);
    await runAnalysis(path);
  }

  async function runAnalysis(path) {
    setStep("analyze");
    setLoading("understand", true);
    try {
      const [understandRes, profilesRes] = await Promise.all([
        understandDocument(path),
        getProfiles(),
      ]);
      setUnderstanding(understandRes.data);
      setProfiles(profilesRes.data);
      if (profilesRes.data.length && !activeProfileId) {
        setActiveProfileId(profilesRes.data[0].id);
      }
      clearClarifications();
      setSandboxPreview(null);
      // If clarifications needed, go to clarify step; else go to scope
      const hasClarifications = understandRes.data.clarifications?.length > 0;
      setStep(hasClarifications ? "clarify" : "scope");
    } catch {
      notify("Analysis failed — is the backend running?", "error");
      setStep("idle");
    } finally {
      setLoading("understand", false);
    }
  }

  async function handlePreview() {
    if (!activeDocument || !activeProfileId) return;
    setStep("preview");
    setLoading("preview", true);
    try {
      const res = await sandboxPreview(
        activeDocument, activeProfileId,
        sandboxScope, clarificationAnswers
      );
      if (res.data.error) {
        notify(res.data.error, "error");
        setStep("scope");
      } else {
        setSandboxPreview(res.data);
      }
    } catch {
      notify("Preview failed", "error");
      setStep("scope");
    } finally {
      setLoading("preview", false);
    }
  }

  async function handleCommit() {
    setLoading("commit", true);
    try {
      await sandboxCommit(activeDocument);
      notify("Corrections applied successfully", "success");
      setStep("done");
      setSandboxPreview(null);
      await runAnalysis(activeDocument);
    } catch {
      notify("Commit failed", "error");
    } finally {
      setLoading("commit", false);
    }
  }

  async function handleDiscard() {
    if (activeDocument) await sandboxDiscard(activeDocument);
    setSandboxPreview(null);
    setStep("scope");
    notify("Preview discarded", "info");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Safe Review</h1>
          <p className="text-muted text-sm mt-0.5">
            Understand → Clarify → Preview → Apply
          </p>
        </div>
        {activeDocument && step !== "idle" && (
          <button
            onClick={() => runAnalysis(activeDocument)}
            className="btn-ghost border border-border text-sm"
          >
            Re-analyze
          </button>
        )}
      </div>

      <StepIndicator current={step} steps={STEPS} />

      {/* Idle — open file */}
      {step === "idle" && (
        <div
          onClick={handleOpenFile}
          className="card p-12 flex flex-col items-center gap-3 cursor-pointer
                     border-dashed border-2 border-border hover:border-accent hover:shadow-glow
                     transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <span className="text-accent text-2xl">⬆</span>
          </div>
          <p className="text-white font-medium">Open a DOCX file to begin safe review</p>
          <p className="text-muted text-sm">Alignix will analyze before making any changes</p>
        </div>
      )}

      {/* Analyze step */}
      {(step === "analyze" || loading.understand) && (
        <AnalyzeStep loading={loading.understand} understanding={understanding} />
      )}

      {/* Clarify step */}
      {step === "clarify" && understanding && (
        <ClarifyStep
          clarifications={understanding.clarifications}
          onContinue={() => setStep("scope")}
        />
      )}

      {/* Scope step */}
      {step === "scope" && understanding && (
        <ScopeSelector
          understanding={understanding}
          profiles={profiles}
          activeProfileId={activeProfileId}
          onProfileChange={setActiveProfileId}
          onPreview={handlePreview}
          loading={loading.preview}
        />
      )}

      {/* Preview step */}
      {step === "preview" && (
        <PreviewStep
          preview={preview}
          loading={loading.preview}
          onCommit={handleCommit}
          onDiscard={handleDiscard}
          commitLoading={loading.commit}
        />
      )}

      {/* Done */}
      {step === "done" && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-white font-semibold">Corrections applied successfully</p>
          <p className="text-muted text-sm mt-1">Document has been safely formatted</p>
          <button onClick={() => setStep("scope")} className="btn-primary mt-4">
            Apply More Corrections
          </button>
        </div>
      )}
    </div>
  );
}
