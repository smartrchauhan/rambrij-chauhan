"use client";

import { useState } from "react";
import PostCard from "./PostCard";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  tags: string | null;
  publishedAt: Date | null;
}

export default function BlogListClient({ posts, allTags }: { posts: Post[]; allTags: string[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? posts.filter((p) => p.tags?.split(",").map((t) => t.trim()).includes(activeTag))
    : posts;

  return (
    <>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !activeTag ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTag === tag ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && activeTag && (
        <p className="text-gray-500 py-8">No posts in this category yet.</p>
      )}
      {filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              content={post.content}
              coverUrl={post.coverUrl}
              tags={post.tags}
              publishedAt={post.publishedAt}
            />
          ))}
        </div>
      )}
    </>
  );
}
