import { RefreshCw, CheckCircle, X } from "lucide-react";
import clsx from "clsx";

export default function PreviewStep({ preview, loading, onCommit, onDiscard, commitLoading }) {
  if (loading || !preview) {
    return (
      <div className="card p-10 flex flex-col items-center gap-4">
        <RefreshCw size={28} className="text-accent animate-spin" />
        <p className="text-white font-medium">Generating safe preview…</p>
        <p className="text-muted text-sm">Simulating corrections in sandbox — original untouched</p>
      </div>
    );
  }

  if (preview.error) {
    return (
      <div className="card p-6 border-danger/20">
        <p className="text-danger font-medium">Preview failed</p>
        <p className="text-muted text-sm mt-1">{preview.error}</p>
        <button onClick={onDiscard} className="btn-ghost border border-border mt-3 text-sm">
          Go Back
        </button>
      </div>
    );
  }

  const { changes, layout_actions, diff, safe_to_apply } = preview;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm">Correction Preview</h2>
          <div className="flex items-center gap-2">
            <span className="badge bg-accent/10 text-accent border border-accent/20">
              {changes} changes
            </span>
            {layout_actions > 0 && (
              <span className="badge bg-success/10 text-success border border-success/20">
                {layout_actions} layout fixes
              </span>
            )}
          </div>
        </div>

        {!safe_to_apply && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20 text-xs text-warning mb-4">
            <span>⚠</span>
            <span>Some corrections may affect layout. Review the diff carefully before applying.</span>
          </div>
        )}

        {/* Diff list */}
        {diff.length === 0 ? (
          <div className="text-center py-6 text-muted text-sm">
            No formatting changes needed — document already matches the profile
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {diff.map((entry, i) => (
              <DiffRow key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onDiscard}
          disabled={commitLoading}
          className="btn-ghost border border-border flex items-center gap-2 flex-1 justify-center"
        >
          <X size={15} /> Discard
        </button>
        <button
          onClick={onCommit}
          disabled={commitLoading || diff.length === 0}
          className="btn-primary flex items-center gap-2 flex-1 justify-center"
        >
          {commitLoading
            ? <><RefreshCw size={14} className="animate-spin" /> Applying…</>
            : <><CheckCircle size={15} /> Apply {changes} Corrections</>
          }
        </button>
      </div>
    </div>
  );
}

function DiffRow({ entry }) {
  return (
    <div className="p-3 rounded-xl bg-surface-2 text-xs space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="badge bg-accent/10 text-accent border border-accent/20 capitalize">
          {entry.element}
        </span>
        {entry.text && (
          <span className="text-muted truncate flex-1">"{entry.text}"</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(entry.changes || []).map((change, i) => (
          <span key={i} className="px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/20 font-mono">
            {change}
          </span>
        ))}
      </div>
    </div>
  );
}
