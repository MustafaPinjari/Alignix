import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { RefreshCw } from "lucide-react";
import clsx from "clsx";

const ELEMENT_TYPES = [
  { value: "heading1",  label: "Heading 1" },
  { value: "heading2",  label: "Heading 2" },
  { value: "heading3",  label: "Heading 3" },
  { value: "body",      label: "Body Text" },
  { value: "caption",   label: "Captions" },
  { value: "list_item", label: "Lists" },
  { value: "table",     label: "Tables" },
];

export default function ScopeSelector({ understanding, profiles, activeProfileId, onProfileChange, onPreview, loading }) {
  const { setSandboxScope } = useAppStore();
  const [selected, setSelected] = useState(new Set(ELEMENT_TYPES.map((e) => e.value)));

  function toggle(val) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  function handlePreview() {
    const scope = selected.size === ELEMENT_TYPES.length
      ? null  // null = all elements
      : { elements: [...selected] };
    setSandboxScope(scope);
    onPreview();
  }

  const { issues = [], confidence } = understanding;
  const highIssues   = issues.filter((i) => i.severity === "high");
  const mediumIssues = issues.filter((i) => i.severity === "medium");

  return (
    <div className="space-y-4">
      {/* Issue summary */}
      {issues.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold text-white text-sm mb-3">
            Issues Found
            <span className="ml-2 badge bg-danger/10 text-danger border border-danger/20">{highIssues.length} high</span>
            <span className="ml-1 badge bg-warning/10 text-warning border border-warning/20">{mediumIssues.length} medium</span>
          </h2>
          <IssueNavigator issues={issues} />
        </div>
      )}

      {/* Profile + scope */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-white text-sm">Correction Scope</h2>

        <div>
          <label className="text-xs text-muted block mb-1.5">Formatting Profile</label>
          <select
            value={activeProfileId || ""}
            onChange={(e) => onProfileChange(Number(e.target.value))}
            className="input w-full"
          >
            <option value="">Select profile…</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted block mb-2">Apply corrections to</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelected(new Set(ELEMENT_TYPES.map((e) => e.value)))}
              className="text-xs text-accent hover:underline"
            >
              All
            </button>
            <span className="text-muted text-xs">·</span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-muted hover:text-white"
            >
              None
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {ELEMENT_TYPES.map((el) => (
              <button
                key={el.value}
                onClick={() => toggle(el.value)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  selected.has(el.value)
                    ? "bg-accent/15 text-accent border-accent/40"
                    : "bg-surface-2 text-muted border-border hover:border-accent/30"
                )}
              >
                {el.label}
              </button>
            ))}
          </div>
        </div>

        {confidence.correction_risk > 0.4 && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20 text-xs text-warning">
            <span>⚠</span>
            <span>
              High correction risk detected. Preview will show exact changes before applying.
            </span>
          </div>
        )}

        <button
          onClick={handlePreview}
          disabled={loading || !activeProfileId || selected.size === 0}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Generating Preview…</>
            : "Generate Safe Preview →"
          }
        </button>
      </div>
    </div>
  );
}

function IssueNavigator({ issues }) {
  const [filter, setFilter] = useState("all");
  const ICONS = {
    font_inconsistency: "Ⓕ",
    size_inconsistency: "Ⓕ",
    alignment_issue:    "Ⓢ",
    orphan_heading:     "Ⓗ",
    table:              "Ⓣ",
  };

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
            <span className="text-muted shrink-0 font-mono">
              {ICONS[issue.type] || "⚠"}
            </span>
            <div className="flex-1 min-w-0">
              <span className={clsx(
                "font-medium",
                issue.severity === "high" ? "text-danger" :
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
