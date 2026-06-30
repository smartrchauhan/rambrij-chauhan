"use client";

import { useState, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import Image from "next/image";

interface Resource {
  label: string;
  url: string;
  type: string;
}

interface Highlight {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  imageUrl: string | null;
  date: string | null;
  published: boolean;
  order: number;
  eventName: string | null;
  keyTakeaways: string | null;
  technologies: string | null;
  audience: string | null;
  impactMetrics: string | null;
  transcript: string | null;
  resources: Resource[];
}

const TYPE_LABELS: Record<string, string> = {
  video: "Video",
  conference: "Conference / Talk",
  publication: "Publication",
  award: "Award",
  media: "Media / Press",
};

const RESOURCE_TYPES = ["link", "pdf", "linkedin", "article"];
const RESOURCE_ICONS: Record<string, string> = { pdf: "📄", linkedin: "💼", article: "📰", link: "🔗" };

const EMPTY_RESOURCE: Resource = { label: "", url: "", type: "link" };

const EMPTY = {
  title: "",
  description: "",
  type: "conference",
  url: "",
  imageUrl: "",
  date: "",
  published: true,
  order: 0,
  eventName: "",
  keyTakeaways: "",
  technologies: "",
  audience: "",
  impactMetrics: "",
  transcript: "",
  resources: [] as Resource[],
};

export default function HighlightsAdminPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Highlight | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/highlights").then((r) => r.json()).then(setHighlights);
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY, resources: [] });
    setShowForm(true);
    setError("");
    setUploadProgress("");
  }

  function openEdit(h: Highlight) {
    setEditing(h);
    setShowForm(true);
    setForm({
      title: h.title,
      description: h.description ?? "",
      type: h.type,
      url: h.url ?? "",
      imageUrl: h.imageUrl ?? "",
      date: h.date ? h.date.slice(0, 10) : "",
      published: h.published,
      order: h.order,
      eventName: h.eventName ?? "",
      keyTakeaways: h.keyTakeaways ?? "",
      technologies: h.technologies ?? "",
      audience: h.audience ?? "",
      impactMetrics: h.impactMetrics ?? "",
      transcript: h.transcript ?? "",
      resources: h.resources ?? [],
    });
    setError("");
    setUploadProgress("");
  }

  async function handleImagePick(file: File) {
    setUploading(true);
    setUploadProgress("Compressing…");
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: false,
        onProgress: (p) => setUploadProgress(`Compressing… ${p}%`),
      });
      const originalKB = Math.round(file.size / 1024);
      const compressedKB = Math.round(compressed.size / 1024);
      setUploadProgress(`Uploading… (${originalKB}KB → ${compressedKB}KB)`);
      const { uploadUrl, publicUrl } = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: compressed.type, size: compressed.size }),
      }).then((r) => r.json());
      const putRes = await fetch(uploadUrl, { method: "PUT", body: compressed, headers: { "Content-Type": compressed.type } });
      if (!putRes.ok) throw new Error(`S3 upload failed: ${putRes.status}`);
      setForm((f) => ({ ...f, imageUrl: publicUrl }));
      setUploadProgress(`Done — saved ${originalKB - compressedKB}KB (${Math.round((1 - compressedKB / originalKB) * 100)}% smaller)`);
    } catch {
      setUploadProgress("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function setResource(i: number, patch: Partial<Resource>) {
    setForm((f) => {
      const resources = [...f.resources];
      resources[i] = { ...resources[i], ...patch };
      return { ...f, resources };
    });
  }

  function addResource() {
    setForm((f) => ({ ...f, resources: [...f.resources, { ...EMPTY_RESOURCE }] }));
  }

  function removeResource(i: number) {
    setForm((f) => ({ ...f, resources: f.resources.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      url: form.url || undefined,
      imageUrl: form.imageUrl || undefined,
      date: form.date || undefined,
      eventName: form.eventName || undefined,
      keyTakeaways: form.keyTakeaways || undefined,
      technologies: form.technologies || undefined,
      audience: form.audience || undefined,
      impactMetrics: form.impactMetrics || undefined,
      transcript: form.transcript || undefined,
      resources: form.resources.filter((r) => r.label && r.url),
    };
    const url = editing ? `/api/admin/highlights/${editing.id}` : "/api/admin/highlights";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) { setError("Failed to save."); return; }
    const saved = await res.json();
    if (editing) {
      setHighlights((hs) => hs.map((h) => (h.id === saved.id ? saved : h)));
    } else {
      setHighlights((hs) => [...hs, saved]);
    }
    setEditing(null);
    setShowForm(false);
    setForm({ ...EMPTY, resources: [] });
    setUploadProgress("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this highlight?")) return;
    await fetch(`/api/admin/highlights/${id}`, { method: "DELETE" });
    setHighlights((hs) => hs.filter((h) => h.id !== id));
    if (editing?.id === id) { setEditing(null); setShowForm(false); setForm({ ...EMPTY, resources: [] }); }
  }

  function closeForm() {
    setEditing(null);
    setShowForm(false);
    setForm({ ...EMPTY, resources: [] });
    setError("");
    setUploadProgress("");
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Highlights</h1>
        <button onClick={openNew} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          + Add Highlight
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 space-y-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {editing ? "Edit Highlight" : "New Highlight"}
          </h2>

          {/* ── Basic ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100 w-full">Basic</legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Continuous Testing talk" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Event name</label>
              <input value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. STAR EAST 2026" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief description shown on listing pages" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">YouTube / Link URL</label>
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://youtube.com/..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cover image</label>
              <div className="flex items-start gap-4">
                {form.imageUrl && (
                  <div className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    <button onClick={() => setForm({ ...form, imageUrl: "" })}
                      className="absolute top-0.5 right-0.5 rounded-full bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center">×</button>
                  </div>
                )}
                <div className="flex-1">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImagePick(f); }} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    {uploading ? "Uploading…" : form.imageUrl ? "Replace image" : "Upload image"}
                  </button>
                  {uploadProgress && (
                    <p className={`mt-1 text-xs ${uploadProgress.startsWith("Done") ? "text-green-600" : uploadProgress.includes("failed") ? "text-red-500" : "text-gray-500"}`}>
                      {uploadProgress}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP or GIF · auto-compressed to ≤500KB</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-4">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                Published (visible on site)
              </label>
            </div>
          </fieldset>

          {/* ── Overview tab content ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100 w-full">Overview tab</legend>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Key takeaways <span className="text-gray-400">(comma-separated)</span></label>
              <textarea value={form.keyTakeaways} onChange={(e) => setForm({ ...form, keyTakeaways: e.target.value })}
                rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="CI best practices, shift-left testing, trunk-based development" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Technologies <span className="text-gray-400">(comma-separated)</span></label>
                <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="GitHub Actions, Jest, Playwright" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Audience</label>
                <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="QA engineers, engineering managers" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Impact metrics</label>
              <input value={form.impactMetrics} onChange={(e) => setForm({ ...form, impactMetrics: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="400 attendees, 4.8/5 session rating" />
            </div>
          </fieldset>

          {/* ── Video tab content ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100 w-full">Video tab</legend>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Transcript <span className="text-gray-400">(shown below embedded player)</span></label>
              <textarea value={form.transcript} onChange={(e) => setForm({ ...form, transcript: e.target.value })}
                rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Paste talk transcript here…" />
            </div>
          </fieldset>

          {/* ── Resources tab content ── */}
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-100 w-full">Resources tab</legend>
            <div className="space-y-2">
              {form.resources.map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select value={r.type} onChange={(e) => setResource(i, { type: e.target.value })}
                    className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-28">
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{RESOURCE_ICONS[t]} {t}</option>
                    ))}
                  </select>
                  <input value={r.label} onChange={(e) => setResource(i, { label: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Label, e.g. Slide deck (PDF)" />
                  <input value={r.url} onChange={(e) => setResource(i, { url: e.target.value })}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://…" />
                  <button onClick={() => removeResource(i)}
                    className="mt-1 text-red-500 hover:text-red-700 text-lg leading-none px-1">×</button>
                </div>
              ))}
              <button onClick={addResource}
                className="text-xs text-blue-700 font-medium hover:underline">
                + Add resource
              </button>
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !form.title || uploading}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
            <button onClick={closeForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {highlights.length === 0 ? (
        <p className="text-gray-500 text-sm">No highlights yet.</p>
      ) : (
        <div className="space-y-3">
          {highlights.map((h) => (
            <div key={h.id} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4">
              {h.imageUrl && (
                <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-gray-100">
                  <Image src={h.imageUrl} alt={h.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${typeColor(h.type)}`}>
                    {TYPE_LABELS[h.type] ?? h.type}
                  </span>
                  {!h.published && <span className="text-xs text-amber-600 font-medium">Draft</span>}
                  {h.eventName && <span className="text-xs text-gray-400">{h.eventName}</span>}
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{h.title}</p>
                {h.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{h.description}</p>}
                {h.date && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(h.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(h)} className="text-xs text-blue-700 hover:underline font-medium">Edit</button>
                <button onClick={() => handleDelete(h.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
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
