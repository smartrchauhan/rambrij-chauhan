"use client";

import { useState } from "react";

export default function SkillsSection({ initialData, isAdmin }: { initialData: string | null; isAdmin: boolean }) {
  const [skills, setSkills] = useState(initialData ?? "");
  const [form, setForm] = useState(initialData ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const tags = skills.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/content?key=skills", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed."); return; }
    setSkills(form); setEditing(false);
  }

  if (!editing && tags.length === 0 && !isAdmin) return null;

  return (
    <section id="skills" className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Skills & Expertise</h2>
        {isAdmin && !editing && (
          <button onClick={() => { setForm(skills); setEditing(true); setError(""); }}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            ✏ Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea value={form} onChange={(e) => setForm(e.target.value)} rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="AWS, Java, Microservices, CI/CD, Kubernetes, React…" />
          <p className="text-xs text-slate-400">Comma-separated or one per line</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="rounded-lg bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      ) : tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">No skills added yet — click Edit.</p>
      )}
    </section>
  );
}
