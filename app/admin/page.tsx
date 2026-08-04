"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ANALYTICS_STORAGE_KEY,
  clearEvents,
  getSummary,
  type AnalyticsSummary,
} from "../lib/analytics";
import { clearAuthCookie, isLoggedIn } from "../lib/auth";

const REFRESH_MS = 3000;

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("da-DK");
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  function refresh() {
    setSummary(getSummary());
    setLastUpdatedAt(new Date());
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login?next=/admin");
      return;
    }

    refresh();

    const intervalId = window.setInterval(refresh, REFRESH_MS);

    function onStorage(event: StorageEvent) {
      if (event.key === ANALYTICS_STORAGE_KEY || event.key === null) {
        refresh();
      }
    }

    window.addEventListener("storage", onStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
    };
  }, [router]);

  function handleLogout() {
    clearAuthCookie();
    router.replace("/login");
    router.refresh();
  }

  function handleClear() {
    if (!window.confirm("Slet alle lokale analytics-events?")) return;
    clearEvents();
    refresh();
  }

  if (!summary) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
        <p className="text-zinc-600">Indlæser…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Analytics
          </h1>
          <p className="mt-2 text-zinc-600">
            Opdateres automatisk ca. hvert 3. sekund.
          </p>
          {lastUpdatedAt ? (
            <p className="mt-1 text-sm text-zinc-500">
              Sidst opdateret: {lastUpdatedAt.toLocaleString("da-DK")}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Ryd data
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Log ud
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-zinc-900">
          Trafik pr. dag
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Sidevisninger de seneste 14 dage
        </p>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={summary.trafficPerDay}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#71717a", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e4e4e7" }}
              />
              <YAxis
                allowDecimals={false}
                width={32}
                tick={{ fill: "#71717a", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#e4e4e7",
                  fontSize: 13,
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date
                    ? new Date(
                        payload[0].payload.date + "T12:00:00",
                      ).toLocaleDateString("da-DK", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                      })
                    : ""
                }
                formatter={(value) => [
                  typeof value === "number" ? value : Number(value) || 0,
                  "Sidevisninger",
                ]}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#18181b"
                strokeWidth={2}
                fill="url(#trafficFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Sidevisninger</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {summary.pageViews}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Events i alt</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {summary.totalEvents}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-zinc-900">Top sider</h2>
          {summary.topPages.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              Ingen data endnu. Browse sitet og opdater.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {summary.topPages.map(({ path, count }) => (
                <li
                  key={path}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="truncate font-mono text-zinc-700">
                    {path}
                  </span>
                  <span className="tabular-nums text-zinc-900">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-zinc-900">Event-typer</h2>
          {summary.topEvents.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Ingen events endnu.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {summary.topEvents.map(({ name, count }) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="text-zinc-700">{name}</span>
                  <span className="tabular-nums text-zinc-900">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-zinc-900">Seneste events</h2>
        {summary.recent.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Ingen events endnu.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100">
            {summary.recent.map((event, index) => (
              <li key={`${event.at}-${index}`} className="py-2 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-zinc-900">{event.name}</span>
                  <span className="text-xs text-zinc-500">
                    {formatTime(event.at)}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-zinc-600">
                  {event.path}
                  {event.props
                    ? ` · ${Object.entries(event.props)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", ")}`
                    : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
