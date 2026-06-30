"use client";

import { useState } from "react";

export default function InventionDetail({ images }: { images: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <div className={`grid gap-3 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
        {images.map((src, i) => (
          <button key={i} onClick={() => setLightbox(i)}
            className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:shadow-md transition-shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Image ${i + 1}`} className="w-full h-40 object-cover" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-5 text-white text-3xl hover:text-slate-300 leading-none">×</button>
          <button disabled={lightbox === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-slate-300 disabled:opacity-20"
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l ?? 1) - 1); }}>‹</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[lightbox]} alt={`Image ${lightbox + 1}`}
            className="max-h-[85vh] max-w-full rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()} />
          <button disabled={lightbox === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-slate-300 disabled:opacity-20"
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l ?? 0) + 1); }}>›</button>
          <p className="absolute bottom-5 text-slate-400 text-sm">{lightbox + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
