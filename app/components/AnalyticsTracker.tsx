"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "../lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname === "/login") {
      return;
    }

    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    const device =
      typeof window !== "undefined" && window.innerWidth < 768
        ? "mobile"
        : "desktop";

    track("page_view", { device });

    if (pathname.includes("beregner")) {
      track("calculator_viewed", {
        calculator: pathname.split("/").pop() ?? pathname,
      });
    }
  }, [pathname]);

  return null;
}
