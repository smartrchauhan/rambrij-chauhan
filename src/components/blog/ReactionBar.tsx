"use client";

import { useState, useEffect } from "react";

const REACTIONS = [
  { type: "LIKE", emoji: "👍", label: "Like" },
  { type: "HEART", emoji: "❤️", label: "Love" },
  { type: "INSIGHTFUL", emoji: "💡", label: "Insightful" },
  { type: "CELEBRATE", emoji: "🎉", label: "Celebrate" },
] as const;

type ReactionType = "LIKE" | "HEART" | "INSIGHTFUL" | "CELEBRATE";

interface Props {
  postId: string;
  userId?: string;
}

export default function ReactionBar({ postId, userId }: Props) {
  const [counts, setCounts] = useState<Partial<Record<ReactionType, number>>>({});
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [loading, setLoading] = useState<ReactionType | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${postId}/reactions`)
      .then((r) => r.json())
      .then(setCounts);
  }, [postId]);

  async function toggle(type: ReactionType) {
    if (!userId) {
      window.location.href = "/auth/login";
      return;
    }
    setLoading(type);
    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setLoading(null);

    if (res.ok) {
      const data = await res.json();
      const added = data.toggled === "added";
      setCounts((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] ?? 0) + (added ? 1 : -1)),
      }));
      setUserReactions((prev) => {
        const next = new Set(prev);
        added ? next.add(type) : next.delete(type);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ type, emoji, label }) => {
        const active = userReactions.has(type);
        const count = counts[type] ?? 0;
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            disabled={loading === type}
            title={label}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
      {!userId && (
        <span className="text-xs text-gray-400 self-center ml-1">Sign in to react</span>
      )}
    </div>
  );
}
