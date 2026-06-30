"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

interface Job { role: string; company: string; duration: string; description: string; logoUrl?: string; }
const EMPTY_JOB: Job = { role: "", company: "", duration: "", description: "", logoUrl: "" };

function JobDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isHtml = text.trim().startsWith("<");

  if (isHtml) {
    return (
      <div className={`mt-2 prose prose-sm max-w-none text-slate-600 ${!expanded ? "line-clamp-6" : ""}`}
        dangerouslySetInnerHTML={{ __html: text }} />
    );
  }

  // Legacy plain-text fallback (newline or sentence split)
  const bullets = text.includes("\n")
    ? text.split("\n").map((l) => l.trim()).filter(Boolean)
    : text.split(/\.\s+/).map((s) => s.trim()).filter(Boolean).map((s) => s.endsWith(".") ? s : s + ".");
  const LIMIT = 3;
  const canCollapse = bullets.length > LIMIT;
  const visible = expanded || !canCollapse ? bullets : bullets.slice(0, LIMIT);
  return (
    <div className="mt-2">
      <ul className="space-y-1.5 list-none">
        {visible.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {canCollapse && (
        <button onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-xs font-semibold text-blue-700 hover:underline">
          {expanded ? "Show less ↑" : `Show ${bullets.length - LIMIT} more ↓`}
        </button>
      )}
    </div>
  );
}

export default function ExperienceSection({ initialData, isAdmin }: { initialData: Job[] | null; isAdmin: boolean }) {
  const [jobs, setJobs] = useState<Job[]>(initialData ?? []);
  const [form, setForm] = useState<Job[]>(initialData ?? []);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/content?key=experience", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed."); return; }
    setJobs([...form]); setEditing(false);
  }

  function update(i: number, patch: Partial<Job>) {
    setForm((f) => f.map((j, idx) => idx === i ? { ...j, ...patch } : j));
  }

  if (!editing && jobs.length === 0 && !isAdmin) return null;

  return (
    <section id="experience" className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Experience</h2>
        {isAdmin && !editing && (
          <button onClick={() => { setForm(jobs.map((j) => ({ ...j }))); setEditing(true); setError(""); }}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            ✏ Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          {form.map((job, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 relative">
              <button onClick={() => setForm((f) => f.filter((_, idx) => idx !== i))}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg leading-none font-bold">×</button>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Role", key: "role", placeholder: "Senior Engineering Manager" },
                  { label: "Company", key: "company", placeholder: "Capital One" },
                  { label: "Duration", key: "duration", placeholder: "2020 – Present" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input value={job[key as keyof Job] as string} onChange={(e) => update(i, { [key]: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={placeholder} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Company Domain <span className="text-slate-400">(optional — for logo)</span></label>
                <input
                  value={job.logoUrl ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
                    update(i, { logoUrl: raw });
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="capitalone.com"
                />
                {job.logoUrl && !job.logoUrl.startsWith("http") && (
                  <div className="mt-1.5 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://www.google.com/s2/favicons?domain=${job.logoUrl}&sz=64`} alt="" className="h-5 w-5 object-contain" />
                    <span className="text-xs text-slate-400">Preview</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <RichTextEditor
                  value={job.description}
                  onChange={(html) => update(i, { description: html })}
                  placeholder="Add responsibilities, achievements… use bold, headings, lists"
                  minHeight={80}
                />
              </div>
            </div>
          ))}
          <button onClick={() => setForm((f) => [...f, { ...EMPTY_JOB }])}
            className="text-sm text-blue-700 font-medium hover:underline">+ Add position</button>
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
      ) : jobs.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No experience added yet — click Edit.</p>
      ) : (
        <div className="space-y-5">
          {jobs.map((job, i) => {
            const isCurrent = /present/i.test(job.duration);
            return (
              <div key={i} className={`flex gap-4 ${i < jobs.length - 1 ? "pb-5 border-b border-slate-100" : ""}`}>
                {/* Company logo or initial */}
                <div className="mt-0.5 h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {job.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.logoUrl.startsWith("http") ? job.logoUrl : `https://www.google.com/s2/favicons?domain=${job.logoUrl}&sz=64`}
                      alt={job.company}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-600">{job.company[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{job.role}</p>
                    {isCurrent && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {[job.company, job.duration].filter(Boolean).join(" · ")}
                  </p>
                  {job.description && <JobDescription text={job.description} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
