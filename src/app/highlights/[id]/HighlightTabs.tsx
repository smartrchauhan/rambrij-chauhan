"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface SlideItem {
  src: string;
  caption?: string;
}

interface ResourceItem {
  label: string;
  url: string;
  type: string;
}

interface Props {
  description: string | null;
  keyTakeaways: string | null;
  technologies: string | null;
  audience: string | null;
  impactMetrics: string | null;
  slides: SlideItem[];
  gallery: SlideItem[];
  ytId: string | null;
  externalUrl: string | null;
  slidesUrl: string | null;
  transcript: string | null;
  resources: ResourceItem[];
  highlightType: string;
}

const RESOURCE_ICONS: Record<string, string> = { pdf: "📄", linkedin: "💼", article: "📰", link: "🔗" };

function getGoogleSlidesEmbedUrl(url: string): string | null {
  // Published URL: /presentation/d/e/PUBID/pub or /d/e/PUBID/...
  const pubMatch = url.match(/presentation\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (pubMatch) {
    return `https://docs.google.com/presentation/d/e/${pubMatch[1]}/embed?start=false&loop=false&delayms=3000`;
  }
  // Regular/edit URL: /presentation/d/DOCID/...
  const docMatch = url.match(/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch) {
    return `https://docs.google.com/presentation/d/${docMatch[1]}/embed?start=false&loop=false&delayms=3000`;
  }
  return null;
}

function getLinkedInEmbedUrl(url: string): string | null {
  // Matches activity IDs in LinkedIn post URLs
  const m = url.match(/activity[:-](\d{15,20})/);
  if (m) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${m[1]}`;
  // Matches share URNs already in the URL
  const s = url.match(/urn:li:share:(\d{15,20})/);
  if (s) return `https://www.linkedin.com/embed/feed/update/urn:li:share:${s[1]}`;
  return null;
}

function SlideViewer({ items }: { items: SlideItem[] }) {
  const [idx, setIdx] = useState(0);
  const current = items[idx];
  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-md">
        <Image src={current.src} alt={current.caption ?? `Slide ${idx + 1}`} fill className="object-contain" unoptimized />
        {items.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 text-xl z-10">‹</button>
            <button onClick={() => setIdx((i) => (i + 1) % items.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 text-xl z-10">›</button>
          </>
        )}
      </div>
      {current.caption && <p className="text-xs text-center text-gray-500 italic">{current.caption}</p>}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((s, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`relative shrink-0 w-20 h-12 rounded-md overflow-hidden border-2 transition-all ${i === idx ? "border-blue-600 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <Image src={s.src} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 text-right">{idx + 1} / {items.length}</p>
    </div>
  );
}

function GalleryGrid({ items }: { items: SlideItem[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <button key={i} onClick={() => setLightbox(i)}
            className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
            <Image src={item.src} alt={item.caption ?? `Photo ${i + 1}`} fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image src={items[lightbox].src} alt={items[lightbox].caption ?? ""} fill className="object-contain" unoptimized />
            </div>
            {items[lightbox].caption && (
              <p className="mt-3 text-sm text-center text-white/70 italic">{items[lightbox].caption}</p>
            )}
            <div className="flex justify-between mt-4">
              <button onClick={() => setLightbox((i) => ((i ?? 0) - 1 + items.length) % items.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xl">‹</button>
              <span className="text-white/50 text-sm self-center">{lightbox + 1} / {items.length}</span>
              <button onClick={() => setLightbox((i) => ((i ?? 0) + 1) % items.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xl">›</button>
            </div>
            <button onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 text-lg">×</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function HighlightTabs({
  description, keyTakeaways, technologies, audience, impactMetrics,
  slides, gallery, ytId, externalUrl, slidesUrl, transcript, resources, highlightType,
}: Props) {
  const googleSlidesEmbedUrl = slidesUrl ? getGoogleSlidesEmbedUrl(slidesUrl) : null;

  const tabs = [
    { id: "overview", label: "Overview",  show: true },
    { id: "slides",   label: "Slides",    show: slides.length > 0 },
    { id: "video",    label: "Video",     show: !!ytId },
    { id: "deck",     label: "Deck",      show: !!googleSlidesEmbedUrl },
    { id: "gallery",  label: "Gallery",   show: gallery.length > 0 },
    { id: "resources",label: "Resources", show: resources.length > 0 },
  ].filter((t) => t.show);

  const [active, setActive] = useState(tabs[0]?.id ?? "overview");

  const takeawayList = keyTakeaways?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  const techList = technologies?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              active === t.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {active === "overview" && (
        <div className="space-y-8">
          {description && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Session Summary</h2>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          )}

          {takeawayList.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Key Takeaways</h2>
              <ul className="space-y-2">
                {takeawayList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {techList.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Technologies Covered</h2>
              <div className="flex flex-wrap gap-2">
                {techList.map((t, i) => (
                  <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 font-medium">{t}</span>
                ))}
              </div>
            </div>
          )}

          {(audience || impactMetrics) && (
            <div className="grid sm:grid-cols-2 gap-6">
              {audience && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Audience</h2>
                  <p className="text-gray-700">{audience}</p>
                </div>
              )}
              {impactMetrics && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Impact</h2>
                  <p className="text-gray-700">{impactMetrics}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slides */}
      {active === "slides" && <SlideViewer items={slides} />}

      {/* Video */}
      {active === "video" && ytId && (
        <div className="space-y-8">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-md">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {externalUrl && (
            <Link href={externalUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
              {highlightType === "video" ? "▶ Open on YouTube" : "Open link"} ↗
            </Link>
          )}
          {transcript && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Transcript</h2>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deck — Google Slides */}
      {active === "deck" && googleSlidesEmbedUrl && (
        <div className="space-y-4">
          {slidesUrl && !slidesUrl.includes("/d/e/") && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>Heads up:</strong> This presentation may require a Google sign-in. To embed it publicly, open the deck in Google Slides and choose{" "}
              <strong>File → Share → Publish to web</strong>, then update the URL in the edit form to the published link (it will contain <code>/d/e/</code>).
            </div>
          )}
          <div className="relative w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm"
            style={{ paddingTop: "56.25%" }}>
            <iframe
              src={googleSlidesEmbedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              title="Presentation slides"
            />
          </div>
          {slidesUrl && (
            <Link href={slidesUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
              🖥 Open in Google Slides ↗
            </Link>
          )}
        </div>
      )}

      {/* Gallery */}
      {active === "gallery" && <GalleryGrid items={gallery} />}

      {/* Resources */}
      {active === "resources" && (
        <div className="space-y-6">
          {resources.map((r, i) => {
            const liEmbedUrl = r.type === "linkedin" ? getLinkedInEmbedUrl(r.url) : null;
            return (
              <div key={i}>
                {liEmbedUrl ? (
                  // LinkedIn embedded post
                  <div className="space-y-2">
                    <Link href={r.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline">
                      💼 {r.label} ↗
                    </Link>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <iframe
                        src={liEmbedUrl}
                        className="w-full"
                        style={{ minHeight: 500 }}
                        frameBorder="0"
                        allowFullScreen
                        title={r.label}
                      />
                    </div>
                  </div>
                ) : (
                  // Standard link card
                  <Link href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 border-b border-gray-100 group hover:text-blue-700 transition-colors">
                    <span className="text-xl">{RESOURCE_ICONS[r.type] ?? "🔗"}</span>
                    <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">{r.label}</span>
                    <span className="ml-auto text-gray-400 text-xs group-hover:text-blue-600">↗</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
