import clsx from "clsx";

export function ScoreRing({ value = 0, label, size = 80, color = "#4f8ef7" }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a3347" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="text-center -mt-1">
        <div className="text-lg font-bold text-white">{value}</div>
        {label && <div className="text-xs text-muted">{label}</div>}
      </div>
    </div>
  );
}
