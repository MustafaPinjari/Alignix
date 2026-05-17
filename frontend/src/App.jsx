import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Batch from "@/pages/batch/Batch";
import Dashboard from "@/pages/dashboard/Dashboard";
import Monitor from "@/pages/monitor/Monitor";
import RuleEditor from "@/pages/rules/RuleEditor";
import Templates from "@/pages/templates/Templates";
import Analytics from "@/pages/analytics/Analytics";
import Settings from "@/pages/settings/Settings";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/rules" element={<RuleEditor />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/batch" element={<Batch />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
