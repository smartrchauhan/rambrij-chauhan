"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export interface Highlight {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  imageUrl: string | null;
  slidesUrl: string | null;
  date: Date | null;
}

const TYPE_META: Record<string, { label: string; icon: string; colors: string }> = {
  video:         { label: "Video",             icon: "▶",  colors: "bg-red-50 text-red-700 border-red-100" },
  conference:    { label: "Conference / Talk", icon: "🎤", colors: "bg-blue-50 text-blue-700 border-blue-100" },
  publication:   { label: "Publication",       icon: "📄", colors: "bg-green-50 text-green-700 border-green-100" },
  award:         { label: "Award",             icon: "🏆", colors: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  media:         { label: "Media / Press",     icon: "📰", colors: "bg-purple-50 text-purple-700 border-purple-100" },
  linkedin_post: { label: "LinkedIn Post",     icon: "in", colors: "bg-sky-50 text-sky-700 border-sky-200" },
};

const TYPE_OPTIONS: Record<string, string> = {
  conference:    "Conference / Talk",
  video:         "Video",
  linkedin_post: "LinkedIn Post",
  publication:   "Publication",
  media:         "Media / Press",
  award:         "Award",
};

export function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function detectTypeFromUrl(url: string): string | null {
  if (/linkedin\.com/.test(url)) return "linkedin_post";
  if (/youtube\.com|youtu\.be/.test(url)) return "video";
  return null;
}

function parseEmbedSrc(code: string): string | null {
  const m = code.match(/src=["']([^"']+)["']/);
  return m ? m[1] : null;
}

function linkedInPostUrl(embedSrc: string): string {
  return embedSrc.replace("www.linkedin.com/embed/feed/", "www.linkedin.com/feed/").split("?")[0];
}

// ─── MediaCarousel (kept for detail page imports) ───────────────────────────

export type MediaItem =
  | { kind: "image"; src: string; caption?: string }
  | { kind: "video"; ytId: string; href: string };

function ThumbnailStrip({ items, active, onSelect }: {
  items: MediaItem[]; active: number; onSelect: (i: number) => void;
}) {
  if (items.length <= 1) return null;
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
      {items.map((item, i) => (
        <button key={i} onClick={() => onSelect(i)}
          className={`relative shrink-0 w-20 h-12 rounded-md overflow-hidden border-2 transition-all ${
            i === active ? "border-blue-600 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
          }`} aria-label={`Media ${i + 1}`}>
          {item.kind === "image" ? (
            <Image src={item.src} alt="" fill className="object-cover" unoptimized />
          ) : (
            <>
              <Image src={`https://img.youtube.com/vi/${item.ytId}/mqdefault.jpg`} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-white text-xs">▶</span>
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

export function MediaCarousel({ items, title, variant = "row" }: {
  items: MediaItem[]; title: string; variant?: "row" | "detail";
}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  if (items.length === 0) return null;
  const current = items[idx];
  const isDetail = variant === "detail";
  function navigate(next: number) { setIdx(next); setPlaying(false); }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-md">
        {current.kind === "image" && (
          <Image src={current.src} alt={title} fill className="object-cover" unoptimized />
        )}
        {current.kind === "video" && (
          (isDetail || playing) ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${current.ytId}?rel=0&modestbranding=1${playing ? "&autoplay=1" : ""}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          ) : (
            <button className="absolute inset-0 w-full h-full group" onClick={() => setPlaying(true)} aria-label="Play video">
              <Image src={`https://img.youtube.com/vi/${current.ytId}/maxresdefault.jpg`} alt={title} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">▶</div>
              </div>
            </button>
          )
        )}
        {items.length > 1 && (
          <>
            <button onClick={() => navigate((idx - 1 + items.length) % items.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors text-xl z-10">‹</button>
            <button onClick={() => navigate((idx + 1) % items.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors text-xl z-10">›</button>
          </>
        )}
      </div>
      {isDetail && current.kind === "image" && current.caption && (
        <p className="mt-2 text-xs text-center text-gray-500 italic">{current.caption}</p>
      )}
      {isDetail ? (
        <ThumbnailStrip items={items} active={idx} onSelect={setIdx} />
      ) : (
        items.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {items.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Media ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-blue-600" : "w-2 bg-gray-300 hover:bg-gray-400"}`} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Inline add/edit form ────────────────────────────────────────────────────

interface FormData { title: string; type: string; url: string; imageUrl: string; description: string; date: string; embedCode: string; slidesUrl: string; }
const EMPTY_FORM: FormData = { title: "", type: "conference", url: "", imageUrl: "", description: "", date: "", embedCode: "", slidesUrl: "" };

function HighlightForm({
  initial,
  highlightId,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: FormData;
  highlightId?: string;
  onSave: (h: Highlight) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  function handleUrlChange(url: string) {
    const detected = detectTypeFromUrl(url);
    setForm((f) => ({ ...f, url, ...(detected ? { type: detected } : {}) }));
  }

  async function handleImageUpload(file: File) {
    setImgUploading(true);
    try {
      const { uploadUrl, publicUrl } = await fetch("/api/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      }).then((r) => r.json());
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setForm((f) => ({ ...f, imageUrl: publicUrl }));
    } catch {
      setError("Image upload failed.");
    } finally {
      setImgUploading(false);
    }
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");
    try {
      const isEdit = !!highlightId;
      const res = await fetch(
        isEdit ? `/api/admin/highlights/${highlightId}` : "/api/admin/highlights",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            type: form.type,
            url: form.url || "",
            imageUrl: form.imageUrl || "",
            description: form.description || "",
            date: form.date || undefined,
            slidesUrl: form.slidesUrl || "",
            published: true,
          }),
        }
      );
      if (!res.ok) throw new Error();
      const saved = await res.json();
      onSave({ ...saved, date: saved.date ? new Date(saved.date) : null });
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!highlightId || !onDelete) return;
    if (!confirm("Delete this highlight?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/highlights/${highlightId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete();
    } catch {
      setError("Delete failed.");
      setDeleting(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls} placeholder="Talk title, post headline, article name…" />
      </div>
      {form.type === "linkedin_post" ? (
        /* LinkedIn: just URL + image upload */
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              LinkedIn Post URL <span className="text-slate-400">— the link to your post</span>
            </label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
              className={inputCls} placeholder="https://www.linkedin.com/posts/…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Post Image <span className="text-slate-400">— upload a screenshot of the post</span>
            </label>
            <div className="flex items-center gap-3">
              <input ref={imgRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              <button type="button" onClick={() => imgRef.current?.click()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                {imgUploading ? "Uploading…" : form.imageUrl ? "Replace image" : "Upload screenshot"}
              </button>
              {form.imageUrl && (
                <div className="relative h-14 w-24 rounded-lg overflow-hidden border border-slate-200">
                  <Image src={form.imageUrl} alt="preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}>
                {Object.entries(TYPE_OPTIONS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputCls} />
            </div>
          </div>
        </div>
      ) : (
        /* All other types */
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              URL <span className="text-slate-400">— paste YouTube, article, or any link (type auto-detected)</span>
            </label>
            <input value={form.url} onChange={(e) => handleUrlChange(e.target.value)}
              className={inputCls} placeholder="https://youtu.be/…  or  https://example.com/article" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}>
                {Object.entries(TYPE_OPTIONS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} className={inputCls} placeholder="Brief summary…" />
          </div>
          {form.type === "conference" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Google Slides URL
              </label>
              <input value={form.slidesUrl} onChange={(e) => setForm({ ...form, slidesUrl: e.target.value })}
                className={inputCls} placeholder="https://docs.google.com/presentation/d/e/…/pub" />
              {form.slidesUrl && !form.slidesUrl.includes("/d/e/") && (
                <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠ This looks like a private share link — viewers will see a Google login screen.
                  In Google Slides go to <strong>File → Share → Publish to web</strong>, copy the published link (it contains <code>/d/e/</code>), and paste that instead.
                </p>
              )}
              {!form.slidesUrl && (
                <p className="mt-1 text-xs text-slate-400">
                  Must be published to web: <strong>File → Share → Publish to web</strong> in Google Slides. The URL will contain <code>/d/e/</code>.
                </p>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cover Image <span className="text-slate-400">— thumbnail, slide preview, etc.</span>
            </label>
            <div className="flex items-center gap-3">
              <input ref={imgRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              <button type="button" onClick={() => imgRef.current?.click()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                {imgUploading ? "Uploading…" : form.imageUrl ? "Replace image" : "Upload image"}
              </button>
              {form.imageUrl && (
                <div className="relative h-10 w-16 rounded overflow-hidden border border-slate-200">
                  <Image src={form.imageUrl} alt="preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving || !form.title.trim()}
          className="rounded-lg bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
          {saving ? "Saving…" : highlightId ? "Update" : "Add Highlight"}
        </button>
        <button onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        {highlightId && onDelete && (
          <button onClick={handleDelete} disabled={deleting}
            className="ml-auto text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Card components ─────────────────────────────────────────────────────────

function LinkedInPostCard({ h, isAdmin, onEdit }: { h: Highlight; isAdmin: boolean; onEdit: () => void }) {
  const postUrl = h.url || null;

  return (
    <div className="group flex flex-col rounded-xl border border-sky-200 overflow-hidden hover:shadow-md transition-all bg-white">
      {/* Clickable image — opens LinkedIn post */}
      {h.imageUrl ? (
        <a href={postUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative w-full bg-slate-50 overflow-hidden" style={{ minHeight: 180, maxHeight: 400 }}>
            <Image src={h.imageUrl} alt={h.title} width={600} height={400} className="w-full h-auto object-contain" unoptimized />
            {/* LinkedIn badge overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#0A66C2] rounded-full px-2.5 py-1 shadow">
              <div className="h-3.5 w-3.5 bg-white rounded flex items-center justify-center shrink-0">
                <span className="text-[#0A66C2] font-bold" style={{ fontSize: 8 }}>in</span>
              </div>
              <span className="text-white text-xs font-semibold leading-none">LinkedIn</span>
            </div>
          </div>
        </a>
      ) : (
        /* No image: show LinkedIn branded placeholder */
        <a href={postUrl ?? "#"} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center aspect-video bg-gradient-to-br from-[#0A66C2] to-[#004182]">
          <div className="text-center text-white">
            <div className="text-4xl font-bold mb-1">in</div>
            <p className="text-xs opacity-80">LinkedIn Post</p>
          </div>
        </a>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{h.title}</p>
        {h.date && (
          <p className="text-xs text-slate-400">
            {new Date(h.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
        {postUrl ? (
          <a href={postUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold text-[#0A66C2] hover:underline">
            View on LinkedIn ↗
          </a>
        ) : <span />}
        {isAdmin && (
          <button onClick={onEdit}
            className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded px-2 py-0.5 hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100">
            ✏ Edit
          </button>
        )}
      </div>
    </div>
  );
}

interface OgData { title: string | null; description: string | null; image: string | null; siteName: string | null; }

function HighlightCard({ h, isAdmin, onEdit }: { h: Highlight; isAdmin: boolean; onEdit: () => void }) {
  const meta = TYPE_META[h.type] ?? { label: h.type, icon: "★", colors: "bg-gray-50 text-gray-600 border-gray-100" };
  const ytId = h.url ? getYouTubeId(h.url) : null;
  const staticThumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : h.imageUrl ?? null;

  const needsOg = !staticThumb && !!h.url && !ytId && h.type !== "linkedin_post";
  const [og, setOg] = useState<OgData | null>(null);

  useEffect(() => {
    if (!needsOg) return;
    fetch(`https://api.microlink.io?url=${encodeURIComponent(h.url!)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.status === "success") {
          setOg({
            title: data.data.title ?? null,
            description: data.data.description ?? null,
            image: data.data.image?.url ?? data.data.screenshot?.url ?? null,
            siteName: data.data.publisher ?? new URL(h.url!).hostname.replace("www.", "") ?? null,
          });
        }
      })
      .catch(() => {});
  }, [needsOg, h.url]);

  const thumb = staticThumb ?? og?.image ?? null;
  const displayTitle = h.title;
  const displayDesc = h.description || og?.description || null;
  const siteName = og?.siteName ?? null;

  const cardHref = h.url && !ytId ? h.url : `/highlights/${h.id}`;
  const cardTarget = h.url && !ytId ? "_blank" : undefined;
  const cardRel = h.url && !ytId ? "noopener noreferrer" : undefined;

  return (
    <div className="group relative flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all bg-white">
      <a href={cardHref} target={cardTarget} rel={cardRel} className="block">
        <div className="relative aspect-video bg-slate-100">
          {thumb ? (
            <Image src={thumb} alt={displayTitle} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
              {og === null && needsOg
                ? <span className="text-slate-300 text-sm animate-pulse">Loading preview…</span>
                : meta.icon}
            </div>
          )}
          {ytId && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 text-white text-lg shadow">▶</div>
            </div>
          )}
        </div>
      </a>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.colors}`}>
            <span>{meta.icon}</span>{siteName ?? meta.label}
          </span>
          {h.date && (
            <span className="text-xs text-slate-400 shrink-0">
              {new Date(h.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{displayTitle}</h3>
        {displayDesc && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{displayDesc}</p>}
        <div className="flex items-center justify-between mt-auto pt-1">
          <a href={cardHref} target={cardTarget} rel={cardRel}
            className="text-xs font-semibold text-blue-700 hover:underline">
            {cardTarget === "_blank" ? "Read article ↗" : "View →"}
          </a>
          {isAdmin && (
            <button onClick={onEdit}
              className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded px-2 py-0.5 hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100">
              ✏ Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 2;

export default function HighlightsSection({
  highlights: initialHighlights,
  isAdmin = false,
}: {
  highlights: Highlight[];
  isAdmin?: boolean;
}) {
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const totalPages = Math.ceil(highlights.length / PAGE_SIZE);
  const visible = highlights.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (totalPages <= 1 || paused || adding || editingId) return;
    const id = setInterval(() => setPage((p) => (p + 1) % totalPages), 4000);
    return () => clearInterval(id);
  }, [totalPages, paused, adding, editingId]);

  function handleAdded(h: Highlight) {
    setHighlights((prev) => [h, ...prev]);
    setAdding(false);
    setPage(0);
  }

  function handleUpdated(h: Highlight) {
    setHighlights((prev) => prev.map((x) => (x.id === h.id ? h : x)));
    setEditingId(null);
  }

  function handleDeleted(id: string) {
    setHighlights((prev) => prev.filter((x) => x.id !== id));
    setEditingId(null);
    setPage((p) => Math.min(p, Math.max(0, Math.ceil((highlights.length - 1) / PAGE_SIZE) - 1)));
  }

  return (
    <section id="highlights" className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Highlights</h2>
        {isAdmin && !adding && (
          <button onClick={() => { setAdding(true); setEditingId(null); }}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            + Add
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-5">
          <HighlightForm
            initial={EMPTY_FORM}
            onSave={handleAdded}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {highlights.length === 0 && !adding ? (
        <p className="text-sm text-slate-400 italic">No highlights yet — click + Add to create one.</p>
      ) : (
        <>
          {/* Card grid with navigation */}
          <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {page > 0 && (
              <button onClick={() => { setPage((p) => p - 1); setPaused(false); }}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:shadow-md transition-all text-xl">
                ‹
              </button>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {visible.map((h) =>
                editingId === h.id ? (
                  <div key={h.id} className="sm:col-span-2">
                    <HighlightForm
                      initial={{
                        title: h.title,
                        type: h.type,
                        url: h.url ?? "",
                        imageUrl: h.imageUrl ?? "",
                        description: h.description ?? "",
                        date: h.date ? new Date(h.date).toISOString().slice(0, 10) : "",
                        embedCode: h.type === "linkedin_post" && h.url
                          ? `<iframe src="${h.url}" height="627" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>`
                          : "",
                        slidesUrl: h.slidesUrl ?? "",
                      }}
                      highlightId={h.id}
                      onSave={handleUpdated}
                      onCancel={() => setEditingId(null)}
                      onDelete={() => handleDeleted(h.id)}
                    />
                  </div>
                ) : h.type === "linkedin_post" ? (
                  <LinkedInPostCard key={h.id} h={h} isAdmin={isAdmin} onEdit={() => { setEditingId(h.id); setAdding(false); }} />
                ) : (
                  <HighlightCard key={h.id} h={h} isAdmin={isAdmin} onEdit={() => { setEditingId(h.id); setAdding(false); }} />
                )
              )}
            </div>

            {page < totalPages - 1 && (
              <button onClick={() => { setPage((p) => p + 1); setPaused(false); }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:shadow-md transition-all text-xl">
                ›
              </button>
            )}
          </div>

          {/* Dot navigation */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => { setPage(i); setPaused(false); }} aria-label={`Page ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === page ? "w-5 bg-blue-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
