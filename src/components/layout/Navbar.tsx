import { auth, signOut } from "@/auth";
import Link from "next/link";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // auth() can throw in environments where the host is not yet trusted
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
        <NavLinks />

        <div className="ml-auto flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="text-sm text-gray-600">Hi, {session.user.name?.split(" ")[0]}</span>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
