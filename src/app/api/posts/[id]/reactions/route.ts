import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { reactionSchema } from "@/schemas/reaction.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: postId } = await params;

  const session = await (await import("@/auth")).auth();
  const userId = session?.user?.id;

  const [reactions, userReactions] = await Promise.all([
    prisma.reaction.groupBy({
      by: ["type"],
      where: { postId },
      _count: { type: true },
    }),
    userId
      ? prisma.reaction.findMany({ where: { postId, userId }, select: { type: true } })
      : Promise.resolve([]),
  ]);

  const counts = Object.fromEntries(reactions.map((r: { type: string; _count: { type: number } }) => [r.type, r._count.type]));
  return NextResponse.json({ counts, userReactions: userReactions.map((r: { type: string }) => r.type) });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: postId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type } = parsed.data;

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId_type: { postId, userId, type } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ toggled: "removed", type });
  }

  await prisma.reaction.create({ data: { postId, userId, type } });
  return NextResponse.json({ toggled: "added", type }, { status: 201 });
}
