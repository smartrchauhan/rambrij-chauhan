"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "About Me", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Me", href: "/contact" },
];

export default function NavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/about") return pathname === "/" || pathname === "/about";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex items-center gap-5 ml-4">
      {links.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={
            isActive(href)
              ? "text-sm font-semibold text-blue-700 border-b-2 border-blue-700 pb-0.5 transition-colors"
              : "text-sm text-gray-600 hover:text-gray-900 transition-colors"
          }
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
