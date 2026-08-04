"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthCookie, isLoggedIn } from "../lib/auth";

const navLinks = [
  { href: "/investering", label: "Investering" },
  { href: "/penge", label: "Penge" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [pathname]);

  function handleLogout() {
    clearAuthCookie();
    setLoggedIn(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          RådTilPenge
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
          {loggedIn ? (
            <>
              <Link
                href="/admin"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                Analytics
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                Log ud
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Log ind
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
