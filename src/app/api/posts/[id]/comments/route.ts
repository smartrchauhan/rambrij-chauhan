import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { createCommentSchema } from "@/schemas/comment.schema";
import { auth } from "@/auth";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const commentSelect = () => ({
  id: true,
  content: true,
  approved: true,
  parentId: true,
  createdAt: true,
  guestName: true,
  user: { select: { name: true } },
  reactions: {
    select: { type: true, userId: true },
  },
});

const guestSchema = z.object({
  guestName: z.string().min(1).max(100).trim(),
  guestEmail: z.string().email().max(254).trim().toLowerCase(),
});

function formatComment(c: {
  id: string; content: string; approved: boolean; parentId: string | null;
  createdAt: Date; guestName: string | null; user: { name: string } | null;
  reactions: { type: string; userId: string }[];
}, userId?: string) {
  const counts: Record<string, number> = {};
  const userReactions: string[] = [];
  for (const r of c.reactions) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
    if (userId && r.userId === userId) userReactions.push(r.type);
  }
  return {
    id: c.id,
    content: c.content,
    approved: c.approved,
    parentId: c.parentId,
    createdAt: c.createdAt,
    user: { name: c.guestName ?? c.user?.name ?? "Unknown" },
    counts,
    userReactions,
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  const raw = await prisma.comment.findMany({
    where: { postId, parentId: null, ...(isAdmin ? {} : { approved: true }) },
    orderBy: { createdAt: "asc" },
    select: {
      ...commentSelect(),
      replies: {
        where: isAdmin ? {} : { approved: true },
        orderBy: { createdAt: "asc" },
        select: commentSelect(),
      },
    },
  });

  const formatted = raw.map((c) => ({
    ...formatComment(c, userId),
    replies: (c.replies ?? []).map((r) => formatComment(r, userId)),
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { content, parentId } = body as { content?: string; parentId?: string; guestName?: string; guestEmail?: string };

  // Only admin can post replies
  if (parentId && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, published: true } });
  if (!post || !post.published) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const parsed = createCommentSchema.safeParse({ content });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (isAdmin && userId) {
    // Admin path — auto-approve, no guest fields needed
    const comment = await prisma.comment.create({
      data: { content: parsed.data.content, postId, userId, parentId: parentId ?? null, approved: true },
      select: { ...commentSelect(), replies: { select: commentSelect() } },
    });
    return NextResponse.json(formatComment(comment, userId), { status: 201 });
  }

  // Guest path
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`comment:guest:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many comments. Please wait a moment." }, { status: 429 });
  }

  const guestParsed = guestSchema.safeParse(body);
  if (!guestParsed.success) {
    return NextResponse.json({ error: "Please provide a valid name and email." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId,
      userId: null,
      guestName: guestParsed.data.guestName,
      guestEmail: guestParsed.data.guestEmail,
      parentId: parentId ?? null,
      approved: false,
    },
    select: { ...commentSelect(), replies: { select: commentSelect() } },
  });

  return NextResponse.json(formatComment(comment), { status: 201 });
}
