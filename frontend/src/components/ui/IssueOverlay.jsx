import { X, Zap, AlertTriangle, AlertCircle, Info } from "lucide-react";
import clsx from "clsx";

const SEVERITY_CONFIG = {
  high: { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/8 border-danger/20" },
  medium: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/8 border-warning/20" },
  low: { icon: Info, color: "text-muted", bg: "bg-surface-2 border-border" },
};

export default function IssueOverlay({ issues, onClose, onFixAll }) {
  const high = issues.filter((i) => i.severity === "high");
  const medium = issues.filter((i) => i.severity === "medium");
  const low = issues.filter((i) => i.severity === "low");

  return (
    <div className="card p-4 border-accent/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white text-sm">Formatting Overlay</span>
          <span className="badge bg-danger/10 text-danger border border-danger/20">{high.length} high</span>
          <span className="badge bg-warning/10 text-warning border border-warning/20">{medium.length} medium</span>
          <span className="badge bg-surface-3 text-muted border border-border">{low.length} low</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onFixAll} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
            <Zap size={13} /> Fix All
          </button>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {issues.map((issue, i) => {
          const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.low;
          const Icon = cfg.icon;
          return (
            <div key={i} className={clsx("flex items-start gap-3 p-2.5 rounded-xl border text-xs", cfg.bg)}>
              <Icon size={14} className={clsx(cfg.color, "shrink-0 mt-0.5")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={clsx("font-medium capitalize", cfg.color)}>
                    {issue.element}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-muted">{issue.type?.replace(/_/g, " ")}</span>
                </div>
                <p className="text-muted truncate">{issue.message}</p>
                {issue.text && (
                  <p className="text-muted/60 truncate mt-0.5 font-mono">"{issue.text}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
