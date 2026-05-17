import clsx from "clsx";

const STEP_LABELS = {
  analyze:  "Analyze",
  clarify:  "Clarify",
  scope:    "Scope",
  preview:  "Preview",
  done:     "Done",
};

const ORDER = ["analyze", "clarify", "scope", "preview", "done"];

export default function StepIndicator({ current, steps }) {
  const currentIdx = ORDER.indexOf(current);

  return (
    <div className="flex items-center gap-0">
      {ORDER.map((step, i) => {
        const done    = i < currentIdx;
        const active  = step === current;
        const future  = i > currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={clsx(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                done   && "bg-success text-white",
                active && "bg-accent text-white ring-2 ring-accent/30",
                future && "bg-surface-2 text-muted border border-border",
              )}>
                {done ? "✓" : i + 1}
              </div>
              <span className={clsx(
                "text-xs whitespace-nowrap",
                active ? "text-accent font-medium" : done ? "text-success" : "text-muted"
              )}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < ORDER.length - 1 && (
              <div className={clsx(
                "flex-1 h-px mx-2 mb-4 transition-colors",
                done ? "bg-success/40" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
