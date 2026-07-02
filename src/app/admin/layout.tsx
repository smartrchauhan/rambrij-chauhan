import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-semibold text-gray-900">Admin</span>
        <Link href="/admin" className="text-gray-600 hover:text-gray-900">Posts</Link>
        <Link href="/admin/highlights" className="text-gray-600 hover:text-gray-900">Highlights</Link>
        <Link href="/" className="ml-auto text-gray-400 hover:text-gray-600">← View site</Link>
      </nav>
      <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}
