import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const highlightSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  url: z.string().url().optional().or(z.literal("")),
  date: z.string().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = highlightSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { url, date, ...rest } = parsed.data;
  const highlight = await prisma.highlight.update({
    where: { id },
    data: {
      ...rest,
      url: url || null,
      date: date ? new Date(date) : null,
    },
  });
  return NextResponse.json(highlight);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.highlight.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
