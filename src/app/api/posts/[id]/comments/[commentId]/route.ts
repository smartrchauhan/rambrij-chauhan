import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

type Params = { params: Promise<{ id: string; commentId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { commentId } = await params;
  const { approved } = await req.json();

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { approved: Boolean(approved) },
    select: { id: true, approved: true },
  });
  return NextResponse.json(comment);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { commentId } = await params;
  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
