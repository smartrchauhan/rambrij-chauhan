import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InventionDetail from "./InventionDetail";

interface Invention {
  title: string; filingDate: string; status: string; description: string; images: string[];
}

async function getInvention(index: number): Promise<{ invention: Invention; total: number } | null> {
  const row = await prisma.siteContent.findUnique({ where: { key: "inventions" } });
  if (!row) return null;
  try {
    const list: Invention[] = JSON.parse(row.value as string);
    if (index < 0 || index >= list.length) return null;
    return { invention: { ...list[index], images: list[index].images ?? [] }, total: list.length };
  } catch { return null; }
}

export default async function InventionPage({ params }: { params: Promise<{ index: string }> }) {
  const { index: indexStr } = await params;
  const index = parseInt(indexStr, 10);
  if (isNaN(index)) notFound();

  const result = await getInvention(index);
  if (!result) notFound();

  const { invention, total } = result;

  const STATUS_COLORS: Record<string, string> = {
    Granted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Filed:   "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Back nav */}
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-2">
        <Link href="/#inventions" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          ← Back to profile
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-12 space-y-5">
        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-2xl shrink-0">💡</div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{invention.title}</h1>
                {invention.filingDate && (
                  <p className="text-xs text-slate-400 mt-0.5">Filed: {invention.filingDate}</p>
                )}
              </div>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLORS[invention.status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
              {invention.status}
            </span>
          </div>

          {/* Description */}
          {invention.description && (
            <div className="prose prose-sm max-w-none text-slate-700 mt-4"
              dangerouslySetInnerHTML={{ __html: invention.description }} />
          )}
        </div>

        {/* Image gallery */}
        {invention.images?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Images</h2>
            <InventionDetail images={invention.images} />
          </div>
        )}

        {/* Prev / Next navigation */}
        {total > 1 && (
          <div className="flex items-center justify-between">
            {index > 0 ? (
              <Link href={`/inventions/${index - 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
                ← Previous
              </Link>
            ) : <span />}
            <span className="text-xs text-slate-400">{index + 1} of {total}</span>
            {index < total - 1 ? (
              <Link href={`/inventions/${index + 1}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
                Next →
              </Link>
            ) : <span />}
          </div>
        )}
      </div>
    </div>
  );
}
