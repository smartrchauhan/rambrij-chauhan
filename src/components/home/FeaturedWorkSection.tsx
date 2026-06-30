"use client";

import { useState } from "react";
import Link from "next/link";

interface FeaturedItem {
  postSlug: string;
  order: number;
}

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
}

const PAGE_SIZE = 2;

export default function FeaturedWorkSection({
  initialData,
  isAdmin,
  allPosts = [],
}: {
  initialData: FeaturedItem[] | null;
  isAdmin: boolean;
  allPosts?: Post[];
}) {
  const normalized = (initialData ?? [])
    .filter((i): i is FeaturedItem => !!i.postSlug)
    .sort((a, b) => a.order - b.order);

  const [items, setItems] = useState<FeaturedItem[]>(normalized);
  const [form, setForm] = useState<FeaturedItem[]>(normalized);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const displayItems = [...items].sort((a, b) => a.order - b.order);
  const totalPages = Math.ceil(displayItems.length / PAGE_SIZE);
  const visible = displayItems.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  async function save() {
    setSaving(true); setError("");
    const res = await fetch("/api/content?key=featured_work", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed."); return; }
    const sorted = [...form].sort((a, b) => a.order - b.order);
    setItems(sorted); setEditing(false);
  }

  function updateRow(i: number, patch: Partial<FeaturedItem>) {
    setForm((f) => f.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  }

  function addRow() {
    const maxOrder = form.length > 0 ? Math.max(...form.map((f) => f.order)) : 0;
    setForm((f) => [...f, { postSlug: "", order: maxOrder + 1 }]);
  }

  function removeRow(i: number) {
    setForm((f) => f.filter((_, idx) => idx !== i));
  }

  if (!editing && items.length === 0 && !isAdmin) return null;

  const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  return (
    <section id="featured-work" className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900">Featured Work</h2>
        {isAdmin && !editing && (
          <button
            onClick={() => { setForm([...items]); setEditing(true); setError(""); }}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            ✏ Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          {/* Column headers */}
          {form.length > 0 && (
            <div className="grid grid-cols-[1fr_80px_32px] gap-2 px-1">
              <span className="text-xs font-medium text-slate-500">Blog post</span>
              <span className="text-xs font-medium text-slate-500 text-center">Order</span>
              <span />
            </div>
          )}

          {form.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_32px] gap-2 items-center">
              <select
                value={item.postSlug}
                onChange={(e) => updateRow(i, { postSlug: e.target.value })}
                className={inputCls}
              >
                <option value="">Select a blog post…</option>
                {allPosts.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.title}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.order}
                onChange={(e) => updateRow(i, { order: parseInt(e.target.value) || 1 })}
                className={inputCls + " text-center"}
                placeholder="1"
              />
              <button
                onClick={() => removeRow(i)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors text-lg font-bold">
                ×
              </button>
            </div>
          ))}

          {allPosts.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">No published posts yet — publish a blog post first.</p>
          ) : (
            <button onClick={addRow}
              className="text-sm text-blue-700 font-medium hover:underline">
              + Add blog post
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
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
        <p className="text-sm text-slate-400 italic">No featured work added yet — click Edit.</p>
      ) : (
        <>
          <div className="relative">
            {page > 0 && (
              <button onClick={() => setPage((p) => p - 1)}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 text-xl">‹</button>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {visible.map((item) => {
                const post = allPosts.find((p) => p.slug === item.postSlug);
                if (!post) return null;
                return (
                  <Link
                    key={item.postSlug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all bg-white">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
                    <div className="flex flex-col flex-1 p-4 gap-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 self-start">
                        📝 Blog Post
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
                      )}
                      {post.publishedAt && (
                        <p className="text-xs text-slate-400">
                          {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </p>
                      )}
                      <span className="mt-auto pt-1 text-xs font-semibold text-blue-700 group-hover:underline">Read post →</span>
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
                  className={`h-1.5 rounded-full transition-all ${i === page ? "w-5 bg-blue-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
