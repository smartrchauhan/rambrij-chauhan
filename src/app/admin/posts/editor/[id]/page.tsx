import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogEditorLoader from "@/components/blog/BlogEditorLoader";

type Params = { params: Promise<{ id: string }> };

export default async function EditPostEditorPage({ params }: Params) {
  const { id } = await params;
  const [post, allPosts] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      select: { id: true, title: true, excerpt: true, content: true, coverUrl: true, tags: true, internalLabel: true, published: true, nextPostId: true, previousPostId: true },
    }),
    prisma.post.findMany({
      where: { id: { not: id } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, internalLabel: true },
    }),
  ]);
  if (!post) notFound();

  return (
    <BlogEditorLoader
      allPosts={allPosts}
      initialPost={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverUrl: post.coverUrl,
        tags: post.tags,
        internalLabel: post.internalLabel,
        published: post.published,
        nextPostId: post.nextPostId,
        previousPostId: post.previousPostId,
      }}
    />
  );
}
