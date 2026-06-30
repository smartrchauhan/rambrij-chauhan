import { prisma } from "@/lib/prisma";

const SITE_URL = "https://rambrij.com";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: { slug: true, title: true, excerpt: true, publishedAt: true },
  });

  const items = posts
    .map((p) => {
      const date = p.publishedAt ? new Date(p.publishedAt).toUTCString() : "";
      const link = `${SITE_URL}/blog/${p.slug}`;
      return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <pubDate>${date}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ram Brij — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Articles on software architecture, performance engineering, cloud-native systems, and AI.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
