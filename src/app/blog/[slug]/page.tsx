import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CommentSection from "@/components/blog/CommentSection";
import BlogContent from "@/components/blog/BlogContent";
import ShareButtons from "@/components/blog/ShareButtons";
import { auth } from "@/auth";
import { readingTime } from "@/lib/reading-time";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, coverUrl: true },
  });
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Ram Brij`,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      siteName: "Ram Brij",
      url: `https://rambrij.com/blog/${slug}`,
      images: post.coverUrl
        ? [{ url: post.coverUrl, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverUrl ? [post.coverUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const [post, session] = await Promise.all([
    prisma.post.findUnique({
      where: { slug },
      select: {
        id: true, title: true, excerpt: true, content: true,
        coverUrl: true, tags: true, publishedAt: true, published: true,
      },
    }),
    auth(),
  ]);

  if (!post || !post.published) notFound();

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const minutes = readingTime(post.content);
  const tagList = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <main>
      {/* Cover hero */}
      {post.coverUrl && (
        <div className="w-full bg-gray-50 border-b border-gray-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full h-auto block"
            style={{ maxHeight: 480, objectFit: "contain", objectPosition: "center" }}
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 pt-8 pb-16">
        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tagList.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-50 border border-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl font-bold leading-tight text-gray-900">{post.title}</h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
          {date && <time>{date}</time>}
          <span>·</span>
          <span>{minutes} min read</span>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Content */}
        <BlogContent html={post.content} />

        <hr className="my-10 border-gray-200" />

        {/* Share */}
        <ShareButtons title={post.title} />

        <div className="mt-10">
          <CommentSection
          postId={post.id}
          currentUser={session?.user ? { id: session.user.id, name: session.user.name, role: session.user.role } : null}
        />
        </div>
      </div>
    </main>
  );
}
