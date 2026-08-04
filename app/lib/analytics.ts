export type AnalyticsEvent = {
  name: string;
  path: string;
  props?: Record<string, string>;
  at: string;
};

const STORAGE_KEY = "rtp_analytics_events";
const MAX_EVENTS = 500;

export const ANALYTICS_STORAGE_KEY = STORAGE_KEY;

function readEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AnalyticsEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
}

export function track(
  name: string,
  props?: Record<string, string>,
): void {
  if (typeof window === "undefined") return;

  const event: AnalyticsEvent = {
    name,
    path: window.location.pathname,
    props,
    at: new Date().toISOString(),
  };

  const events = readEvents();
  events.push(event);
  writeEvents(events);
}

export function getEvents(): AnalyticsEvent[] {
  return readEvents();
}

export function clearEvents(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export type DailyTraffic = {
  date: string;
  label: string;
  views: number;
};

export type AnalyticsSummary = {
  totalEvents: number;
  pageViews: number;
  trafficPerDay: DailyTraffic[];
  topPages: { path: string; count: number }[];
  topEvents: { name: string; count: number }[];
  recent: AnalyticsEvent[];
};

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
  });
}

function buildTrafficPerDay(
  pageViews: AnalyticsEvent[],
  days = 14,
): DailyTraffic[] {
  const counts = new Map<string, number>();
  for (const event of pageViews) {
    const key = toDateKey(new Date(event.at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: DailyTraffic[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = toDateKey(day);
    result.push({
      date: key,
      label: formatDayLabel(key),
      views: counts.get(key) ?? 0,
    });
  }

  return result;
}

export function getSummary(): AnalyticsSummary {
  const events = readEvents();
  const pageViews = events.filter((e) => e.name === "page_view");

  const pageCounts = new Map<string, number>();
  for (const event of pageViews) {
    pageCounts.set(event.path, (pageCounts.get(event.path) ?? 0) + 1);
  }

  const eventCounts = new Map<string, number>();
  for (const event of events) {
    eventCounts.set(event.name, (eventCounts.get(event.name) ?? 0) + 1);
  }

  const sortCount = (a: { count: number }, b: { count: number }) =>
    b.count - a.count;

  return {
    totalEvents: events.length,
    pageViews: pageViews.length,
    trafficPerDay: buildTrafficPerDay(pageViews),
    topPages: [...pageCounts.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort(sortCount)
      .slice(0, 10),
    topEvents: [...eventCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort(sortCount),
    recent: [...events].reverse().slice(0, 25),
  };
}
