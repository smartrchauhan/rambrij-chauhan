import { prisma } from "@/lib/prisma";
import BlogEditorLoader from "@/components/blog/BlogEditorLoader";

export default async function NewPostEditorPage() {
  const allPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, internalLabel: true },
  });

  return <BlogEditorLoader allPosts={allPosts} />;
}
