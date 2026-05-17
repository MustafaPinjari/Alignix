import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { getHistory } from "@/services/api";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#4f8ef7", "#22c55e", "#f59e0b", "#a78bfa", "#f472b6"];

export default function Analytics() {
  const { healthScore, analysisResult, activeDocument, correctionHistory, setCorrectionHistory } = useAppStore();

  useEffect(() => {
    if (activeDocument) {
      getHistory(activeDocument).then((r) => setCorrectionHistory(r.data)).catch(() => {});
    }
  }, [activeDocument]);

  if (!healthScore || !analysisResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
        <div className="card p-12 text-center">
          <p className="text-muted text-sm">Open and analyze a document to see metrics</p>
        </div>
      </div>
    );
  }

  const radarData = [
    { metric: "Integrity", value: healthScore.integrity },
    { metric: "Professional", value: healthScore.professionalism },
    { metric: "Readability", value: healthScore.readability },
    { metric: "Structure", value: healthScore.structural },
  ];

  const issueData = Object.entries(
    analysisResult.issues.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name: name.replace(/_/g, " "), count }));

  // Build correction trend from history (group by element)
  const elementCounts = correctionHistory.reduce((acc, log) => {
    acc[log.element] = (acc[log.element] || 0) + 1;
    return acc;
  }, {});
  const trendData = Object.entries(elementCounts).map(([element, count]) => ({ element, count }));

  const scores = [
    { label: "Integrity", value: healthScore.integrity, color: "#4f8ef7" },
    { label: "Professional", value: healthScore.professionalism, color: "#22c55e" },
    { label: "Readability", value: healthScore.readability, color: "#f59e0b" },
    { label: "Structure", value: healthScore.structural, color: "#a78bfa" },
  ];

  const tooltipStyle = {
    contentStyle: { background: "#1e2535", border: "1px solid #2a3347", borderRadius: 8, fontSize: 12 },
    labelStyle: { color: "#fff" },
    itemStyle: { color: "#6b7280" },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted text-sm mt-0.5">Document formatting intelligence metrics</p>
      </div>

      {/* Overall Score */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <span className="font-semibold text-white text-sm">Health Scores</span>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-white">{healthScore.overall}</span>
            <span className="text-muted">/100</span>
          </div>
        </div>
        <div className="flex justify-around">
          {scores.map((s) => (
            <ScoreRing key={s.label} value={s.value} label={s.label} color={s.color} size={88} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Radar */}
        <div className="card p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Quality Radar</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a3347" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Radar dataKey="value" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Issues Bar */}
        <div className="card p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Issues by Type</h2>
          {issueData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
              No issues detected 🎉
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={issueData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} width={120} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {issueData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Correction Frequency */}
      {trendData.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white text-sm mb-4">Correction Frequency by Element</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trendData}>
              <CartesianGrid stroke="#2a3347" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="element" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Document Stats */}
      <div className="card p-5">
        <h2 className="font-semibold text-white text-sm mb-4">Document Structure</h2>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(analysisResult.stats).map(([key, val], i) => (
            <div key={key} className="text-center p-3 rounded-xl bg-surface-2">
              <div className="text-2xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>{val}</div>
              <div className="text-xs text-muted mt-1 capitalize">{key.replace(/_/g, " ")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Corrections Table */}
      {correctionHistory.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white text-sm mb-3">
            Correction Log
            <span className="ml-2 text-muted font-normal text-xs">{correctionHistory.length} entries</span>
          </h2>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {correctionHistory.map((log, i) => (
              <div key={i} className="grid grid-cols-4 gap-3 p-2.5 rounded-xl bg-surface-2 text-xs">
                <span className="badge bg-accent/10 text-accent border border-accent/20 w-fit">{log.element}</span>
                <span className="text-muted col-span-2 truncate">{log.issue}</span>
                <span className="text-muted text-right">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
