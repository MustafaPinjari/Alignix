import { useState } from "react";
import clsx from "clsx";

const ICONS = {
  font_inconsistency: "Ⓕ",
  size_inconsistency: "Ⓕ",
  alignment_issue:    "Ⓢ",
  orphan_heading:     "Ⓗ",
  table:              "Ⓣ",
  pagination:         "Ⓟ",
};

export default function IssueNavigator({ issues }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  return (
    <div>
      <div className="flex gap-2 mb-2">
        {["all", "high", "medium", "low"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "text-xs px-2 py-0.5 rounded-md border transition-colors capitalize",
              filter === f
                ? "bg-accent/15 text-accent border-accent/30"
                : "text-muted border-border hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {filtered.map((issue, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface-2 text-xs">
            <span className="text-muted shrink-0 font-mono">{ICONS[issue.type] || "⚠"}</span>
            <div className="flex-1 min-w-0">
              <span className={clsx(
                "font-medium",
                issue.severity === "high"   ? "text-danger" :
                issue.severity === "medium" ? "text-warning" : "text-muted"
              )}>
                {issue.type?.replace(/_/g, " ")}
              </span>
              {issue.text && (
                <span className="text-muted ml-2 truncate">"{issue.text}"</span>
              )}
            </div>
            <span className={clsx(
              "badge shrink-0",
              issue.severity === "high"   ? "bg-danger/10 text-danger border border-danger/20" :
              issue.severity === "medium" ? "bg-warning/10 text-warning border border-warning/20" :
              "bg-surface-3 text-muted border border-border"
            )}>
              {issue.severity}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted text-xs py-2 text-center">No {filter} issues</p>
        )}
      </div>
    </div>
  );
}
