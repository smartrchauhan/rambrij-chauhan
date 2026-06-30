"use client";

import { useState } from "react";

interface ContactData {
  email?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface Props {
  initialData: ContactData;
  isAdmin: boolean;
}

const FIELDS = [
  { key: "email", label: "Email", placeholder: "ram@example.com", type: "email" },
  { key: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/...", type: "url" },
  { key: "githubUrl", label: "GitHub URL", placeholder: "https://github.com/...", type: "url" },
] as const;

export default function ContactClient({ initialData, isAdmin }: Props) {
  const [data, setData] = useState<ContactData>(initialData);
  const [form, setForm] = useState<ContactData>(initialData);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function startEdit() { setForm({ ...data }); setEditing(true); setError(""); setSaved(false); }

  async function save() {
    setSaving(true); setError("");
    // Fetch current about data first to merge (don't overwrite hero fields)
    const current = await fetch("/api/admin/about").then((r) => r.ok ? r.json() : {}).catch(() => ({}));
    const res = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, ...form }),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed. Please try again."); return; }
    setData({ ...form });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const hasAny = !!(data.email || data.linkedinUrl || data.githubUrl);

  return (
    <main className="mx-auto max-w-2xl px-4 py-20">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold text-gray-900">Contact Me</h1>
        {isAdmin && !editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
          >
            ✏ Edit
          </button>
        )}
      </div>

      {saved && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Contact info saved.
        </p>
      )}

      {editing ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <p className="text-sm text-gray-500">Fill in the details you want shown on this page. Leave blank to hide.</p>
          {FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {!hasAny && isAdmin && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
              No contact info added yet. Click <strong>Edit</strong> to add your email, LinkedIn, or GitHub.
            </p>
          )}

          {!hasAny && !isAdmin && (
            <p className="text-gray-400 text-sm py-12 text-center">Contact details coming soon.</p>
          )}

          <div className="space-y-4">
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{data.email}</p>
                </div>
              </a>
            )}

            {data.linkedinUrl && (
              <a
                href={data.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">LinkedIn</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Connect on LinkedIn</p>
                </div>
              </a>
            )}

            {data.githubUrl && (
              <a
                href={data.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm hover:border-gray-400 hover:shadow-md transition-all group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-700 group-hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">GitHub</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">View on GitHub</p>
                </div>
              </a>
            )}
          </div>

          {isAdmin && hasAny && (
            <p className="mt-6 text-xs text-gray-400 text-center">
              Blank fields are hidden from visitors.
            </p>
          )}
        </>
      )}
    </main>
  );
}
