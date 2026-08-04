"use client";

import { useEffect, useState } from "react";
import {
  fetchSummary,
  type AnalyticsSummary,
} from "../lib/analytics";
import TrafficChart from "./TrafficChart";

const REFRESH_MS = 3000;

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("da-DK");
  } catch {
    return iso;
  }
}

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const data = await fetchSummary();
        if (cancelled) return;
        setSummary(data);
        setError(null);
        setLastUpdatedAt(new Date());
      } catch {
        if (!cancelled) {
          setError("Kunne ikke hente analytics. Er du logget ind?");
        }
      }
    }

    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!summary) {
    return <p className="text-zinc-600">Indlæser…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {!summary.configured ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          PostgreSQL er ikke konfigureret endnu. Sæt{" "}
          <code className="font-mono">DATABASE_URL</code> i{" "}
          <code className="font-mono">.env.local</code> og i Vercel Environment
          Variables (se <code className="font-mono">.env.example</code>).
        </div>
      ) : null}

      <p className="text-sm text-zinc-500">
        Opdateres automatisk ca. hvert 3. sekund
        {lastUpdatedAt
          ? ` · Sidst opdateret: ${lastUpdatedAt.toLocaleString("da-DK")}`
          : null}
      </p>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-zinc-900">Trafik pr. dag</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Sidevisninger de seneste 14 dage
        </p>
        <div className="mt-4">
          <TrafficChart data={summary.trafficPerDay} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Sidevisninger</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-950">
            {summary.pageViews}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Events i alt</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-950">
            {summary.totalEvents}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Unikke brugere</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-950">
            {summary.uniqueUsers}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-zinc-900">Top sider</h2>
          {summary.topPages.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Ingen data endnu.</p>
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
                  {event.props && Object.keys(event.props).length > 0
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
    </div>
  );
}
