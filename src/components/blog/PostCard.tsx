import Link from "next/link";

interface PostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | Date | null;
}

export default function PostCard({ slug, title, excerpt, publishedAt }: PostCardProps) {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <article className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {date && <time className="text-xs text-gray-400 uppercase tracking-wide">{date}</time>}
      <h2 className="mt-2 text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
        <Link href={`/blog/${slug}`}>{title}</Link>
      </h2>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">{excerpt}</p>
      <Link
        href={`/blog/${slug}`}
        className="mt-4 inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        Read more →
      </Link>
    </article>
  );
}
