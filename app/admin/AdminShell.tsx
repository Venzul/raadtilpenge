"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ANALYTICS_TABS } from "../lib/analytics-tabs";
import { clearAuthCookie, isLoggedIn } from "../lib/auth";

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setReady(true);
  }, [pathname, router]);

  function handleLogout() {
    clearAuthCookie();
    router.replace("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
        <p className="text-zinc-600">Indlæser…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Analytics
          </h1>
          <p className="mt-2 text-zinc-600">
            Data gemmes i PostgreSQL og overlever deployments.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Log ud
        </button>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 pb-px">
        <Link
          href="/admin"
          className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Oversigt
        </Link>
        {ANALYTICS_TABS.map((tab) => {
          const href = `/admin/${tab.section}/${tab.tabKey}`;
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
}
