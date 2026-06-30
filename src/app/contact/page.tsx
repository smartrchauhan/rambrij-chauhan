import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import ContactClient from "@/components/contact/ContactClient";

export const metadata: Metadata = { title: "Contact Me — Ram Brij" };

export default async function ContactPage() {
  const [row, session] = await Promise.all([
    prisma.siteContent.findUnique({ where: { key: "about" } }).catch(() => null),
    auth(),
  ]);

  const raw = row ? (JSON.parse(row.value) as Record<string, string>) : {};
  const data = {
    email: raw.email ?? "",
    linkedinUrl: raw.linkedinUrl ?? "",
    githubUrl: raw.githubUrl ?? "",
  };

  const isAdmin = session?.user?.role === "ADMIN";

  return <ContactClient initialData={data} isAdmin={isAdmin} />;
}
