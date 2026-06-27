import { prisma } from "@/lib/prisma";
import PostCard from "@/components/blog/PostCard";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Ram Brij",
  description: "Articles on software architecture, performance engineering, cloud-native systems, and AI.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const limit = 9;
  const skip = (page - 1) * limit;

  let posts: { id: string; slug: string; title: string; excerpt: string; publishedAt: Date | null }[] = [];
  let total = 0;

  try {
    [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true },
      }),
      prisma.post.count({ where: { published: true } }),
    ]);
  } catch {
    // DB not available during build — ISR will hydrate on first request
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="mb-2 text-4xl font-bold text-gray-900">Blog</h1>
      <p className="mb-12 text-lg text-gray-500">
        Practical insights on software architecture, performance engineering, and cloud-native systems.
      </p>

      {posts.length === 0 ? (
        <p className="text-gray-500">No articles published yet. Check back soon!</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link href={`/blog?page=${page - 1}`} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
              ← Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/blog?page=${page + 1}`} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
              Next →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
