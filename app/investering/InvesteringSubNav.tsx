"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subtabs = [
  { href: "/investering", label: "Oversigt", exact: true },
  {
    href: "/investering/aktie-kontotyper",
    label: "Aktie kontotyper",
    exact: false,
  },
] as const;

export default function InvesteringSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-zinc-700">
      {subtabs.map(({ href, label, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-white text-white"
                : "border-transparent text-white/60 hover:border-zinc-500 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
