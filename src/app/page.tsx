import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import HeroSection, { type HeroData } from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import SkillsSection from "@/components/home/SkillsSection";
import HighlightsSection from "@/components/home/HighlightsSection";
import InventionsSection from "@/components/home/InventionsSection";
import FeaturedWorkSection from "@/components/home/FeaturedWorkSection";
import RecentPostsSection from "@/components/home/RecentPostsSection";

export const revalidate = 60;

function parseContent<T>(value: string | undefined): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

export default async function HomePage() {
  const [session, contentRows, highlights, allPosts] = await Promise.all([
    auth().catch(() => null),
    prisma.siteContent.findMany({
      where: { key: { in: ["hero", "about_bio", "experience", "skills", "inventions", "featured_work"] } },
    }).catch(() => []),
    prisma.highlight.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { date: "desc" }],
      select: { id: true, title: true, description: true, type: true, url: true, imageUrl: true, slidesUrl: true, date: true },
    }).catch(() => []),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true },
    }).catch(() => []),
  ]);

  const recentPosts = allPosts.slice(0, 3);

  const isAdmin = session?.user?.role === "ADMIN";
  const byKey = Object.fromEntries(contentRows.map((r) => [r.key, r.value]));

  return (
    <div className="min-h-screen bg-slate-100">
      <HeroSection
        initialData={parseContent<HeroData>(byKey.hero)}
        isAdmin={isAdmin}
      />
      <div className="mx-auto max-w-3xl px-4 py-5 space-y-4">
        <AboutSection
          initialData={byKey.about_bio ? parseContent<string>(byKey.about_bio) : null}
          isAdmin={isAdmin}
        />
        <ExperienceSection
          initialData={parseContent(byKey.experience)}
          isAdmin={isAdmin}
        />
        <SkillsSection
          initialData={byKey.skills ? parseContent<string>(byKey.skills) : null}
          isAdmin={isAdmin}
        />
        {highlights.length > 0 && (
          <HighlightsSection highlights={highlights} isAdmin={isAdmin} />
        )}
        <InventionsSection
          initialData={parseContent(byKey.inventions)}
          isAdmin={isAdmin}
        />
        <FeaturedWorkSection
          initialData={parseContent(byKey.featured_work)}
          isAdmin={isAdmin}
          allPosts={allPosts.map((p) => ({
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          }))}
        />
        <RecentPostsSection posts={recentPosts} />
      </div>
    </div>
  );
}
