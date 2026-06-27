"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
}

interface CurrentUser {
  id?: string;
  name?: string | null;
}

interface Props {
  postId: string;
  currentUser: CurrentUser | null;
}

export default function CommentSection({ postId, currentUser }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then(setComments);
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSubmitting(false);
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setContent("");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to post comment.");
    }
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      <div className="space-y-4 mb-8">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900">{c.user.name}</span>
              <span className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Leave a comment</h3>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Share your thoughts…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{content.length}/2000</span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-600 rounded-lg border border-dashed border-gray-300 p-4 text-center">
          <Link href="/auth/login" className="text-blue-700 font-medium hover:underline">Sign in</Link>
          {" "}or{" "}
          <Link href="/auth/register" className="text-blue-700 font-medium hover:underline">register</Link>
          {" "}to leave a comment.
        </p>
      )}
    </section>
  );
}
