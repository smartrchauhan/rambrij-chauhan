import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

const ALLOWED_KEYS = [
  "hero", "about_bio", "experience", "skills", "inventions", "featured_work",
];

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const row = await prisma.siteContent.findUnique({ where: { key } });
  if (!row) return NextResponse.json(null);
  try {
    return NextResponse.json(JSON.parse(row.value));
  } catch {
    return NextResponse.json(row.value);
  }
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const key = req.nextUrl.searchParams.get("key");
  if (!key || !ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await prisma.siteContent.upsert({
    where: { key },
    update: { value: JSON.stringify(body) },
    create: { key, value: JSON.stringify(body) },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
