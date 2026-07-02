import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { sanitizeBlogContent } from "@/lib/sanitize";
import { createPostSchema } from "@/schemas/post.schema";
import { marked } from "marked";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? 10)));
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, createdAt: true },
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, excerpt, content, coverUrl, tags, published, nextPostId, previousPostId } = parsed.data;

  const htmlContent = sanitizeBlogContent(
    content.trimStart().startsWith("<") ? content : await marked(content)
  );

  let slug = slugify(title, { lower: true, strict: true });
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      excerpt,
      content: htmlContent,
      coverUrl: coverUrl || null,
      tags: tags || null,
      published,
      publishedAt: published ? new Date() : null,
      nextPostId: nextPostId || null,
      previousPostId: previousPostId || null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
