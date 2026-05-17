import { useAppStore } from "@/store/appStore";
import clsx from "clsx";

export default function ClarifyStep({ clarifications, onContinue }) {
  const { clarificationAnswers, setClarificationAnswer } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <span className="text-warning text-sm">?</span>
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Clarification Needed</h2>
            <p className="text-muted text-xs mt-0.5">
              {clarifications.length} element{clarifications.length !== 1 ? "s" : ""} need
              your input before safe correction can proceed
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {clarifications.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              answer={clarificationAnswers[q.id] || q.current}
              onAnswer={(val) => setClarificationAnswer(q.id, val)}
            />
          ))}
        </div>
      </div>

      <button onClick={onContinue} className="btn-primary w-full">
        Continue to Scope Selection →
      </button>
    </div>
  );
}

function QuestionCard({ question, answer, onAnswer }) {
  const confPct = Math.round(question.confidence * 100);
  return (
    <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-white whitespace-pre-line">{question.question}</p>
        <span className={clsx(
          "badge shrink-0 text-xs",
          confPct < 50 ? "bg-danger/10 text-danger border border-danger/20"
                       : "bg-warning/10 text-warning border border-warning/20"
        )}>
          {confPct}% conf.
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              answer === opt.value
                ? "bg-accent text-white border-accent"
                : "bg-surface-3 text-muted border-border hover:border-accent/50 hover:text-white"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
