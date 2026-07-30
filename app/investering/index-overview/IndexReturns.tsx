"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatNumberDa,
  parseDaNumber,
} from "@/app/penge/rentes-rente-beregner/calculations";
import {
  RETURN_PERIODS,
  buildGrowthPath,
  growthOfPrincipal,
  indexReturns,
  type ReturnPeriod,
} from "./data";

const PRINCIPAL_MIN = 1_000;
const PRINCIPAL_MAX = 1_000_000;
const PRINCIPAL_STEP = 1_000;
const PRINCIPAL_DEFAULT = 10_000;

function formatPct(value: number) {
  return `${value.toLocaleString("da-DK", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`;
}

function formatDkk(value: number) {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("da-DK", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function PrincipalSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const [text, setText] = useState(formatNumberDa(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatNumberDa(value));
  }, [value, focused]);

  function commit(raw: string) {
    const parsed = parseDaNumber(raw);
    if (parsed === null) {
      setText(formatNumberDa(value));
      return;
    }
    const clamped = Math.min(
      PRINCIPAL_MAX,
      Math.max(PRINCIPAL_MIN, Math.round(parsed / PRINCIPAL_STEP) * PRINCIPAL_STEP),
    );
    onChange(clamped);
    setText(formatNumberDa(clamped));
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-white">
          Startbeløb
        </label>
        <div className="flex items-center gap-1.5">
          <input
            id={`${id}-input`}
            inputMode="numeric"
            value={text}
            onFocus={() => setFocused(true)}
            onChange={(event) => setText(event.target.value)}
            onBlur={() => {
              setFocused(false);
              commit(text);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commit(text);
                (event.target as HTMLInputElement).blur();
              }
            }}
            className="w-28 rounded-md border border-zinc-600 bg-zinc-950 px-2 py-1.5 text-right text-sm text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
          />
          <span className="text-sm text-white">kr.</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={PRINCIPAL_MIN}
        max={PRINCIPAL_MAX}
        step={PRINCIPAL_STEP}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-white"
      />
      <div className="flex justify-between text-xs text-white/70">
        <span>{formatNumberDa(PRINCIPAL_MIN)} kr.</span>
        <span>{formatNumberDa(PRINCIPAL_MAX)} kr.</span>
      </div>
    </div>
  );
}

export default function IndexReturns() {
  const [period, setPeriod] = useState<ReturnPeriod>(10);
  const [principal, setPrincipal] = useState(PRINCIPAL_DEFAULT);

  const ranked = useMemo(() => {
    return [...indexReturns].sort(
      (a, b) => b.annualized[period] - a.annualized[period],
    );
  }, [period]);

  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const bestFinal = growthOfPrincipal(
    best.annualized[period],
    period,
    principal,
  );
  const world = indexReturns.find((i) => i.id === "world")!;
  const worldFinal = growthOfPrincipal(
    world.annualized[period],
    period,
    principal,
  );

  const growthChartData = useMemo(() => {
    const paths = indexReturns.map((series) => ({
      series,
      path: buildGrowthPath(series.annualized[period], period, principal),
    }));
    return paths[0].path.map((_, i) => {
      const row: Record<string, number> = { year: i };
      for (const { series, path } of paths) {
        row[series.id] = path[i]?.value ?? principal;
      }
      return row;
    });
  }, [period, principal]);

  const barChartData = useMemo(() => {
    return RETURN_PERIODS.map((years) => {
      const row: Record<string, string | number> = {
        period: `${years} år`,
        years,
      };
      for (const series of indexReturns) {
        row[series.id] = series.annualized[years];
      }
      return row;
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(16rem,20rem)] lg:items-end">
        <div className="flex flex-wrap gap-2">
          {RETURN_PERIODS.map((years) => {
            const active = years === period;
            return (
              <button
                key={years}
                type="button"
                onClick={() => setPeriod(years)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-zinc-950"
                    : "bg-zinc-900 text-white/70 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {years} år
              </button>
            );
          })}
        </div>
        <PrincipalSlider value={principal} onChange={setPrincipal} />
      </div>

      {/* Mini overview */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">
            Periode
          </p>
          <p className="mt-1 text-xl font-semibold text-white">{period} år</p>
          <p className="mt-1 text-sm text-white/50">
            Vækst af {formatDkk(principal)} (årligt geninvesteret)
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">
            Stærkest i perioden
          </p>
          <p className="mt-1 text-xl font-semibold text-white">{best.shortName}</p>
          <p className="mt-1 text-sm tabular-nums text-white/50">
            {formatPct(best.annualized[period])} p.a. → {formatDkk(bestFinal)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">
            MSCI World
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-white">
            {formatPct(world.annualized[period])}
          </p>
          <p className="mt-1 text-sm text-white/50">
            p.a. · ender på {formatDkk(worldFinal)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">
            Spredning
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-white">
            {formatPct(best.annualized[period] - worst.annualized[period])}
          </p>
          <p className="mt-1 text-sm text-white/50">
            forskel bedste vs. svageste (p.a.)
          </p>
        </div>
      </div>

      <p className="max-w-3xl text-sm leading-6 text-white/55">
        <span className="font-medium text-white/80">Mini-overblik:</span> Den
        øverste graf viser, hvordan {formatDkk(principal)} ville være vokset
        over {period} år ved hvert indekss årlige afkast. Den nederste graf
        sammenligner det <span className="text-white/80">årlige</span> afkast
        på tværs af alle perioder — korte perioder svinger mere; lange perioder
        glattes ud.
      </p>

      {/* Growth chart */}
      <div>
        <h3 className="text-sm font-medium text-white/70">
          Kursudvikling — vækst af {formatDkk(principal)} over {period} år
        </h3>
        <div className="mt-3 h-72 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 p-2 sm:h-80 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthChartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  value === 0 ? "Start" : `${value} år`
                }
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={formatCompact}
                width={48}
              />
              <Tooltip
                formatter={(value, name) => {
                  const series = indexReturns.find((i) => i.id === name);
                  return [
                    formatDkk(Number(value ?? 0)),
                    series?.name ?? String(name),
                  ];
                }}
                labelFormatter={(label) =>
                  Number(label) === 0 ? "Start" : `Efter ${label} år`
                }
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#52525b",
                  backgroundColor: "#09090b",
                  color: "#ffffff",
                  fontSize: 13,
                }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Legend
                wrapperStyle={{ color: "#ffffff", fontSize: 12 }}
                formatter={(value) =>
                  indexReturns.find((i) => i.id === value)?.shortName ?? value
                }
              />
              {indexReturns.map((series) => (
                <Line
                  key={series.id}
                  type="monotone"
                  dataKey={series.id}
                  name={series.id}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Annualized bar chart across periods */}
      <div>
        <h3 className="text-sm font-medium text-white/70">
          Årligt afkast (annualiseret) — alle perioder
        </h3>
        <div className="mt-3 h-72 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 p-2 sm:h-80 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="period"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={(v: number) => `${v}%`}
                width={40}
              />
              <Tooltip
                formatter={(value, name) => {
                  const series = indexReturns.find((i) => i.id === name);
                  return [
                    formatPct(Number(value ?? 0)),
                    series?.name ?? String(name),
                  ];
                }}
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#52525b",
                  backgroundColor: "#09090b",
                  color: "#ffffff",
                  fontSize: 13,
                }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Legend
                wrapperStyle={{ color: "#ffffff", fontSize: 12 }}
                formatter={(value) =>
                  indexReturns.find((i) => i.id === value)?.shortName ?? value
                }
              />
              {indexReturns.map((series) => (
                <Bar
                  key={series.id}
                  dataKey={series.id}
                  name={series.id}
                  fill={series.color}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compact ranking for selected period */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/60 text-white/60">
            <tr>
              <th className="px-4 py-3 font-medium">Indeks</th>
              <th className="px-4 py-3 font-medium">Årligt afkast</th>
              <th className="px-4 py-3 font-medium">
                {formatDkk(principal)} efter {period} år
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((series) => {
              const final = growthOfPrincipal(
                series.annualized[period],
                period,
                principal,
              );
              return (
                <tr
                  key={series.id}
                  className="border-b border-zinc-800/80 last:border-0"
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-white">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: series.color }}
                      />
                      {series.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white/90">
                    {formatPct(series.annualized[period])}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white/90">
                    {formatDkk(final)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-5 text-white/40">
        Nettoafkast i USD (før dansk skat og fondsomkostninger). Nasdaq-tal
        følger typisk Nasdaq-100 / QQQ-agtige total returns. 1–10 års MSCI-tal
        ligger tæt på factsheets ca. juni 2026; 20–30 år er afrundede langsigtede
        skøn til undervisning. Fortidigt afkast er ingen garanti for fremtidige
        resultater.
      </p>
    </div>
  );
}
