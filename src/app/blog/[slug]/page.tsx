import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CommentSection from "@/components/blog/CommentSection";
import ReactionBar from "@/components/blog/ReactionBar";
import BlogContent from "@/components/blog/BlogContent";
import ShareButtons from "@/components/blog/ShareButtons";
import { auth } from "@/auth";
import { readingTime } from "@/lib/reading-time";

export const revalidate = 60;

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
      title: post.title,
      description: post.excerpt,
      images: post.coverUrl ? [{ url: post.coverUrl }] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({ where: { published: true }, select: { slug: true } });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
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
        <div className="w-full" style={{ maxHeight: 420, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full object-cover"
            style={{ maxHeight: 420 }}
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-12">
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
          <ReactionBar postId={post.id} userId={session?.user?.id} />
        </div>

        <div className="mt-10">
          <CommentSection postId={post.id} currentUser={session?.user ?? null} />
        </div>
      </div>
    </main>
  );
}
