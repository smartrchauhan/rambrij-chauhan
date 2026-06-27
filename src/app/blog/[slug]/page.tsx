import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CommentSection from "@/components/blog/CommentSection";
import ReactionBar from "@/components/blog/ReactionBar";
import { auth } from "@/auth";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Ram Brij`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
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
    prisma.post.findUnique({ where: { slug } }),
    auth(),
  ]);

  if (!post || !post.published) notFound();

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <article>
        {date && <time className="text-sm text-gray-400 uppercase tracking-wide">{date}</time>}
        <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900">{post.title}</h1>
        <p className="mt-4 text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>
        <hr className="my-8 border-gray-200" />
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="mt-12">
        <ReactionBar postId={post.id} userId={session?.user?.id} />
      </div>

      <div className="mt-12">
        <CommentSection postId={post.id} currentUser={session?.user ?? null} />
      </div>
    </main>
  );
}
