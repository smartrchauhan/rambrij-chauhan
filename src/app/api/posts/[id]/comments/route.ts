import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { createCommentSchema } from "@/schemas/comment.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user.id;
  if (!rateLimit(`comment:${userId}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many comments. Please wait a moment." }, { status: 429 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, published: true } });
  if (!post || !post.published) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { content: parsed.data.content, postId, userId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
