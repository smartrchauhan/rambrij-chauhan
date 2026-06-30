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

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const highlights = await prisma.highlight.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { resources: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(highlights);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = highlightSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { url, imageUrl, slidesUrl, date, resources, ...rest } = parsed.data;
  const highlight = await prisma.highlight.create({
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
  return NextResponse.json(highlight, { status: 201 });
}
