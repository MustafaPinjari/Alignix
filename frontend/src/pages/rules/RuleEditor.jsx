import { useState, useEffect } from "react";
import { Plus, Save, Trash2, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { getProfiles, getRules, updateRules, createProfile } from "@/services/api";
import clsx from "clsx";

const ELEMENTS = ["heading1", "heading2", "heading3", "body", "caption", "list", "table"];
const ALIGNMENTS = ["left", "center", "right", "justify"];

const DEFAULT_RULE = {
  element: "body", font_name: "Times New Roman", font_size: 12,
  bold: false, italic: false, color: "#000000",
  alignment: "justify", line_spacing: 1.5, space_before: 0, space_after: 6,
};

export default function RuleEditor() {
  const { profiles, setProfiles, activeProfileId, setActiveProfileId, notify } = useAppStore();
  const [rules, setRules] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfiles().then((r) => setProfiles(r.data));
  }, []);

  useEffect(() => {
    if (activeProfileId) {
      getRules(activeProfileId).then((r) => setRules(r.data));
    }
  }, [activeProfileId]);

  function addRule() {
    setRules((prev) => [...prev, { ...DEFAULT_RULE, id: Date.now() }]);
  }

  function removeRule(idx) {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRule(idx, field, value) {
    setRules((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }

  async function saveRules() {
    if (!activeProfileId) return;
    setSaving(true);
    try {
      await updateRules(activeProfileId, rules);
      notify("Rules saved", "success");
    } catch {
      notify("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleNewProfile() {
    const name = prompt("Profile name:");
    if (!name) return;
    const res = await createProfile({ name, rules: [] });
    const updated = await getProfiles();
    setProfiles(updated.data);
    setActiveProfileId(res.data.id);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rule Editor</h1>
          <p className="text-muted text-sm mt-1">Define formatting rules per document element</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleNewProfile} className="btn-ghost border border-border flex items-center gap-2">
            <Plus size={16} /> New Profile
          </button>
          <button onClick={saveRules} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? "Saving…" : "Save Rules"}
          </button>
        </div>
      </div>

      {/* Profile Selector */}
      <div className="card p-4 flex items-center gap-3">
        <span className="text-sm text-muted">Profile:</span>
        <select
          value={activeProfileId || ""}
          onChange={(e) => setActiveProfileId(Number(e.target.value))}
          className="input flex-1"
        >
          <option value="">Select profile…</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <RuleRow key={rule.id || idx} rule={rule} idx={idx}
            onChange={updateRule} onRemove={removeRule} />
        ))}
        <button onClick={addRule} className="w-full card p-3 border-dashed border-2 text-muted hover:text-accent hover:border-accent transition-colors flex items-center justify-center gap-2 text-sm">
          <Plus size={16} /> Add Rule
        </button>
      </div>
    </div>
  );
}

function RuleRow({ rule, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-2 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="badge bg-accent/10 text-accent border border-accent/20 capitalize">
          {rule.element}
        </span>
        <span className="text-sm text-muted flex-1">
          {rule.font_name} · {rule.font_size}pt · {rule.alignment}
          {rule.bold ? " · Bold" : ""}{rule.italic ? " · Italic" : ""}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
          className="text-muted hover:text-danger transition-colors p-1">
          <Trash2 size={14} />
        </button>
        <ChevronDown size={16} className={clsx("text-muted transition-transform", open && "rotate-180")} />
      </div>

      {open && (
        <div className="border-t border-border p-4 grid grid-cols-3 gap-3">
          <Field label="Element">
            <select value={rule.element} onChange={(e) => onChange(idx, "element", e.target.value)} className="input w-full">
              {ELEMENTS.map((el) => <option key={el} value={el}>{el}</option>)}
            </select>
          </Field>
          <Field label="Font Name">
            <input value={rule.font_name || ""} onChange={(e) => onChange(idx, "font_name", e.target.value)} className="input w-full" />
          </Field>
          <Field label="Font Size (pt)">
            <input type="number" value={rule.font_size || ""} onChange={(e) => onChange(idx, "font_size", Number(e.target.value))} className="input w-full" />
          </Field>
          <Field label="Alignment">
            <select value={rule.alignment || "left"} onChange={(e) => onChange(idx, "alignment", e.target.value)} className="input w-full">
              {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Line Spacing">
            <input type="number" step="0.1" value={rule.line_spacing || ""} onChange={(e) => onChange(idx, "line_spacing", Number(e.target.value))} className="input w-full" />
          </Field>
          <Field label="Color">
            <input type="color" value={rule.color || "#000000"} onChange={(e) => onChange(idx, "color", e.target.value.replace("#", ""))} className="input w-full h-9 p-1 cursor-pointer" />
          </Field>
          <Field label="Bold">
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={!!rule.bold} onChange={(e) => onChange(idx, "bold", e.target.checked)} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-muted">Bold</span>
            </label>
          </Field>
          <Field label="Italic">
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={!!rule.italic} onChange={(e) => onChange(idx, "italic", e.target.checked)} className="w-4 h-4 accent-accent" />
              <span className="text-sm text-muted">Italic</span>
            </label>
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-muted mb-1 block">{label}</label>
      {children}
    </div>
  );
}
