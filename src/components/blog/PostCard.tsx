import Link from "next/link";
import { readingTime } from "@/lib/reading-time";

interface PostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverUrl?: string | null;
  tags?: string | null;
  publishedAt: string | Date | null;
}

export default function PostCard({ slug, title, excerpt, content, coverUrl, tags, publishedAt }: PostCardProps) {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : null;
  const minutes = content ? readingTime(content) : null;
  const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <article className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {coverUrl ? (
        <div className="aspect-video overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <span className="text-4xl font-bold text-indigo-200 select-none">{title.charAt(0)}</span>
        </div>
      )}
      <div className="flex flex-col flex-1 p-5">
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tagList.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
          <Link href={`/blog/${slug}`} className="stretched-link">{title}</Link>
        </h2>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            {date && <time>{date}</time>}
            {minutes && <><span>·</span><span>{minutes} min read</span></>}
          </div>
          <Link href={`/blog/${slug}`} className="font-medium text-blue-600 hover:text-blue-800">
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}
