"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const subtabs = [
  { href: "/penge", label: "Oversigt", exact: true },
  {
    href: "/penge/rentes-rente-beregner",
    label: "Rentes rente beregner",
    exact: false,
  },
  {
    href: "/penge/fire-beregner",
    label: "FIRE Beregner",
    exact: false,
  },
  {
    href: "/penge/boligkoeb-beregner",
    label: "Boligkøb beregner",
    exact: false,
  },
  {
    href: "/penge/bil-beregner",
    label: "Bil beregner",
    exact: false,
  },
] as const;

export default function PengeSubNav() {
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
