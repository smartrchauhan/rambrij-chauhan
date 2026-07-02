import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { sanitizeBlogContent } from "@/lib/sanitize";
import { updatePostSchema } from "@/schemas/post.schema";
import { marked } from "marked";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error, session } = await (async () => {
    try {
      const { requireAdmin: ra } = await import("@/lib/auth-utils");
      return ra();
    } catch {
      return { error: null, session: null };
    }
  })();

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!post.published && !session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { coverUrl, tags, internalLabel, nextPostId, previousPostId, ...rest } = parsed.data;
  let updateData: Record<string, unknown> = { ...rest };

  if (rest.content) {
    updateData.content = sanitizeBlogContent(
      rest.content.trimStart().startsWith("<") ? rest.content : await marked(rest.content)
    );
  }

  if (rest.published !== undefined) {
    updateData.publishedAt = rest.published ? new Date() : null;
  }

  if (coverUrl !== undefined) updateData.coverUrl = coverUrl || null;
  if (tags !== undefined) updateData.tags = tags || null;
  if (internalLabel !== undefined) updateData.internalLabel = internalLabel || null;
  if (nextPostId !== undefined) {
    updateData.nextPostId = nextPostId && nextPostId !== id ? nextPostId : null;
  }
  if (previousPostId !== undefined) {
    updateData.previousPostId = previousPostId && previousPostId !== id ? previousPostId : null;
  }

  const post = await prisma.post.update({ where: { id }, data: updateData });
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
