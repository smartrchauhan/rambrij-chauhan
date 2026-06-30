"use client";

import { useState } from "react";

const COLLAPSE_LINES = 3;

export default function AboutSection({ initialData, isAdmin }: { initialData: string | null; isAdmin: boolean }) {
  const [bio, setBio] = useState(initialData ?? "");
  const [form, setForm] = useState(initialData ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/content?key=about_bio", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed."); return; }
    setBio(form); setEditing(false);
  }

  if (!bio && !isAdmin) return null;

  return (
    <section id="about" className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">About</h2>
        {isAdmin && !editing && (
          <button onClick={() => { setForm(bio); setEditing(true); setError(""); }}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            ✏ Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea value={form} onChange={(e) => setForm(e.target.value)} rows={7}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Write your bio here…" />
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
      ) : bio ? (
        (() => {
          const paras = bio.split("\n").filter(Boolean);
          const canCollapse = paras.length > COLLAPSE_LINES;
          const visible = expanded || !canCollapse ? paras : paras.slice(0, COLLAPSE_LINES);
          return (
            <div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                {visible.map((para, i) => <p key={i}>{para}</p>)}
              </div>
              {canCollapse && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
                >
                  {expanded ? "Show less ↑" : "Show more ↓"}
                </button>
              )}
            </div>
          );
        })()
      ) : (
        <p className="text-sm text-slate-400 italic">No bio yet — click Edit to add one.</p>
      )}
    </section>
  );
}
