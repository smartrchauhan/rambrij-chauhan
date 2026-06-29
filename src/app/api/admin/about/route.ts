import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  const row = await prisma.siteContent.findUnique({ where: { key: "about" } });
  if (!row) return NextResponse.json({}, { status: 404 });
  return NextResponse.json(JSON.parse(row.value));
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await prisma.siteContent.upsert({
    where: { key: "about" },
    update: { value: JSON.stringify(body) },
    create: { key: "about", value: JSON.stringify(body) },
  });

  return NextResponse.json({ ok: true });
}
