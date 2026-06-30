import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const resourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  type: z.string().default("link"),
  order: z.number().default(0),
});

const highlightSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  date: z.string().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
  eventName: z.string().optional(),
  keyTakeaways: z.string().optional(),
  technologies: z.string().optional(),
  audience: z.string().optional(),
  impactMetrics: z.string().optional(),
  transcript: z.string().optional(),
  slidesUrl: z.string().url().optional().or(z.literal("")),
  resources: z.array(resourceSchema).optional(),
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

  const { url, imageUrl, slidesUrl, date, resources, ...rest } = parsed.data;

  // Replace resources: delete all then recreate
  await prisma.highlightResource.deleteMany({ where: { highlightId: id } });

  const highlight = await prisma.highlight.update({
    where: { id },
    data: {
      ...rest,
      url: url || null,
      imageUrl: imageUrl || null,
      slidesUrl: slidesUrl || null,
      date: date ? new Date(date) : null,
      resources: resources?.length
        ? { create: resources }
        : undefined,
    },
    include: { resources: { orderBy: { order: "asc" } } },
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
