import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HighlightTabs from "./HighlightTabs";

export const revalidate = 60;

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const TYPE_META: Record<string, { label: string; icon: string; colors: string }> = {
  video:       { label: "Video",             icon: "▶",  colors: "bg-red-50 text-red-700 border-red-100" },
  conference:  { label: "Conference / Talk", icon: "🎤", colors: "bg-blue-50 text-blue-700 border-blue-100" },
  publication: { label: "Publication",       icon: "📄", colors: "bg-green-50 text-green-700 border-green-100" },
  award:       { label: "Award",             icon: "🏆", colors: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  media:       { label: "Media / Press",     icon: "📰", colors: "bg-purple-50 text-purple-700 border-purple-100" },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const h = await prisma.highlight.findUnique({ where: { id }, select: { title: true, description: true } });
  if (!h) return { title: "Not Found" };
  return { title: `${h.title} — Ram Brij`, description: h.description ?? undefined };
}

export default async function HighlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const h = await prisma.highlight.findUnique({
    where: { id, published: true },
    include: {
      slides: { orderBy: { order: "asc" } },
      resources: { orderBy: { order: "asc" } },
    },
  });

  if (!h) notFound();

  const meta = TYPE_META[h.type] ?? { label: h.type, icon: "★", colors: "bg-gray-50 text-gray-600 border-gray-100" };
  const ytId = h.url ? getYouTubeId(h.url) : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/#highlights" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        ← Back to profile
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.colors}`}>
            <span>{meta.icon}</span>
            {meta.label}
          </span>
          {h.date && (
            <span className="text-xs text-gray-400">
              {new Date(h.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          )}
        </div>
        {h.eventName && (
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">{h.eventName}</p>
        )}
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{h.title}</h1>
      </div>

      {/* Tabbed content */}
      <HighlightTabs
        description={h.description}
        keyTakeaways={h.keyTakeaways}
        technologies={h.technologies}
        audience={h.audience}
        impactMetrics={h.impactMetrics}
        slides={h.slides.filter((s) => s.category === "slide").map((s) => ({ src: s.imageUrl, caption: s.caption ?? undefined }))}
        gallery={h.slides.filter((s) => s.category === "gallery").map((s) => ({ src: s.imageUrl, caption: s.caption ?? undefined }))}
        ytId={ytId}
        externalUrl={h.url}
        slidesUrl={h.slidesUrl ?? null}
        transcript={h.transcript}
        resources={h.resources.map((r) => ({ label: r.label, url: r.url, type: r.type }))}
        highlightType={h.type}
      />
    </main>
  );
}
