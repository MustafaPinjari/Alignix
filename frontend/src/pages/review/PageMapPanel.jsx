import { useState } from "react";
import { Lock } from "lucide-react";
import { parse_page_range_js } from "./pageRangeUtils";
import clsx from "clsx";

// Page states: editable | excluded | protected | selected
function getPageState(page, pageScope, totalPages) {
  const pg = page.page;
  const protected_pages = new Set(pageScope.protected_pages || []);
  const excluded = parseRangeSet(pageScope.exclude_pages, totalPages);
  const included = pageScope.include_pages
    ? parseRangeSet(pageScope.include_pages, totalPages)
    : null;

  if (protected_pages.has(pg)) return "protected";
  if (excluded.has(pg))        return "excluded";
  if (included && !included.has(pg)) return "excluded";
  return "editable";
}

function parseRangeSet(str, total) {
  if (!str || !str.trim()) return new Set();
  const pages = new Set();
  for (const part of str.split(",")) {
    const t = part.trim();
    if (t.includes("-")) {
      const [a, b] = t.split("-").map(Number);
      for (let i = a; i <= Math.min(b, total); i++) pages.add(i);
    } else {
      const n = parseInt(t);
      if (!isNaN(n)) pages.add(n);
    }
  }
  return pages;
}

const STATE_STYLES = {
  editable:  "bg-accent/15 border-accent/30 text-accent",
  excluded:  "bg-surface-3 border-border text-muted opacity-50",
  protected: "bg-warning/10 border-warning/30 text-warning",
};

const STATE_LABELS = {
  editable:  "Will be corrected",
  excluded:  "Excluded",
  protected: "Protected 🔒",
};

export default function PageMapPanel({ pageMap, pageScope, updatePageScope }) {
  const [lastSelected, setLastSelected] = useState(null);
  const { pages = [], total_pages = 0, suggested_protected = [] } = pageMap;

  function handlePageClick(pg, e) {
    const state = getPageState({ page: pg }, pageScope, total_pages);

    if (e.shiftKey && lastSelected !== null) {
      // Range select → add to exclude
      const min = Math.min(lastSelected, pg);
      const max = Math.max(lastSelected, pg);
      const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      const current = parseRangeSet(pageScope.exclude_pages, total_pages);
      range.forEach((p) => current.add(p));
      updatePageScope("exclude_pages", [...current].sort((a, b) => a - b).join(", "));
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl+click → toggle protected
      const current = new Set(pageScope.protected_pages || []);
      current.has(pg) ? current.delete(pg) : current.add(pg);
      updatePageScope("protected_pages", [...current].sort((a, b) => a - b));
    } else {
      // Single click → toggle excluded
      const current = parseRangeSet(pageScope.exclude_pages, total_pages);
      current.has(pg) ? current.delete(pg) : current.add(pg);
      updatePageScope("exclude_pages", [...current].sort((a, b) => a - b).join(", "));
    }
    setLastSelected(pg);
  }

  const editableCount  = pages.filter((p) => getPageState(p, pageScope, total_pages) === "editable").length;
  const excludedCount  = pages.filter((p) => getPageState(p, pageScope, total_pages) === "excluded").length;
  const protectedCount = pages.filter((p) => getPageState(p, pageScope, total_pages) === "protected").length;

  return (
    <div className="space-y-3">
      {/* Legend + stats */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-accent/30 border border-accent/50" />
          <span className="text-muted">{editableCount} editable</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-surface-3 border border-border opacity-50" />
          <span className="text-muted">{excludedCount} excluded</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-warning/20 border border-warning/40" />
          <span className="text-muted">{protectedCount} protected</span>
        </span>
        <span className="text-muted/50 ml-auto">Click=exclude · Ctrl+click=protect · Shift+click=range</span>
      </div>

      {/* Page grid */}
      <div className="grid gap-1.5 max-h-56 overflow-y-auto pr-1"
           style={{ gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))" }}>
        {pages.map((page) => {
          const state = getPageState(page, pageScope, total_pages);
          return (
            <button
              key={page.page}
              onClick={(e) => handlePageClick(page.page, e)}
              title={`Page ${page.page}: ${STATE_LABELS[state]}\n${page.preview || "Empty"}`}
              className={clsx(
                "relative flex flex-col items-center justify-center rounded-lg border p-1.5",
                "text-xs transition-all duration-100 hover:scale-105 cursor-pointer select-none",
                STATE_STYLES[state]
              )}
            >
              {state === "protected" && (
                <Lock size={8} className="absolute top-0.5 right-0.5 text-warning" />
              )}
              <span className="font-mono font-bold leading-none">{page.page}</span>
              {page.headings > 0 && (
                <span className="text-[9px] opacity-60 mt-0.5">H{page.headings}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Suggested protected notice */}
      {suggested_protected.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>💡 Suggested protected:</span>
          <span className="text-warning">pages {suggested_protected.join(", ")}</span>
          <button
            onClick={() => updatePageScope("protected_pages", suggested_protected)}
            className="text-accent hover:underline ml-1"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
