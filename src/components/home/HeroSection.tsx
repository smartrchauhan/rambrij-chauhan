"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

export interface HeroData {
  name: string;
  tagline: string;
  company: string;
  location: string;
  avatarUrl: string;
  coverUrl: string;
  coverPosition: "top" | "center" | "bottom";
  linkedinUrl: string;
  githubUrl: string;
  email: string;
}

const DEFAULT: HeroData = {
  name: "Ram Brij",
  tagline: "Senior Engineering Manager",
  company: "Capital One",
  location: "Washington DC",
  avatarUrl: "",
  coverUrl: "",
  coverPosition: "top",
  linkedinUrl: "",
  githubUrl: "",
  email: "",
};

async function uploadImage(file: File, onProgress: (msg: string) => void): Promise<string> {
  onProgress("Compressing…");
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: false,
    onProgress: (p) => onProgress(`Compressing… ${p}%`),
  });
  onProgress("Uploading…");
  const { uploadUrl, publicUrl } = await fetch("/api/upload", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: compressed.type, size: compressed.size }),
  }).then((r) => r.json());
  const res = await fetch(uploadUrl, { method: "PUT", body: compressed, headers: { "Content-Type": compressed.type } });
  if (!res.ok) throw new Error("Upload failed");
  onProgress("Done");
  return publicUrl;
}

export default function HeroSection({ initialData, isAdmin }: { initialData: Partial<HeroData> | null; isAdmin: boolean }) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<HeroData>({ ...DEFAULT, ...initialData });
  const [form, setForm] = useState<HeroData>({ ...DEFAULT, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarProgress, setAvatarProgress] = useState("");
  const [coverProgress, setCoverProgress] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  function startEdit() { setForm({ ...data }); setEditing(true); setError(""); }

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/content?key=hero", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed."); return; }
    setData({ ...form }); setEditing(false);
  }

  async function handleAvatarPick(file: File) {
    try { const url = await uploadImage(file, setAvatarProgress); setForm((f) => ({ ...f, avatarUrl: url })); }
    catch { setAvatarProgress("Upload failed."); }
  }
  async function handleCoverPick(file: File) {
    try { const url = await uploadImage(file, setCoverProgress); setForm((f) => ({ ...f, coverUrl: url })); }
    catch { setCoverProgress("Upload failed."); }
  }

  if (editing) {
    return (
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-5">
          <h2 className="text-base font-semibold text-slate-800">Edit Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Name", key: "name", placeholder: "Ram Brij" },
              { label: "Tagline", key: "tagline", placeholder: "Senior Engineering Manager" },
              { label: "Company", key: "company", placeholder: "Capital One" },
              { label: "Location", key: "location", placeholder: "Washington DC" },
              { label: "LinkedIn URL", key: "linkedinUrl", placeholder: "https://linkedin.com/in/..." },
              { label: "GitHub URL", key: "githubUrl", placeholder: "https://github.com/..." },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input value={form[key as keyof HeroData]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={placeholder} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="ram@example.com" />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Avatar</p>
              <div className="flex items-center gap-3">
                {form.avatarUrl && (
                  <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-slate-200">
                    <Image src={form.avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
                  </div>
                )}
                <div>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarPick(f); }} />
                  <button onClick={() => avatarRef.current?.click()}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    {form.avatarUrl ? "Replace" : "Upload avatar"}
                  </button>
                  {avatarProgress && <p className="mt-1 text-xs text-slate-500">{avatarProgress}</p>}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Cover photo</p>
              <div>
                {form.coverUrl && (
                  <div className="relative h-16 w-48 rounded-lg overflow-hidden border border-slate-200 mb-2">
                    <Image src={form.coverUrl} alt="Cover" fill className="object-cover" unoptimized />
                  </div>
                )}
                <input ref={coverRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverPick(f); }} />
                <button onClick={() => coverRef.current?.click()}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {form.coverUrl ? "Replace" : "Upload cover"}
                </button>
                {coverProgress && <p className="mt-1 text-xs text-slate-500">{coverProgress}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Focal point:</span>
                  {(["top", "center", "bottom"] as const).map((pos) => (
                    <button key={pos} type="button"
                      onClick={() => setForm((f) => ({ ...f, coverPosition: pos }))}
                      className={`rounded px-2 py-0.5 text-xs font-medium capitalize border transition-colors ${
                        form.coverPosition === pos
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}>
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <section id="hero" className="bg-white border-b border-slate-200">
      {/* Cover */}
      <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800">
        {data.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.coverUrl} alt="Cover" className="w-full block" style={{ maxHeight: 384, objectFit: "contain", objectPosition: "center" }} />
        ) : (
          <div className="h-72 md:h-96" />
        )}
        {/* dot pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
      </div>

      {/* Profile row */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="relative -mt-12 pb-6 flex items-end gap-4">
          {/* Avatar */}
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-blue-700 shrink-0 shadow-lg">
            {data.avatarUrl ? (
              <Image src={data.avatarUrl} alt={data.name} fill className="object-cover" unoptimized priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white tracking-wide">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-14">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">{data.name}</h1>
                <p className="text-slate-600 text-sm mt-0.5 font-medium">{data.tagline}</p>
                {(data.company || data.location) && (
                  <p className="text-slate-400 text-xs mt-0.5">
                    {[data.company, data.location].filter(Boolean).join(" · ")}
                  </p>
                )}
                {/* Social icons */}
                {(data.linkedinUrl || data.githubUrl || data.email) && (
                  <div className="flex items-center gap-3 mt-2">
                    {data.linkedinUrl && (
                      <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors" aria-label="LinkedIn">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                    {data.githubUrl && (
                      <a href={data.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="text-slate-600 hover:text-slate-900 transition-colors" aria-label="GitHub">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                      </a>
                    )}
                    {data.email && (
                      <a href={`mailto:${data.email}`}
                        className="text-slate-600 hover:text-slate-900 transition-colors" aria-label="Email">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
              {isAdmin && (
                <button onClick={startEdit}
                  className="shrink-0 flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
                  ✏ Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
