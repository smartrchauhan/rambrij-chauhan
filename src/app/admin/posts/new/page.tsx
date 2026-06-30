import { permanentRedirect } from "next/navigation";

export default function NewPostPage() {
  permanentRedirect("/admin/posts/editor");
}
