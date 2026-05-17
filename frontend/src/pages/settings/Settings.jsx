import { useState } from "react";
import { Save } from "lucide-react";

const SETTINGS_KEY = "alignix_settings";

const defaults = {
  autoCorrectOnSave: true,
  monitorDebounceMs: 1500,
  backupEnabled: true,
  theme: "dark",
  backendPort: 5000,
};

function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  function update(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted text-sm mt-1">Configure Alignix behavior</p>
      </div>

      <div className="card p-6 space-y-5">
        <ToggleSetting
          label="Auto-correct on document save"
          description="Automatically apply formatting corrections when a monitored document is saved"
          value={settings.autoCorrectOnSave}
          onChange={(v) => update("autoCorrectOnSave", v)}
        />
        <ToggleSetting
          label="Backup before correction"
          description="Create a backup copy before applying any formatting changes"
          value={settings.backupEnabled}
          onChange={(v) => update("backupEnabled", v)}
        />
        <div className="border-t border-border pt-5">
          <label className="text-sm font-medium text-white block mb-1">
            Monitor debounce delay (ms)
          </label>
          <p className="text-xs text-muted mb-2">Wait time after document save before triggering correction</p>
          <input
            type="number"
            value={settings.monitorDebounceMs}
            onChange={(e) => update("monitorDebounceMs", Number(e.target.value))}
            className="input w-40"
            min={500}
            max={10000}
            step={500}
          />
        </div>
        <div className="border-t border-border pt-5">
          <label className="text-sm font-medium text-white block mb-1">Backend Port</label>
          <p className="text-xs text-muted mb-2">Port the Python backend server runs on</p>
          <input
            type="number"
            value={settings.backendPort}
            onChange={(e) => update("backendPort", Number(e.target.value))}
            className="input w-40"
          />
        </div>
      </div>

      <button onClick={save} className="btn-primary flex items-center gap-2">
        <Save size={16} />
        {saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-muted mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          value ? "bg-accent" : "bg-surface-3"
        }`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
          value ? "left-6" : "left-1"
        }`} />
      </button>
    </div>
  );
}
