import Link from "next/link";

interface Highlight {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  date: Date | null;
}

const TYPE_META: Record<string, { label: string; icon: string; colors: string }> = {
  video:       { label: "Video",            icon: "▶",  colors: "bg-red-50 text-red-700 border-red-100" },
  conference:  { label: "Conference / Talk", icon: "🎤", colors: "bg-blue-50 text-blue-700 border-blue-100" },
  publication: { label: "Publication",       icon: "📄", colors: "bg-green-50 text-green-700 border-green-100" },
  award:       { label: "Award",             icon: "🏆", colors: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  media:       { label: "Media / Press",     icon: "📰", colors: "bg-purple-50 text-purple-700 border-purple-100" },
};

export default function HighlightsSection({ highlights }: { highlights: Highlight[] }) {
  return (
    <section className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">Speaking &amp; Media</span>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Highlights</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h) => {
            const meta = TYPE_META[h.type] ?? { label: h.type, icon: "★", colors: "bg-gray-50 text-gray-600 border-gray-100" };
            const card = (
              <div className="group flex flex-col h-full rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.colors}`}>
                    <span>{meta.icon}</span>
                    {meta.label}
                  </span>
                  {h.date && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(h.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors">
                  {h.title}
                </p>
                {h.description && (
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">{h.description}</p>
                )}
                {h.url && (
                  <span className="mt-auto pt-3 text-xs font-medium text-blue-700 group-hover:underline">
                    View →
                  </span>
                )}
              </div>
            );

            return h.url ? (
              <Link key={h.id} href={h.url} target="_blank" rel="noopener noreferrer" className="flex">
                {card}
              </Link>
            ) : (
              <div key={h.id} className="flex">
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
