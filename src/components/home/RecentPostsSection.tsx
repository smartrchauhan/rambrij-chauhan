import Link from "next/link";

interface Post { id: string; slug: string; title: string; excerpt: string; publishedAt: Date | null; }

export default function RecentPostsSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="posts" className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Recent Posts</h2>
        <Link href="/blog" className="text-xs font-semibold text-blue-700 hover:underline">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}
            className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0 group hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors leading-snug">{post.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{post.excerpt}</p>
            </div>
            {post.publishedAt && (
              <span className="shrink-0 text-xs text-slate-400 mt-0.5 font-medium">
                {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
