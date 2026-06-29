"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Highlight {
  title: string;
  description: string;
}

interface AboutData {
  title: string;
  bio: string;
  expertise: string[];
  highlights: Highlight[];
  connect: string;
}

export default function EditAboutPage() {
  const router = useRouter();
  const [data, setData] = useState<AboutData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/about").then((r) => r.json()).then(setData);
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Failed to save. Please try again.");
    }
  }

  function updateExpertise(index: number, value: string) {
    if (!data) return;
    const updated = [...data.expertise];
    updated[index] = value;
    setData({ ...data, expertise: updated });
  }

  function addExpertise() {
    if (!data) return;
    setData({ ...data, expertise: [...data.expertise, ""] });
  }

  function removeExpertise(index: number) {
    if (!data) return;
    setData({ ...data, expertise: data.expertise.filter((_, i) => i !== index) });
  }

  function updateHighlight(index: number, field: keyof Highlight, value: string) {
    if (!data) return;
    const updated = data.highlights.map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    );
    setData({ ...data, highlights: updated });
  }

  function addHighlight() {
    if (!data) return;
    setData({ ...data, highlights: [...data.highlights, { title: "", description: "" }] });
  }

  function removeHighlight(index: number) {
    if (!data) return;
    setData({ ...data, highlights: data.highlights.filter((_, i) => i !== index) });
  }

  if (!data) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit About Page</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
          <button
            onClick={() => router.push("/about?preview=1")}
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Title */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Title</h2>
          <input
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Senior Engineering Manager"
          />
        </section>

        {/* Bio */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Bio</h2>
          <textarea
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </section>

        {/* Expertise */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Areas of Expertise</h2>
            <button
              onClick={addExpertise}
              className="text-sm text-blue-700 hover:underline font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {data.expertise.map((skill, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={skill}
                  onChange={(e) => updateExpertise(i, e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Software Architecture & Design"
                />
                <button
                  onClick={() => removeExpertise(i)}
                  className="px-2 text-gray-400 hover:text-red-500 text-lg leading-none"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Career Highlights */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Career Highlights</h2>
            <button
              onClick={addHighlight}
              className="text-sm text-blue-700 hover:underline font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-4">
            {data.highlights.map((h, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 relative">
                <button
                  onClick={() => removeHighlight(i)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
                  title="Remove"
                >
                  ×
                </button>
                <div className="space-y-2 pr-6">
                  <input
                    value={h.title}
                    onChange={(e) => updateHighlight(i, "title", e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Highlight title"
                  />
                  <textarea
                    value={h.description}
                    onChange={(e) => updateHighlight(i, "description", e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connect message */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Let&apos;s Connect Message</h2>
          <textarea
            value={data.connect}
            onChange={(e) => setData({ ...data, connect: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
