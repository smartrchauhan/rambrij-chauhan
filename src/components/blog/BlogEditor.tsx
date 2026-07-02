"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";

const lowlight = createLowlight(common);

interface InitialPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  tags: string | null;
  published: boolean;
  nextPostId?: string | null;
  previousPostId?: string | null;
}

interface PostOption {
  id: string;
  title: string;
}

export default function BlogEditor({
  initialPost,
  allPosts = [],
}: {
  initialPost?: InitialPost;
  allPosts?: PostOption[];
}) {
  const router = useRouter();
  const [postId, setPostId] = useState<string | null>(initialPost?.id ?? null);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(initialPost?.coverUrl ?? "");
  const [tags, setTags] = useState(initialPost?.tags ?? "");
  const [tagInput, setTagInput] = useState("");
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [nextPostId, setNextPostId] = useState(initialPost?.nextPostId ?? "");
  const [previousPostId, setPreviousPostId] = useState(initialPost?.previousPostId ?? "");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [coverUploading, setCoverUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  async function uploadImage(file: File): Promise<string> {
    const { uploadUrl, publicUrl } = await fetch("/api/upload", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
    }).then((r) => r.json());
    await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    return publicUrl as string;
  }

  async function insertImageFromFile(file: File) {
    const url = await uploadImage(file);
    editorRef.current?.chain().focus().setImage({ src: url }).run();
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Write your story…" }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialPost?.content ?? "",
    editorProps: {
      attributes: { class: "prose prose-lg max-w-none min-h-[400px] focus:outline-none px-0 py-4" },
      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              insertImageFromFile(file);
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Keep ref in sync so paste handler and toolbar always have the latest editor
  if (editor) editorRef.current = editor;

  // Auto-save after 3s of inactivity (only if post already exists)
  const scheduleAutoSave = useCallback(() => {
    if (!postId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(false, true), 3000);
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!editor) return;
    const handler = () => scheduleAutoSave();
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor, scheduleAutoSave]);

  async function uploadCover(file: File) {
    setCoverUploading(true);
    try {
      setCoverUrl(await uploadImage(file));
    } finally {
      setCoverUploading(false);
    }
  }

  function tagList(): string[] {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }

  function addTag(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = tagList();
    if (!current.includes(trimmed)) {
      setTags([...current, trimmed].join(","));
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tagList().filter((t) => t !== tag).join(","));
  }

  async function doSave(shouldPublish?: boolean, isAuto = false): Promise<string | undefined> {
    const editorContent = editorRef.current?.getHTML() ?? "";
    const isNew = !postId;
    const publishState = shouldPublish !== undefined ? shouldPublish : published;

    if (!title.trim()) return;

    if (!isAuto) setSaving(true);
    setSaveStatus("saving");

    try {
      const body = {
        title: title.trim(),
        excerpt: excerpt.trim() || title.trim().slice(0, 160),
        content: editorContent,
        coverUrl,
        tags,
        published: publishState,
        nextPostId: nextPostId || null,
        previousPostId: previousPostId || null,
      };

      let slug: string | undefined;
      if (isNew) {
        const res = await fetch("/api/posts", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        slug = created.slug;
        setPostId(created.id);
        router.replace(`/admin/posts/editor/${created.id}`);
      } else {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        slug = updated.slug;
      }

      setPublished(publishState);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return slug;
    } catch {
      setSaveStatus("error");
      return undefined;
    } finally {
      setSaving(false);
    }
  }

  const [previewing, setPreviewing] = useState(false);
  async function handlePreview() {
    setPreviewing(true);
    const tab = window.open("about:blank", "_blank");
    try {
      const slug = await doSave(undefined, false);
      if (slug && tab) tab.location.href = `/blog/${slug}`;
      else tab?.close();
    } finally {
      setPreviewing(false);
    }
  }

  const tagItems = tagList();

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/admin")}
          className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
          ← Posts
        </button>
        <div className="flex-1" />
        {saveStatus === "saving" && <span className="text-xs text-slate-400">Saving…</span>}
        {saveStatus === "saved" && <span className="text-xs text-green-600">Saved ✓</span>}
        {saveStatus === "error" && <span className="text-xs text-red-600">Save failed</span>}
        <button onClick={handlePreview} disabled={saving || previewing || !title.trim()}
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          {previewing ? "Opening…" : "Preview"}
        </button>
        <button onClick={() => doSave(false)} disabled={saving || !title.trim()}
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          Save Draft
        </button>
        <button onClick={() => doSave(!published)} disabled={saving || !title.trim()}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50 transition-colors ${
            published
              ? "bg-slate-700 text-white hover:bg-slate-900"
              : "bg-blue-700 text-white hover:bg-blue-800"
          }`}>
          {published ? "Unpublish" : "Publish"}
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-24">
        {/* Cover photo */}
        <div className="mt-6">
          <input ref={coverRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ""; }} />
          <input ref={imageRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImageFromFile(f); e.target.value = ""; }} />
          {coverUrl ? (
            <div className="relative group rounded-xl overflow-hidden mb-6" style={{ maxHeight: 320 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Cover" className="w-full h-auto block" style={{ maxHeight: 320, objectFit: "cover" }} />
              <button onClick={() => coverRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                {coverUploading ? "Uploading…" : "Change cover photo"}
              </button>
            </div>
          ) : (
            <button onClick={() => coverRef.current?.click()} disabled={coverUploading}
              className="w-full mb-6 py-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium">
              {coverUploading ? "Uploading…" : "+ Add cover photo"}
            </button>
          )}
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); scheduleAutoSave(); }}
          placeholder="Post title…"
          className="w-full text-4xl font-bold text-slate-900 placeholder-slate-300 border-none outline-none resize-none leading-tight mb-3 bg-transparent"
        />

        {/* Excerpt */}
        <input
          value={excerpt}
          onChange={(e) => { setExcerpt(e.target.value); scheduleAutoSave(); }}
          placeholder="Short excerpt shown on the blog list…"
          className="w-full text-lg text-slate-500 placeholder-slate-300 border-none outline-none resize-none mb-4 bg-transparent"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {tagItems.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-blue-900 ml-0.5">×</button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
              onBlur={() => addTag(tagInput)}
              placeholder={tagItems.length === 0 ? "Add tags (press Enter)…" : "+ tag"}
              className="text-xs text-slate-500 placeholder-slate-300 border-none outline-none bg-transparent w-32"
            />
          </div>
        </div>

        {/* Series links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
          <div className="flex items-center gap-2">
            <label htmlFor="previousPostId" className="text-xs font-medium text-slate-500 shrink-0">
              Previous read
            </label>
            <select
              id="previousPostId"
              value={previousPostId}
              onChange={(e) => { setPreviousPostId(e.target.value); scheduleAutoSave(); }}
              className="text-sm text-slate-700 border border-slate-200 rounded-md px-2 py-1 bg-white outline-none focus:border-blue-300"
            >
              <option value="">None</option>
              {allPosts.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="nextPostId" className="text-xs font-medium text-slate-500 shrink-0">
              Suggested next read
            </label>
            <select
              id="nextPostId"
              value={nextPostId}
              onChange={(e) => { setNextPostId(e.target.value); scheduleAutoSave(); }}
              className="text-sm text-slate-700 border border-slate-200 rounded-md px-2 py-1 bg-white outline-none focus:border-blue-300"
            >
              <option value="">None</option>
              {allPosts.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-slate-100 mb-4" />

        {/* Toolbar */}
        {editor && (
          <div className="flex flex-wrap gap-1 mb-2 sticky top-[57px] z-20 bg-white py-2 border-b border-slate-100">
            {[
              { label: "B", title: "Bold", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
              { label: "I", title: "Italic", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
              { label: "U", title: "Underline", action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
              { label: "H2", title: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
              { label: "H3", title: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
              { label: "• List", title: "Bullet List", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
              { label: "1. List", title: "Numbered List", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
              { label: '" Quote', title: "Blockquote", action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
              { label: "</> Code", title: "Code Block", action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
            ].map((btn) => (
              <button key={btn.label} title={btn.title}
                onMouseDown={(e) => { e.preventDefault(); btn.action(); }}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${btn.active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                {btn.label}
              </button>
            ))}
            <button
              title="Add link"
              onMouseDown={(e) => {
                e.preventDefault();
                const url = prompt("Enter URL:");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${editor.isActive("link") ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              🔗 Link
            </button>
            <button
              title="Insert image (or paste one directly)"
              onMouseDown={(e) => { e.preventDefault(); imageRef.current?.click(); }}
              className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              🖼 Image
            </button>
          </div>
        )}

        {/* Editor */}
        <EditorContent editor={editor} className="min-h-[400px]" />
      </div>
    </div>
  );
}
