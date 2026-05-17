import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Activity, Sliders, BookTemplate,
  BarChart2, Settings, FileText, Layers, ShieldCheck,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import clsx from "clsx";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/review",    icon: ShieldCheck,     label: "Safe Review" },
  { to: "/monitor",   icon: Activity,        label: "Live Monitor" },
  { to: "/rules",     icon: Sliders,         label: "Rule Editor" },
  { to: "/templates", icon: BookTemplate,    label: "Templates" },
  { to: "/batch",     icon: Layers,          label: "Batch" },
  { to: "/insights",  icon: BarChart2,       label: "Insights" },
  { to: "/settings",  icon: Settings,        label: "Settings" },
];

export default function Sidebar() {
  const activeDocument = useAppStore((s) => s.activeDocument);
  const isMonitoring = useAppStore((s) => s.isMonitoring);

  return (
    <aside className="w-56 bg-surface-1 border-r border-border flex flex-col py-4 gap-1 shrink-0">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-accent-muted text-accent"
                : "text-muted hover:text-white hover:bg-surface-2"
            )
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}

      <div className="mt-auto mx-2 p-3 rounded-xl bg-surface-2 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={14} className="text-muted" />
          <span className="text-xs text-muted truncate">
            {activeDocument ? activeDocument.split(/[\\/]/).pop() : "No document"}
          </span>
        </div>
        {isMonitoring && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success">Monitoring</span>
          </div>
        )}
      </div>
    </aside>
  );
}
