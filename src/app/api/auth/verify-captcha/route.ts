import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: true }); // not configured — skip

  const { token } = await req.json();
  if (!token) return NextResponse.json({ ok: false, error: "Missing CAPTCHA token." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });

  const data = await res.json() as { success: boolean };
  if (!data.success) return NextResponse.json({ ok: false, error: "CAPTCHA verification failed. Please try again." }, { status: 400 });

  return NextResponse.json({ ok: true });
}
