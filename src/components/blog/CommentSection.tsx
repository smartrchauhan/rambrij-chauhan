"use client";

import { useState, useEffect } from "react";

const REACTIONS = [
  { type: "LIKE", emoji: "👍" },
  { type: "HEART", emoji: "❤️" },
  { type: "INSIGHTFUL", emoji: "💡" },
  { type: "CELEBRATE", emoji: "🎉" },
] as const;
type ReactionType = "LIKE" | "HEART" | "INSIGHTFUL" | "CELEBRATE";

interface CommentData {
  id: string;
  content: string;
  approved: boolean;
  parentId: string | null;
  createdAt: string;
  user: { name: string };
  counts: Record<string, number>;
  userReactions: string[];
  replies?: CommentData[];
}

interface CurrentUser {
  id?: string;
  name?: string | null;
  role?: string;
}

interface Props {
  postId: string;
  currentUser: CurrentUser | null;
}

function CommentReactions({ postId, comment, userId, onUpdate }: {
  postId: string;
  comment: CommentData;
  userId?: string;
  onUpdate: (id: string, counts: Record<string, number>, userReactions: string[]) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(type: ReactionType) {
    if (!userId) return; // reactions require login; guests simply can't react
    setLoading(type);
    const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setLoading(null);
    if (res.ok) {
      const data = await res.json();
      const added = data.toggled === "added";
      const newCounts = { ...comment.counts, [type]: Math.max(0, (comment.counts[type] ?? 0) + (added ? 1 : -1)) };
      const newUserReactions = added
        ? [...comment.userReactions, type]
        : comment.userReactions.filter((r) => r !== type);
      onUpdate(comment.id, newCounts, newUserReactions);
    }
  }

  const hasAny = REACTIONS.some(({ type }) => (comment.counts[type] ?? 0) > 0);
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {REACTIONS.map(({ type, emoji }) => {
        const count = comment.counts[type] ?? 0;
        if (!count) return null;
        const active = comment.userReactions.includes(type);
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            disabled={loading === type || !userId}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-all disabled:cursor-default ${
              active
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600"
            } ${userId ? "cursor-pointer hover:border-gray-300 hover:bg-gray-50" : ""}`}
          >
            <span>{loading === type ? "…" : emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function CommentCard({
  postId, comment, isAdmin, userId, depth = 0, onApprove, onDelete, onReply, onReactionUpdate,
}: {
  postId: string;
  comment: CommentData;
  isAdmin: boolean;
  userId?: string;
  depth?: number;
  onApprove: (id: string, approved: boolean) => void;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onReactionUpdate: (id: string, counts: Record<string, number>, userReactions: string[]) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  async function submitReply() {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReply(false);
    setReplyLoading(false);
  }

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l-2 border-blue-100" : ""}>
      <div className={`rounded-lg border p-4 ${!comment.approved ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{comment.user.name}</span>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </span>
            {isAdmin && !comment.approved && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Pending</span>
            )}
            {isAdmin && comment.approved && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Approved</span>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5 shrink-0">
              {!comment.approved ? (
                <button onClick={() => onApprove(comment.id, true)}
                  className="rounded px-2 py-0.5 text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer">
                  Approve
                </button>
              ) : (
                <button onClick={() => onApprove(comment.id, false)}
                  className="rounded px-2 py-0.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                  Hide
                </button>
              )}
              <button onClick={() => onDelete(comment.id)}
                className="rounded px-2 py-0.5 text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                Delete
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

        <CommentReactions postId={postId} comment={comment} userId={userId} onUpdate={onReactionUpdate} />

        {isAdmin && depth === 0 && (
          <button
            onClick={() => setShowReply((v) => !v)}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            {showReply ? "Cancel" : "↩ Reply"}
          </button>
        )}
      </div>

      {showReply && (
        <div className="ml-6 mt-2 pl-4 border-l-2 border-blue-200">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            placeholder="Write your reply…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2 mt-1.5">
            <button onClick={() => { setShowReply(false); setReplyText(""); }}
              className="rounded px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button onClick={submitReply} disabled={replyLoading || !replyText.trim()}
              className="rounded px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer">
              {replyLoading ? "Posting…" : "Post Reply"}
            </button>
          </div>
        </div>
      )}

      {(comment.replies ?? []).length > 0 && (
        <div className="mt-2 space-y-2">
          {(comment.replies ?? []).map((reply) => (
            <CommentCard
              key={reply.id}
              postId={postId}
              comment={reply}
              isAdmin={isAdmin}
              userId={userId}
              depth={1}
              onApprove={onApprove}
              onDelete={onDelete}
              onReply={onReply}
              onReactionUpdate={onReactionUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, currentUser }: Props) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [posted, setPosted] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";
  const userId = currentUser?.id;

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
    setPosted(false);

    const body: Record<string, string> = { content };
    if (!isAdmin) {
      body.guestName = guestName.trim();
      body.guestEmail = guestEmail.trim();
    }

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting(false);
    if (res.ok) {
      const comment = await res.json();
      setContent("");
      setGuestName("");
      setGuestEmail("");
      if (isAdmin) {
        setComments((prev) => [...prev, { ...comment, replies: [] }]);
      } else {
        setPosted(true);
      }
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to post comment.");
    }
  }

  async function handleReply(parentId: string, replyContent: string) {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent, parentId }),
    });
    if (res.ok) {
      const reply = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c
        )
      );
    }
  }

  async function handleApprove(id: string, approved: boolean) {
    const res = await fetch(`/api/posts/${postId}/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === id) return { ...c, approved };
          return { ...c, replies: (c.replies ?? []).map((r) => r.id === id ? { ...r, approved } : r) };
        })
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/posts/${postId}/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) =>
        prev.filter((c) => c.id !== id)
          .map((c) => ({ ...c, replies: (c.replies ?? []).filter((r) => r.id !== id) }))
      );
    }
  }

  function handleReactionUpdate(id: string, counts: Record<string, number>, userReactions: string[]) {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) return { ...c, counts, userReactions };
        return { ...c, replies: (c.replies ?? []).map((r) => r.id === id ? { ...r, counts, userReactions } : r) };
      })
    );
  }

  const visibleComments = isAdmin ? comments : comments.filter((c) => c.approved);
  const pendingCount = comments.filter((c) => !c.approved).length;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Comments ({visibleComments.length})</h2>
        {isAdmin && pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {visibleComments.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
        )}
        {visibleComments.map((c) => (
          <CommentCard
            key={c.id}
            postId={postId}
            comment={c}
            isAdmin={isAdmin}
            userId={userId}
            onApprove={handleApprove}
            onDelete={handleDelete}
            onReply={handleReply}
            onReactionUpdate={handleReactionUpdate}
          />
        ))}
      </div>

      {posted && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
          <p className="text-base font-semibold text-green-800">Comment submitted!</p>
          <p className="text-sm text-green-700 mt-1">It will appear here once approved.</p>
          <button
            onClick={() => setPosted(false)}
            className="mt-3 text-xs font-medium text-green-700 underline cursor-pointer"
          >
            Leave another comment
          </button>
        </div>
      )}

      {!posted && <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Leave a comment</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!isAdmin && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                minLength={1}
                maxLength={100}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                maxLength={254}
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Kept private"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
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
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Posting…" : "Post Comment"}
          </button>
        </div>
      </form>}
    </section>
  );
}
