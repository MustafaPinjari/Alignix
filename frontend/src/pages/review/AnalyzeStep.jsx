import { RefreshCw } from "lucide-react";
import { ScoreRing } from "@/components/ui/ScoreRing";

export default function AnalyzeStep({ loading, understanding }) {
  if (loading || !understanding) {
    return (
      <div className="card p-10 flex flex-col items-center gap-4">
        <RefreshCw size={28} className="text-accent animate-spin" />
        <p className="text-white font-medium">Analyzing document structure…</p>
        <p className="text-muted text-sm">Detecting elements, confidence levels, and risks</p>
      </div>
    );
  }

  const { confidence, stats, issues } = understanding;
  const riskColor = confidence.correction_risk > 0.5 ? "#ef4444"
                  : confidence.correction_risk > 0.25 ? "#f59e0b"
                  : "#22c55e";

  return (
    <div className="space-y-4">
      {/* Confidence scores */}
      <div className="card p-5">
        <h2 className="font-semibold text-white text-sm mb-5">Document Intelligence Report</h2>
        <div className="flex justify-around">
          <ScoreRing
            value={Math.round(confidence.structure * 100)}
            label="Structure"
            color="#4f8ef7"
          />
          <ScoreRing
            value={Math.round(confidence.layout * 100)}
            label="Layout"
            color="#22c55e"
          />
          <ScoreRing
            value={Math.round((1 - confidence.correction_risk) * 100)}
            label="Safety"
            color={riskColor}
          />
        </div>
        {confidence.correction_risk > 0.3 && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20 text-xs text-warning">
            <span>⚠</span>
            <span>
              {Math.round(confidence.correction_risk * 100)}% of elements have low confidence.
              Clarification questions will help ensure safe corrections.
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          ["Paragraphs", stats.total_paragraphs, "text-accent"],
          ["Headings",   stats.headings,          "text-purple-400"],
          ["Tables",     stats.tables,             "text-warning"],
          ["Low Conf.",  stats.low_confidence,     "text-danger"],
        ].map(([label, val, color]) => (
          <div key={label} className="card p-3 text-center">
            <div className={`text-xl font-bold ${color}`}>{val}</div>
            <div className="text-xs text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
