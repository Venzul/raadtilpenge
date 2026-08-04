import { ANALYTICS_TABS, findAnalyticsTab } from "./analytics-tabs";
import { ensureSchema, getSql, hasDatabase } from "./db";
import type {
  AnalyticsEvent,
  AnalyticsSummary,
  CalculatorRun,
  DailyTraffic,
  TabAnalytics,
} from "./analytics";

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
  });
}

function emptyTraffic(days = 14): DailyTraffic[] {
  const result: DailyTraffic[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    result.push({ date: key, label: formatDayLabel(key), views: 0 });
  }
  return result;
}

function fillTraffic(
  rows: { day: string; views: number }[],
  days = 14,
): DailyTraffic[] {
  const map = new Map(
    rows.map((row) => [String(row.day).slice(0, 10), Number(row.views)]),
  );
  return emptyTraffic(days).map((item) => ({
    ...item,
    views: map.get(item.date) ?? 0,
  }));
}

function mapEvent(row: Record<string, unknown>): AnalyticsEvent {
  return {
    id: Number(row.id),
    name: String(row.name),
    path: String(row.path),
    section: row.section == null ? null : String(row.section),
    tabKey: row.tab_key == null ? null : String(row.tab_key),
    props: (row.props as Record<string, string>) ?? {},
    at: new Date(String(row.created_at)).toISOString(),
    visitorId: String(row.visitor_id),
  };
}

function mapRun(row: Record<string, unknown>): CalculatorRun {
  return {
    id: Number(row.id),
    section: String(row.section),
    tabKey: String(row.tab_key),
    calculator: String(row.calculator),
    visitorId: String(row.visitor_id),
    inputs: (row.inputs as Record<string, unknown>) ?? {},
    outputs: (row.outputs as Record<string, unknown>) ?? {},
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (!hasDatabase()) {
    return {
      totalEvents: 0,
      pageViews: 0,
      uniqueUsers: 0,
      trafficPerDay: emptyTraffic(),
      topPages: [],
      topEvents: [],
      recent: [],
      configured: false,
    };
  }

  await ensureSchema();
  const db = getSql();

  const [totals] = await db`
    SELECT
      COUNT(*)::int AS total_events,
      COUNT(*) FILTER (WHERE name = 'page_view')::int AS page_views,
      COUNT(DISTINCT visitor_id)::int AS unique_users
    FROM analytics_events
  `;

  const trafficRows = await db`
    SELECT
      (created_at AT TIME ZONE 'Europe/Copenhagen')::date::text AS day,
      COUNT(*)::int AS views
    FROM analytics_events
    WHERE name = 'page_view'
      AND created_at >= (NOW() - INTERVAL '14 days')
    GROUP BY 1
    ORDER BY 1
  `;

  const topPages = await db`
    SELECT path, COUNT(*)::int AS count
    FROM analytics_events
    WHERE name = 'page_view'
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `;

  const topEvents = await db`
    SELECT name, COUNT(*)::int AS count
    FROM analytics_events
    GROUP BY name
    ORDER BY count DESC
  `;

  const recent = await db`
    SELECT id, name, path, section, tab_key, props, visitor_id, created_at
    FROM analytics_events
    ORDER BY created_at DESC
    LIMIT 25
  `;

  return {
    totalEvents: Number(totals.total_events ?? 0),
    pageViews: Number(totals.page_views ?? 0),
    uniqueUsers: Number(totals.unique_users ?? 0),
    trafficPerDay: fillTraffic(
      trafficRows.map((row) => ({
        day: String(row.day),
        views: Number(row.views),
      })),
    ),
    topPages: topPages.map((row) => ({
      path: String(row.path),
      count: Number(row.count),
    })),
    topEvents: topEvents.map((row) => ({
      name: String(row.name),
      count: Number(row.count),
    })),
    recent: recent.map((row) => mapEvent(row as Record<string, unknown>)),
    configured: true,
  };
}

export async function getTabAnalytics(
  section: string,
  tabKey: string,
): Promise<TabAnalytics | null> {
  const tab = findAnalyticsTab(section, tabKey);
  if (!tab) return null;

  if (!hasDatabase()) {
    return {
      tab: {
        section: tab.section,
        tabKey: tab.tabKey,
        label: tab.label,
        path: tab.path,
        hasInputs: tab.hasInputs,
      },
      pageViews: 0,
      uniqueUsers: 0,
      totalEvents: 0,
      trafficPerDay: emptyTraffic(),
      recentEvents: [],
      runs: [],
      configured: false,
    };
  }

  await ensureSchema();
  const db = getSql();

  const [totals] = await db`
    SELECT
      COUNT(*)::int AS total_events,
      COUNT(*) FILTER (WHERE name = 'page_view')::int AS page_views,
      COUNT(DISTINCT visitor_id)::int AS unique_users
    FROM analytics_events
    WHERE section = ${section} AND tab_key = ${tabKey}
  `;

  const trafficRows = await db`
    SELECT
      (created_at AT TIME ZONE 'Europe/Copenhagen')::date::text AS day,
      COUNT(*)::int AS views
    FROM analytics_events
    WHERE name = 'page_view'
      AND section = ${section}
      AND tab_key = ${tabKey}
      AND created_at >= (NOW() - INTERVAL '14 days')
    GROUP BY 1
    ORDER BY 1
  `;

  const recentEvents = await db`
    SELECT id, name, path, section, tab_key, props, visitor_id, created_at
    FROM analytics_events
    WHERE section = ${section} AND tab_key = ${tabKey}
    ORDER BY created_at DESC
    LIMIT 25
  `;

  const runs = tab.hasInputs
    ? await db`
        SELECT id, section, tab_key, calculator, visitor_id, inputs, outputs, created_at
        FROM calculator_runs
        WHERE section = ${section} AND tab_key = ${tabKey}
        ORDER BY created_at DESC
        LIMIT 50
      `
    : [];

  return {
    tab: {
      section: tab.section,
      tabKey: tab.tabKey,
      label: tab.label,
      path: tab.path,
      hasInputs: tab.hasInputs,
    },
    pageViews: Number(totals?.page_views ?? 0),
    uniqueUsers: Number(totals?.unique_users ?? 0),
    totalEvents: Number(totals?.total_events ?? 0),
    trafficPerDay: fillTraffic(
      trafficRows.map((row) => ({
        day: String(row.day),
        views: Number(row.views),
      })),
    ),
    recentEvents: recentEvents.map((row) =>
      mapEvent(row as Record<string, unknown>),
    ),
    runs: runs.map((row) => mapRun(row as Record<string, unknown>)),
    configured: true,
  };
}

export function listAnalyticsTabs() {
  return ANALYTICS_TABS;
}
