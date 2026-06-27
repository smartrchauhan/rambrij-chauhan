import { prisma } from "@/lib/prisma";
import PostCard from "@/components/blog/PostCard";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  let recentPosts: { id: string; slug: string; title: string; excerpt: string; publishedAt: Date | null }[] = [];
  try {
    recentPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true },
    });
  } catch {
    // DB not available during build — ISR will hydrate on first request
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-blue-300 font-medium uppercase tracking-widest text-sm mb-4">
              Senior Engineering Manager
            </p>
            <h1 className="text-5xl font-bold leading-tight mb-6">Ram Brij</h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              18+ years designing high-performance, cloud-native, and distributed enterprise systems.
              Creator of the <span className="text-white font-semibold">SCALE Framework</span>.
              IEEE Senior Member, international speaker, and published author.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                className="rounded-md bg-white text-blue-900 px-5 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                About Me
              </Link>
              <Link
                href="/blog"
                className="rounded-md border border-blue-400 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Read Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise chips */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap gap-2">
          {[
            "Software Architecture",
            "Performance Engineering",
            "Cloud-Native Systems",
            "Microservices",
            "AI-Powered Applications",
            "3-D Secure / EMVCo ACS",
            "Event-Driven Systems",
            "CI/CD Automation",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-sm text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Recent posts */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
          <Link href="/blog" className="text-sm font-medium text-blue-700 hover:underline">
            View all →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <p className="text-gray-500">Articles coming soon. Stay tuned!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </section>

      {/* SCALE Framework callout */}
      <section className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Featured Work
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">The SCALE Framework</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              A practical performance engineering model developed from real-world enterprise experience.
              Helps engineering teams evolve from traditional performance testing to continuous performance
              engineering.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center text-sm font-medium text-blue-700 hover:underline"
            >
              Read articles about SCALE →
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { letter: "S", label: "Strategy" },
              { letter: "C", label: "Continuous" },
              { letter: "A", label: "Architecture" },
              { letter: "L", label: "Logging" },
              { letter: "E", label: "Efficiency" },
            ].map(({ letter, label }) => (
              <div key={letter} className="flex flex-col items-center gap-1">
                <div className="h-14 w-14 rounded-xl bg-blue-700 flex items-center justify-center text-2xl font-bold text-white">
                  {letter}
                </div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
