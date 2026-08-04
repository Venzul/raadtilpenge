"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchTabAnalytics,
  type TabAnalytics,
} from "../../../lib/analytics";
import TrafficChart from "../../TrafficChart";

const REFRESH_MS = 3000;

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("da-DK");
  } catch {
    return iso;
  }
}

function formatValue(value: unknown): string {
  if (typeof value === "number") {
    return new Intl.NumberFormat("da-DK").format(value);
  }
  if (typeof value === "boolean") return value ? "ja" : "nej";
  if (value == null) return "—";
  return String(value);
}

export default function AdminTabPage() {
  const params = useParams<{ section: string; tabKey: string }>();
  const section = params.section;
  const tabKey = params.tabKey;
  const [data, setData] = useState<TabAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const next = await fetchTabAnalytics(section, tabKey);
        if (cancelled) return;
        setData(next);
        setError(null);
      } catch {
        if (!cancelled) setError("Kunne ikke hente data for denne tab.");
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
  }, [section, tabKey]);

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!data) {
    return <p className="text-zinc-600">Indlæser…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {!data.configured ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          PostgreSQL er ikke konfigureret. Sæt{" "}
          <code className="font-mono">DATABASE_URL</code> for at se live data.
        </div>
      ) : null}

      <div>
        <h2 className="text-xl font-semibold text-zinc-900">{data.tab.label}</h2>
        <p className="mt-1 font-mono text-sm text-zinc-500">{data.tab.path}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Sidevisninger</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-950">
            {data.pageViews}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Events</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-950">
            {data.totalEvents}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Unikke brugere</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-950">
            {data.uniqueUsers}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-zinc-900">Trafik pr. dag</h3>
        <div className="mt-4">
          <TrafficChart data={data.trafficPerDay} />
        </div>
      </section>

      {data.tab.hasInputs ? (
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-zinc-900">
            Historiske inputs
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Seneste beregninger / input-ændringer (max 50)
          </p>
          {data.runs.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              Ingen gemte inputs endnu. Ændr værdier i beregneren for at oprette
              historik.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {data.runs.map((run) => (
                <li
                  key={run.id}
                  className="rounded-md border border-zinc-100 bg-zinc-50 p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-900">
                      Brug {run.visitorId.slice(0, 8)}…
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatTime(run.createdAt)}
                    </span>
                  </div>
                  <dl className="mt-2 grid gap-1 sm:grid-cols-2">
                    {Object.entries(run.inputs).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <dt className="inline text-zinc-500">{key}: </dt>
                        <dd className="inline font-medium tabular-nums text-zinc-900">
                          {formatValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {Object.keys(run.outputs).length > 0 ? (
                    <dl className="mt-2 border-t border-zinc-200 pt-2 grid gap-1 sm:grid-cols-2">
                      {Object.entries(run.outputs).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <dt className="inline text-zinc-500">{key}: </dt>
                          <dd className="inline font-medium tabular-nums text-zinc-900">
                            {formatValue(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-zinc-900">Seneste events</h3>
          {data.recentEvents.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Ingen events endnu.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {data.recentEvents.map((event) => (
                <li key={event.id ?? `${event.at}-${event.name}`} className="py-2 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-zinc-900">{event.name}</span>
                    <span className="text-xs text-zinc-500">
                      {formatTime(event.at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
