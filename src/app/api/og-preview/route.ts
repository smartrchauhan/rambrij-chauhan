import { NextRequest, NextResponse } from "next/server";

function getMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHTMLEntities(m[1]);
  }
  return null;
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; bot/1.0; +https://rambrij.com)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Only read the first 50KB — OG tags are always in <head>
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No body");
    let html = "";
    while (html.length < 50000) {
      const { done, value } = await reader.read();
      html += new TextDecoder().decode(value);
      if (done || html.includes("</head>")) break;
    }
    reader.cancel();

    const title =
      getMeta(html, "og:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
      null;
    const description =
      getMeta(html, "og:description") ||
      getMeta(html, "description") ||
      null;
    const image = getMeta(html, "og:image") || null;
    const siteName = getMeta(html, "og:site_name") || new URL(url).hostname.replace("www.", "") || null;

    return NextResponse.json({ title, description, image, siteName }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 502 });
  }
}
