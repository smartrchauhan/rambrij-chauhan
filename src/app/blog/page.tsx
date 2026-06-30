import { prisma } from "@/lib/prisma";
import PostCard from "@/components/blog/PostCard";
import BlogListClient from "@/components/blog/BlogListClient";
import type { Metadata } from "next";
import Link from "next/link";
import { readingTime } from "@/lib/reading-time";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Ram Brij",
  description: "Articles on software architecture, performance engineering, cloud-native systems, and AI.",
};

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

export default async function BlogPage() {
  let posts: Post[] = [];

  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true, content: true, coverUrl: true, tags: true, publishedAt: true },
    });
  } catch {
    // DB not available during build — ISR will hydrate on first request
  }

  if (posts.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">Blog</h1>
        <p className="text-gray-500 mt-8">No articles published yet. Check back soon!</p>
      </main>
    );
  }

  const [featured, ...rest] = posts;
  const featuredMinutes = readingTime(featured.content);
  const featuredDate = featured.publishedAt
    ? new Date(featured.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const featuredTags = featured.tags ? featured.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  // Collect all unique tags across all posts
  const allTags = Array.from(
    new Set(posts.flatMap((p) => (p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [])))
  ).sort();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">Blog</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Deep dives into{" "}
          <span className="font-semibold text-blue-700">software architecture</span>,{" "}
          <span className="font-semibold text-blue-700">performance engineering</span>, and{" "}
          <span className="font-semibold text-blue-700">cloud-native systems</span>{" "}
          — written from the trenches of large-scale engineering.
        </p>
      </div>

      {/* Featured post */}
      <Link href={`/blog/${featured.slug}`} className="group block mb-12 rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
        <div className="grid md:grid-cols-2 gap-0">
          {featured.coverUrl ? (
            <div className="aspect-video md:aspect-auto overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.coverUrl} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          ) : (
            <div className="aspect-video md:aspect-auto bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-7xl font-black text-white/20 select-none">{featured.title.charAt(0)}</span>
            </div>
          )}
          <div className="p-8 flex flex-col justify-center bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-blue-700 px-2.5 py-0.5 text-xs font-semibold text-white">Featured</span>
              {featuredTags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{tag}</span>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight mb-3">
              {featured.title}
            </h2>
            <p className="text-gray-500 leading-relaxed line-clamp-3 mb-4">{featured.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {featuredDate && <time>{featuredDate}</time>}
              <span>·</span>
              <span>{featuredMinutes} min read</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Tag filter + grid — client component */}
      <BlogListClient posts={rest} allTags={allTags} />
    </main>
  );
}
