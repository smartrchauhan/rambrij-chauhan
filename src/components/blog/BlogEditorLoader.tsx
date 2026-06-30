"use client";

import dynamic from "next/dynamic";

const BlogEditor = dynamic(() => import("./BlogEditor"), { ssr: false });

interface InitialPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  tags: string | null;
  published: boolean;
}

export default function BlogEditorLoader({ initialPost }: { initialPost?: InitialPost }) {
  return <BlogEditor initialPost={initialPost} />;
}
