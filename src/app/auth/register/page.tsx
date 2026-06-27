import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account — Ram Brij" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Create an account</h1>
        <p className="mb-8 text-center text-sm text-gray-500">Join to comment on articles and leave reactions</p>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
