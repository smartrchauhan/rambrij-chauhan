"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
}

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${id}`).then((r) => r.json()).then(setPost);
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        excerpt: form.get("excerpt"),
        content: form.get("content"),
        published: form.get("published") === "on",
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error?.message ?? "Failed to save post.");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  if (!post) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            name="title"
            defaultValue={post.title}
            required
            maxLength={200}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            name="excerpt"
            defaultValue={post.excerpt}
            required
            rows={2}
            maxLength={500}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-gray-400 font-normal">(Markdown supported)</span>
          </label>
          <textarea
            name="content"
            defaultValue={post.content}
            required
            rows={20}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            id="published"
            defaultChecked={post.published}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-md border px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto rounded-md border border-red-200 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
