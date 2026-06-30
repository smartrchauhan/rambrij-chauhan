import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogEditorLoader from "@/components/blog/BlogEditorLoader";

type Params = { params: Promise<{ id: string }> };

export default async function EditPostEditorPage({ params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, title: true, excerpt: true, content: true, coverUrl: true, tags: true, published: true },
  });
  if (!post) notFound();

  return (
    <BlogEditorLoader
      initialPost={{
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverUrl: post.coverUrl,
        tags: post.tags,
        published: post.published,
      }}
    />
  );
}
