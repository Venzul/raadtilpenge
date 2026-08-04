import { resolveTabFromPath } from "./analytics-tabs";
import { getVisitorId } from "./visitor";

export type AnalyticsEvent = {
  id?: number;
  name: string;
  path: string;
  section?: string | null;
  tabKey?: string | null;
  props?: Record<string, string>;
  at: string;
  visitorId?: string;
};

export type DailyTraffic = {
  date: string;
  label: string;
  views: number;
};

export type AnalyticsSummary = {
  totalEvents: number;
  pageViews: number;
  uniqueUsers: number;
  trafficPerDay: DailyTraffic[];
  topPages: { path: string; count: number }[];
  topEvents: { name: string; count: number }[];
  recent: AnalyticsEvent[];
  configured: boolean;
};

export type CalculatorRun = {
  id: number;
  section: string;
  tabKey: string;
  calculator: string;
  visitorId: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: string;
};

export type TabAnalytics = {
  tab: {
    section: string;
    tabKey: string;
    label: string;
    path: string;
    hasInputs: boolean;
  };
  pageViews: number;
  uniqueUsers: number;
  totalEvents: number;
  trafficPerDay: DailyTraffic[];
  recentEvents: AnalyticsEvent[];
  runs: CalculatorRun[];
  configured: boolean;
};

export function track(
  name: string,
  props?: Record<string, string>,
): void {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;
  const { section, tabKey } = resolveTabFromPath(path);

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      path,
      section,
      tabKey,
      visitorId: getVisitorId(),
      props: props ?? {},
    }),
    keepalive: true,
  }).catch(() => {
    // Ignore network errors — analytics must not break the UI.
  });
}

export function trackCalculatorRun(input: {
  section: string;
  tabKey: string;
  calculator: string;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;

  void fetch("/api/analytics/calculator-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      visitorId: getVisitorId(),
      outputs: input.outputs ?? {},
    }),
    keepalive: true,
  }).catch(() => {
    // Ignore network errors — analytics must not break the UI.
  });
}

export async function fetchSummary(): Promise<AnalyticsSummary> {
  const res = await fetch("/api/analytics/summary", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Kunne ikke hente analytics");
  }
  return res.json() as Promise<AnalyticsSummary>;
}

export async function fetchTabAnalytics(
  section: string,
  tabKey: string,
): Promise<TabAnalytics> {
  const res = await fetch(
    `/api/analytics/tabs/${encodeURIComponent(section)}/${encodeURIComponent(tabKey)}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error("Kunne ikke hente tab-analytics");
  }
  return res.json() as Promise<TabAnalytics>;
}
