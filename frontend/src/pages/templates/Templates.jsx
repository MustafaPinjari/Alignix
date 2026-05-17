import { useEffect, useState } from "react";
import { BookOpen, Trash2, Check } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { getProfiles, deleteProfile } from "@/services/api";
import clsx from "clsx";

export default function Templates() {
  const { profiles, setProfiles, activeProfileId, setActiveProfileId, notify } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProfiles()
      .then((r) => setProfiles(r.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this profile?")) return;
    await deleteProfile(id);
    const updated = await getProfiles();
    setProfiles(updated.data);
    notify("Profile deleted", "info");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Templates</h1>
        <p className="text-muted text-sm mt-1">Formatting profiles for different document types</p>
      </div>

      {loading ? (
        <div className="text-muted text-sm">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {profiles.map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveProfileId(p.id)}
              className={clsx(
                "card p-5 cursor-pointer transition-all duration-150 hover:shadow-glow",
                activeProfileId === p.id && "border-accent shadow-glow"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    activeProfileId === p.id ? "bg-accent/20" : "bg-surface-2"
                  )}>
                    <BookOpen size={18} className={activeProfileId === p.id ? "text-accent" : "text-muted"} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-muted mt-0.5">{p.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeProfileId === p.id && (
                    <Check size={16} className="text-accent" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    className="text-muted hover:text-danger transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted">
                Created {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
