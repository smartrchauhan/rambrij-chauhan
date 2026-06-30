"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";

export default function BlogContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) Prism.highlightAllUnder(ref.current);
  }, [html]);

  return (
    <div
      ref={ref}
      className="prose prose-gray prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-600
        prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-rose-600 prose-code:before:content-none prose-code:after:content-none
        prose-pre:rounded-xl prose-pre:shadow-md prose-pre:bg-transparent prose-pre:p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
