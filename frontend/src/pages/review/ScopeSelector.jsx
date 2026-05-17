import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { getPageMap } from "@/services/api";
import { RefreshCw, Lock, Shield, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import PageMapPanel from "./PageMapPanel";
import IssueNavigator from "./IssueNavigator";

const ELEMENT_TYPES = [
  { value: "heading1",  label: "Heading 1" },
  { value: "heading2",  label: "Heading 2" },
  { value: "heading3",  label: "Heading 3" },
  { value: "body",      label: "Body Text" },
  { value: "caption",   label: "Captions" },
  { value: "list_item", label: "Lists" },
  { value: "table",     label: "Tables" },
];

export default function ScopeSelector({
  understanding, profiles, activeProfileId, onProfileChange, onPreview, loading,
}) {
  const {
    activeDocument, pageMap, setPageMap,
    pageScope, updatePageScope, setSandboxScope,
  } = useAppStore();

  const [elements, setElements] = useState(new Set(ELEMENT_TYPES.map((e) => e.value)));
  const [mapLoading, setMapLoading] = useState(false);
  const [tab, setTab] = useState("pages"); // pages | elements

  // Load page map when component mounts
  useEffect(() => {
    if (activeDocument && !pageMap) loadPageMap();
  }, [activeDocument]);

  async function loadPageMap() {
    setMapLoading(true);
    try {
      const res = await getPageMap(activeDocument);
      setPageMap(res.data);
      // Auto-apply suggested protected pages
      if (res.data.suggested_protected?.length) {
        updatePageScope("protected_pages", res.data.suggested_protected);
      }
    } catch {
      // page map is optional — continue without it
    } finally {
      setMapLoading(false);
    }
  }

  function toggleElement(val) {
    setElements((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  function handlePreview() {
    const scope = {
      elements: elements.size === ELEMENT_TYPES.length ? [] : [...elements],
      include_pages: pageScope.include_pages,
      exclude_pages: pageScope.exclude_pages,
      protected_pages: pageScope.protected_pages,
    };
    setSandboxScope(scope);
    onPreview();
  }

  const { issues = [], confidence } = understanding;
  const highIssues   = issues.filter((i) => i.severity === "high");
  const mediumIssues = issues.filter((i) => i.severity === "medium");
  const totalPages   = pageMap?.total_pages || 0;

  // Build scope summary
  const scopeSummary = buildScopeSummary(pageScope, totalPages);

  return (
    <div className="space-y-4">
      {/* Issues */}
      {issues.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-white text-sm">Issues Found</h2>
            <span className="badge bg-danger/10 text-danger border border-danger/20">{highIssues.length} high</span>
            <span className="badge bg-warning/10 text-warning border border-warning/20">{mediumIssues.length} medium</span>
          </div>
          <IssueNavigator issues={issues} />
        </div>
      )}

      {/* Profile */}
      <div className="card p-4">
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

      {/* Scope Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border">
          {[
            { id: "pages",    label: "Page Scope" },
            { id: "elements", label: "Element Scope" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "text-accent border-b-2 border-accent bg-accent/5"
                  : "text-muted hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "pages" && (
            <PageScopeTab
              pageMap={pageMap}
              pageScope={pageScope}
              updatePageScope={updatePageScope}
              mapLoading={mapLoading}
              onReload={loadPageMap}
              totalPages={totalPages}
            />
          )}
          {tab === "elements" && (
            <ElementScopeTab
              elements={elements}
              onToggle={toggleElement}
              onSelectAll={() => setElements(new Set(ELEMENT_TYPES.map((e) => e.value)))}
              onSelectNone={() => setElements(new Set())}
            />
          )}
        </div>
      </div>

      {/* Scope Summary */}
      <ScopeSummaryCard summary={scopeSummary} totalPages={totalPages} />

      {/* Risk warning */}
      {confidence.correction_risk > 0.4 && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20 text-xs text-warning">
          <span>⚠</span>
          <span>High correction risk detected. Preview will show exact changes before applying.</span>
        </div>
      )}

      <button
        onClick={handlePreview}
        disabled={loading || !activeProfileId || elements.size === 0}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading
          ? <><RefreshCw size={14} className="animate-spin" /> Generating Preview…</>
          : "Generate Safe Preview →"
        }
      </button>
    </div>
  );
}

// ── Page Scope Tab ────────────────────────────────────────────────────────────

function PageScopeTab({ pageMap, pageScope, updatePageScope, mapLoading, onReload, totalPages }) {
  return (
    <div className="space-y-4">
      {/* Page range inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">
            Include pages only
            <span className="ml-1 text-muted/60">(e.g. 3-15, 1,4,7)</span>
          </label>
          <input
            value={pageScope.include_pages}
            onChange={(e) => updatePageScope("include_pages", e.target.value)}
            placeholder="Leave empty for all pages"
            className="input w-full text-xs"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">
            Exclude pages
            <span className="ml-1 text-muted/60">(e.g. 1,2,20-22)</span>
          </label>
          <input
            value={pageScope.exclude_pages}
            onChange={(e) => updatePageScope("exclude_pages", e.target.value)}
            placeholder="Pages to never modify"
            className="input w-full text-xs"
          />
        </div>
      </div>

      {/* Protected pages */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-muted flex items-center gap-1">
            <Lock size={11} /> Protected pages
          </label>
          {pageMap?.suggested_protected?.length > 0 && (
            <button
              onClick={() => updatePageScope("protected_pages", pageMap.suggested_protected)}
              className="text-xs text-accent hover:underline"
            >
              Use suggested ({pageMap.suggested_protected.join(", ")})
            </button>
          )}
        </div>
        <ProtectedPagesInput
          value={pageScope.protected_pages}
          onChange={(v) => updatePageScope("protected_pages", v)}
          totalPages={totalPages}
        />
      </div>

      {/* Visual page map */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted">Visual Page Map</label>
          <button
            onClick={onReload}
            disabled={mapLoading}
            className="text-xs text-muted hover:text-white flex items-center gap-1"
          >
            <RefreshCw size={11} className={mapLoading ? "animate-spin" : ""} />
            {mapLoading ? "Loading…" : "Reload"}
          </button>
        </div>
        {mapLoading ? (
          <div className="flex items-center justify-center py-6 text-muted text-xs gap-2">
            <RefreshCw size={14} className="animate-spin" /> Building page map…
          </div>
        ) : pageMap ? (
          <PageMapPanel
            pageMap={pageMap}
            pageScope={pageScope}
            updatePageScope={updatePageScope}
          />
        ) : (
          <div className="text-center py-4 text-muted text-xs">
            Page map unavailable
          </div>
        )}
      </div>
    </div>
  );
}

// ── Element Scope Tab ─────────────────────────────────────────────────────────

function ElementScopeTab({ elements, onToggle, onSelectAll, onSelectNone }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button onClick={onSelectAll}  className="text-xs text-accent hover:underline">Select All</button>
        <span className="text-muted text-xs">·</span>
        <button onClick={onSelectNone} className="text-xs text-muted hover:text-white">Select None</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {ELEMENT_TYPES.map((el) => (
          <button
            key={el.value}
            onClick={() => onToggle(el.value)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              elements.has(el.value)
                ? "bg-accent/15 text-accent border-accent/40"
                : "bg-surface-2 text-muted border-border hover:border-accent/30"
            )}
          >
            {el.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Protected Pages Input ─────────────────────────────────────────────────────

function ProtectedPagesInput({ value, onChange, totalPages }) {
  const [input, setInput] = useState(value.join(", "));

  function handleBlur() {
    const pages = input
      .split(/[,\s]+/)
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= totalPages);
    onChange([...new Set(pages)].sort((a, b) => a - b));
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={handleBlur}
        placeholder="e.g. 1, 2, 20, 21"
        className="input flex-1 text-xs"
      />
      {value.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {value.map((pg) => (
            <span key={pg} className="badge bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
              <Lock size={9} /> {pg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Scope Summary Card ────────────────────────────────────────────────────────

function ScopeSummaryCard({ summary, totalPages }) {
  if (!summary.hasScope) return null;
  return (
    <div className="card p-4 border-accent/20 bg-accent/5">
      <h3 className="text-xs font-semibold text-accent mb-2 flex items-center gap-1.5">
        <Shield size={12} /> Correction Scope Summary
      </h3>
      <div className="space-y-1 text-xs text-muted">
        {summary.include && <div><span className="text-white">Include:</span> pages {summary.include}</div>}
        {summary.exclude && <div><span className="text-white">Exclude:</span> pages {summary.exclude}</div>}
        {summary.protected.length > 0 && (
          <div><span className="text-white">Protected:</span> pages {summary.protected.join(", ")} 🔒</div>
        )}
        {totalPages > 0 && (
          <div className="text-muted/70 mt-1">
            Document has {totalPages} pages total
          </div>
        )}
      </div>
    </div>
  );
}

function buildScopeSummary(pageScope, totalPages) {
  const hasScope = pageScope.include_pages || pageScope.exclude_pages || pageScope.protected_pages.length > 0;
  return {
    hasScope,
    include:   pageScope.include_pages || null,
    exclude:   pageScope.exclude_pages || null,
    protected: pageScope.protected_pages,
  };
}
