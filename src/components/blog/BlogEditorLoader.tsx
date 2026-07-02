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
  nextPostId?: string | null;
}

interface PostOption {
  id: string;
  title: string;
}

export default function BlogEditorLoader({
  initialPost,
  allPosts,
}: {
  initialPost?: InitialPost;
  allPosts: PostOption[];
}) {
  return <BlogEditor initialPost={initialPost} allPosts={allPosts} />;
}
