import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { reactionSchema } from "@/schemas/reaction.schema";

type Params = { params: Promise<{ id: string; commentId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { commentId } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user.id;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type } = parsed.data;

  const existing = await prisma.commentReaction.findUnique({
    where: { commentId_userId_type: { commentId, userId, type } },
  });

  if (existing) {
    await prisma.commentReaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ toggled: "removed", type });
  }

  await prisma.commentReaction.create({ data: { commentId, userId, type } });
  return NextResponse.json({ toggled: "added", type }, { status: 201 });
}
