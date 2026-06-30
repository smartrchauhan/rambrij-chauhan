import { permanentRedirect } from "next/navigation";

type Params = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Params) {
  const { id } = await params;
  permanentRedirect(`/admin/posts/editor/${id}`);
}
