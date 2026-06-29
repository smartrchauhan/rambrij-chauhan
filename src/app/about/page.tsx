import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About — Ram Brij",
  description:
    "Senior Engineering Manager with 18+ years experience in cloud-native systems, performance engineering, and microservices architecture.",
};

interface Highlight {
  title: string;
  description: string;
}

interface AboutData {
  title: string;
  bio: string;
  expertise: string[];
  highlights: Highlight[];
  connect: string;
}

const DEFAULT: AboutData = {
  title: "Senior Engineering Manager",
  bio: "Ram Brij is a Senior Engineering Manager with over 18 years of experience designing, building, and optimizing high-performance, cloud-native, and distributed enterprise systems.",
  expertise: [],
  highlights: [],
  connect: "Interested in discussing software architecture, performance engineering, or speaking engagements? Feel free to reach out or leave a comment on any article.",
};

async function getAboutData(): Promise<AboutData> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: "about" } });
    if (!row) return DEFAULT;
    return JSON.parse(row.value) as AboutData;
  } catch {
    return DEFAULT;
  }
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const [about, session, params] = await Promise.all([getAboutData(), auth(), searchParams]);
  const showPreviewBar = params.preview === "1" && session?.user?.role === "ADMIN";

  return (
    <>
      {showPreviewBar && (
        <div className="sticky top-0 z-50 bg-amber-400 text-amber-900 px-4 py-2 flex items-center gap-4 text-sm font-medium shadow">
          <span>Preview mode</span>
          <Link
            href="/admin/about"
            className="underline hover:no-underline font-semibold"
          >
            ← Back to editing
          </Link>
        </div>
      )}
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">About Ram Brij</h1>
      <p className="text-lg text-blue-700 font-medium mb-10">{about.title}</p>

      <section className="prose prose-gray max-w-none">
        <p className="text-lg leading-relaxed text-gray-700">{about.bio}</p>
      </section>

      {about.expertise.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Areas of Expertise</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {about.expertise.map((skill) => (
              <div key={skill} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                <span className="text-gray-700">{skill}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {about.highlights.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Highlights</h2>
          <div className="space-y-6">
            {about.highlights.map((h) => (
              <div key={h.title} className="border-l-4 border-blue-600 pl-5">
                <h3 className="font-semibold text-gray-900">{h.title}</h3>
                <p className="mt-1 text-gray-600">{h.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Let&apos;s Connect</h2>
        <p className="text-gray-600 text-sm">{about.connect}</p>
      </section>
    </main>
    </>
  );
}
