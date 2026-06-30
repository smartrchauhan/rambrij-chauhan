"use client";

import { useState, useEffect } from "react";

type HighlightType = "video" | "conference" | "publication" | "award" | "media";

interface Highlight {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  date: string | null;
  published: boolean;
  order: number;
}

const TYPE_LABELS: Record<string, string> = {
  video: "Video",
  conference: "Conference / Talk",
  publication: "Publication",
  award: "Award",
  media: "Media / Press",
};

const EMPTY: Omit<Highlight, "id"> = {
  title: "",
  description: "",
  type: "conference",
  url: "",
  date: "",
  published: true,
  order: 0,
};

export default function HighlightsAdminPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [editing, setEditing] = useState<Highlight | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/highlights").then((r) => r.json()).then(setHighlights);
  }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
  }

  function openEdit(h: Highlight) {
    setEditing(h);
    setForm({
      title: h.title,
      description: h.description ?? "",
      type: h.type,
      url: h.url ?? "",
      date: h.date ? h.date.slice(0, 10) : "",
      published: h.published,
      order: h.order,
    });
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = { ...form, url: form.url || undefined, date: form.date || undefined };
    const url = editing ? `/api/admin/highlights/${editing.id}` : "/api/admin/highlights";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save."); return; }
    const saved = await res.json();
    if (editing) {
      setHighlights((hs) => hs.map((h) => (h.id === saved.id ? saved : h)));
    } else {
      setHighlights((hs) => [...hs, saved]);
    }
    setEditing(null);
    setForm(EMPTY);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this highlight?")) return;
    await fetch(`/api/admin/highlights/${id}`, { method: "DELETE" });
    setHighlights((hs) => hs.filter((h) => h.id !== id));
    if (editing?.id === id) { setEditing(null); setForm(EMPTY); }
  }

  const isFormOpen = editing !== null || form !== EMPTY;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Highlights</h1>
        <button
          onClick={openNew}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          + Add Highlight
        </button>
      </div>

      {/* Form */}
      {(editing !== null || form.title !== "" || isFormOpen) && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {editing ? "Edit Highlight" : "New Highlight"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Keynote at AWS re:Invent 2024"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Brief description"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
              <input
                value={form.url ?? ""}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={form.date ?? ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Display order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-4">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Published (visible on site)
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.title}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
            <button
              onClick={() => { setEditing(null); setForm(EMPTY); setError(""); }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {highlights.length === 0 ? (
        <p className="text-gray-500 text-sm">No highlights yet. Add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {highlights.map((h) => (
            <div
              key={h.id}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(h.type)}`}>
                {TYPE_LABELS[h.type] ?? h.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{h.title}</p>
                {h.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{h.description}</p>}
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  {h.date && <span>{new Date(h.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</span>}
                  {h.url && <span className="truncate">🔗 {h.url}</span>}
                  {!h.published && <span className="text-amber-600 font-medium">Draft</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEdit(h)}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(h.id)}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    video: "bg-red-50 text-red-700",
    conference: "bg-blue-50 text-blue-700",
    publication: "bg-green-50 text-green-700",
    award: "bg-yellow-50 text-yellow-700",
    media: "bg-purple-50 text-purple-700",
  };
  return map[type] ?? "bg-gray-100 text-gray-600";
}
