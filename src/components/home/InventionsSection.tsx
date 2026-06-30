"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

interface Invention { title: string; filingDate: string; status: string; description: string; images: string[]; }
const EMPTY: Invention = { title: "", filingDate: "", status: "Pending", description: "", images: [] };
const STATUS_STYLES: Record<string, string> = {
  Granted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Filed:   "bg-blue-50 text-blue-700 border-blue-200",
};

async function uploadFile(file: File): Promise<string> {
  const { uploadUrl, publicUrl } = await fetch("/api/upload", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  }).then((r) => r.json());
  const res = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!res.ok) throw new Error("Upload failed");
  return publicUrl;
}

function ImageGallery({ images, onRemove }: { images: string[]; onRemove?: (idx: number) => void }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (images.length === 0) return null;
  return (
    <>
      <div className={`grid gap-2 mt-3 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
        {images.map((src, idx) => (
          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <button type="button" onClick={() => setLightbox(idx)} className="block w-full">
              <Image src={src} alt={`Image ${idx + 1}`} width={300} height={200}
                className="w-full h-32 object-cover hover:opacity-95 transition-opacity" unoptimized />
            </button>
            {onRemove && (
              <button onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white text-2xl hover:text-slate-300">×</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-slate-300 disabled:opacity-30"
            disabled={lightbox === 0} onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l ?? 1) - 1); }}>‹</button>
          <img src={images[lightbox]} alt={`Image ${lightbox + 1}`}
            className="max-h-[85vh] max-w-full rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-slate-300 disabled:opacity-30"
            disabled={lightbox === images.length - 1} onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l ?? 0) + 1); }}>›</button>
          <p className="absolute bottom-4 text-slate-400 text-sm">{lightbox + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}

function InventionImageUpload({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  async function handleFiles(files: FileList) {
    setUploading(true);
    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const url = await uploadFile(files[i]);
        newUrls.push(url);
      } catch {
        setProgress("One upload failed, skipping.");
      }
    }
    onChange([...images, ...newUrls]);
    setUploading(false);
    setProgress("");
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">Images</label>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }} />

      {/* Drop zone / upload button */}
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        className="w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 px-4 py-3 text-xs font-medium text-slate-500 hover:text-blue-700 transition-colors disabled:opacity-50">
        {uploading ? progress : images.length > 0 ? "+ Add more images" : "📎 Upload images (select multiple)"}
      </button>

      {/* Thumbnails with remove */}
      <ImageGallery
        images={images}
        onRemove={(idx) => onChange(images.filter((_, i) => i !== idx))}
      />
    </div>
  );
}

const PAGE_SIZE = 2;

export default function InventionsSection({ initialData, isAdmin }: { initialData: Invention[] | null; isAdmin: boolean }) {
  const normalized = (initialData ?? []).map((item) => ({ ...EMPTY, ...item, images: item.images ?? [] }));
  const [items, setItems] = useState<Invention[]>(normalized);
  const [form, setForm] = useState<Invention[]>(normalized);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/content?key=inventions", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed."); return; }
    setItems([...form]); setEditing(false);
  }

  function update(i: number, patch: Partial<Invention>) {
    setForm((f) => f.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  }

  if (!editing && items.length === 0 && !isAdmin) return null;

  return (
    <section id="inventions" className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Inventions & Patents</h2>
        {isAdmin && !editing && (
          <button onClick={() => { setForm(items.map((i) => ({ ...i, images: [...(i.images ?? [])] }))); setEditing(true); setError(""); }}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            ✏ Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          {form.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 relative">
              <button onClick={() => setForm((f) => f.filter((_, idx) => idx !== i))}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg leading-none font-bold">×</button>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                  <input value={item.title} onChange={(e) => update(i, { title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Patent title" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Filing date</label>
                  <input value={item.filingDate} onChange={(e) => update(i, { filingDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="March 2023" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select value={item.status} onChange={(e) => update(i, { status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Pending</option><option>Filed</option><option>Granted</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <RichTextEditor
                  value={item.description}
                  onChange={(html) => update(i, { description: html })}
                  placeholder="Brief description — supports bold, headings, lists…"
                  minHeight={80}
                />
              </div>
              <InventionImageUpload
                images={item.images ?? []}
                onChange={(imgs) => update(i, { images: imgs })}
              />
            </div>
          ))}
          <button onClick={() => setForm((f) => [...f, { ...EMPTY }])}
            className="text-sm text-blue-700 font-medium hover:underline">+ Add invention</button>
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
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No inventions added yet — click Edit.</p>
      ) : (
        <>
          <div className="relative">
            {page > 0 && (
              <button onClick={() => setPage((p) => p - 1)}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 text-xl">‹</button>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {visible.map((item, vi) => {
                const realIdx = page * PAGE_SIZE + vi;
                const thumb = item.images?.[0] ?? null;
                const plainDesc = item.description
                  ? item.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
                  : null;
                return (
                  <Link key={realIdx} href={`/inventions/${realIdx}`}
                    className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-violet-200 transition-all bg-white">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-violet-50">
                      {thumb ? (
                        <Image src={thumb} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-50 to-purple-100">
                          <span className="text-4xl">💡</span>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {item.status}
                        </span>
                        {item.filingDate && <span className="text-xs text-slate-400 shrink-0">Filed: {item.filingDate}</span>}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{item.title}</h3>
                      {plainDesc && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{plainDesc}</p>}
                      <span className="mt-auto pt-1 text-xs font-semibold text-violet-700 group-hover:underline">View details →</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {page < totalPages - 1 && (
              <button onClick={() => setPage((p) => p + 1)}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 text-xl">›</button>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`h-1.5 rounded-full transition-all ${i === page ? "w-5 bg-violet-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
