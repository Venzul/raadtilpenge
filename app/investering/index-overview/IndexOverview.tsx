"use client";

import { useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import IndexReturns from "./IndexReturns";
import {
  KEY_STATS,
  REGION_COLORS,
  acwiImiTree,
  coveragePieces,
  fundCoverage,
  indexExplainers,
  topCountries,
  type HierarchyNode,
  type RegionId,
} from "./data";

const regionChartData: { name: string; value: number; region: RegionId }[] = [
  { name: "USA", value: 62.7, region: "usa" },
  { name: "Europa", value: 13.7, region: "europe" },
  { name: "Emerging markets", value: 12.3, region: "em" },
  { name: "Pacific", value: 8.0, region: "pacific" },
  { name: "Canada", value: 3.0, region: "canada" },
  { name: "Israel", value: 0.4, region: "israel" },
];

function formatPct(value: number) {
  return `${value.toLocaleString("da-DK", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })} %`;
}

function SectionNav() {
  const items = [
    { href: "#hvad-er-indeks", label: "Hvad er et indeks?" },
    { href: "#verdenskortet", label: "Verdensmarkedet" },
    { href: "#geografi", label: "Geografi" },
    { href: "#sammenlign", label: "Indekser" },
    { href: "#fonde", label: "Dine fonde" },
    { href: "#afkast", label: "Afkast" },
    { href: "#daekning", label: "Byg dækning" },
  ];

  return (
    <nav className="sticky top-0 z-10 -mx-4 mb-10 overflow-x-auto border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      <ul className="flex gap-1 py-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block shrink-0 rounded-md px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HierarchyRow({
  node,
  depth,
  expanded,
  onToggle,
}: {
  node: HierarchyNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(node.id);
  const barColor = node.color ?? "#a1a1aa";

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && onToggle(node.id)}
        className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
          hasChildren ? "hover:bg-zinc-900" : ""
        }`}
        style={{ paddingLeft: `${0.5 + depth * 1.1}rem` }}
        aria-expanded={hasChildren ? isOpen : undefined}
      >
        <span className="w-4 shrink-0 text-center text-white/40">
          {hasChildren ? (isOpen ? "▾" : "▸") : "·"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span className="font-medium text-white">{node.label}</span>
            <span className="tabular-nums text-sm text-white/80">
              {formatPct(node.pctOfAcwiImi)}
            </span>
          </div>
          {node.note ? (
            <p className="mt-0.5 text-xs text-white/45">{node.note}</p>
          ) : null}
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(node.pctOfAcwiImi, 100)}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>
      </button>
      {hasChildren && isOpen
        ? node.children!.map((child) => (
            <HierarchyRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))
        : null}
    </div>
  );
}

function HierarchyTree() {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["acwi-imi", "world-imi", "usa-imi", "pacific-imi"]),
  );

  function onToggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <HierarchyRow
        node={acwiImiTree}
        depth={0}
        expanded={expanded}
        onToggle={onToggle}
      />
    </div>
  );
}

function RegionTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white shadow-lg">
      <p className="font-medium">{item.name}</p>
      <p className="text-white/70">{formatPct(item.value)} af ACWI IMI</p>
    </div>
  );
}

function CoverageBuilder() {
  const [enabled, setEnabled] = useState({
    world: true,
    em: false,
    small: false,
  });

  const total = useMemo(() => {
    return coveragePieces.reduce(
      (sum, piece) => (enabled[piece.id] ? sum + piece.pct : sum),
      0,
    );
  }, [enabled]);

  const label =
    enabled.world && enabled.em && enabled.small
      ? "ACWI IMI-agtig dækning"
      : enabled.world && enabled.em
        ? "ACWI-agtig dækning"
        : enabled.world
          ? "World-agtig dækning"
          : "Vælg mindst én brik";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        {coveragePieces.map((piece) => {
          const checked = enabled[piece.id];
          return (
            <label
              key={piece.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                checked
                  ? "border-white/30 bg-zinc-900"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 size-4 accent-white"
                checked={checked}
                disabled={piece.id === "world"}
                onChange={() =>
                  setEnabled((prev) => ({
                    ...prev,
                    [piece.id]: !prev[piece.id],
                  }))
                }
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-white">{piece.label}</span>
                  <span className="tabular-nums text-sm text-white/70">
                    {formatPct(piece.pct)}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-white/50">
                  {piece.description}
                  {piece.id === "world" ? " (basis)" : ""}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-white/50">Ca. dækning af ACWI IMI</p>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-white">
              {formatPct(Math.min(total, 100))}
            </p>
            <p className="mt-1 text-sm text-white/60">{label}</p>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-sky-400 transition-all duration-300"
            style={{ width: `${Math.min(total, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Tallene er forenklede absolutte vægte ift. ACWI IMI. I praksis
          overlapper fonde ikke perfekt, og ESG-screening kan reducere dækningen
          yderligere.
        </p>
      </div>
    </div>
  );
}

export default function IndexOverview() {
  const [selectedIndex, setSelectedIndex] = useState(indexExplainers[0].id);
  const activeExplainer =
    indexExplainers.find((item) => item.id === selectedIndex) ??
    indexExplainers[0];

  return (
    <div>
      <SectionNav />

      <section id="hvad-er-indeks" className="scroll-mt-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {KEY_STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-l-2 border-sky-400/80 pl-4 py-1"
            >
              <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                {stat.label}
              </p>
              <p className="text-sm text-white/45">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-3xl space-y-4 text-base leading-7 text-white/75">
          <p>
            Et <span className="text-white">indeks</span> er en opskrift på,
            hvilke aktier der tæller med i “markedet”, og hvor meget hver aktie
            fylder. Vægtene følger typisk{" "}
            <span className="text-white">markedskapitalisering</span> — store
            selskaber fylder mere end små.
          </p>
          <p>
            Når du køber en global indeksfond, køber du en skive af den opskrift.
            Derfor er det nyttigt at kende forskellen på fx{" "}
            <span className="text-white">MSCI World</span>,{" "}
            <span className="text-white">ACWI</span>,{" "}
            <span className="text-white">ACWI IMI</span>,{" "}
            <span className="text-white">S&P 500</span> og{" "}
            <span className="text-white">Nasdaq-100</span> — og hvorfor USA
            ofte fylder mere end resten af verden tilsammen.
          </p>
        </div>
      </section>

      <section id="verdenskortet" className="mt-16 scroll-mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Verdensmarkedet som et træ
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          Tænk på ACWI IMI som 100 %. Klik for at åbne regionerne — vægtene
          summerer til hele indekset (absolutte vægte).
        </p>
        <div className="mt-6">
          <HierarchyTree />
        </div>
        <p className="mt-4 text-sm text-white/45">
          Inspiration: hierarkiske market-cap-vægte som på marketcaps.site.
          Tallene er illustrative og opdateres ikke live.
        </p>
      </section>

      <section id="geografi" className="mt-16 scroll-mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Geografisk fordeling
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          En “global” portefølje er i praksis ofte USA-tung. S&P 500 og Nasdaq
          er begge <span className="text-white/85">kun USA</span> — men dækker
          forskellig bredde inden for det amerikanske marked.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="h-72 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="78%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {regionChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={REGION_COLORS[entry.region]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<RegionTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2.5">
            {regionChartData.map((entry) => (
              <li
                key={entry.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2 text-white/80">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: REGION_COLORS[entry.region] }}
                  />
                  {entry.name}
                </span>
                <span className="tabular-nums text-white">
                  {formatPct(entry.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-white/60">
              <tr>
                <th className="px-4 py-3 font-medium">Land</th>
                <th className="px-4 py-3 font-medium">Vægt i ACWI IMI</th>
                <th className="px-4 py-3 font-medium">Verdensindekser</th>
                <th className="px-4 py-3 font-medium">Nationale indekser</th>
                <th className="px-4 py-3 font-medium">Kontekst</th>
              </tr>
            </thead>
            <tbody>
              {topCountries.map((row) => (
                <tr
                  key={row.land}
                  className="border-b border-zinc-800/80 last:border-0"
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-white">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: REGION_COLORS[row.region],
                        }}
                      />
                      {row.land}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white/90">
                    {formatPct(row.pct)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {row.worldIndexes.map((indexName) => (
                        <span
                          key={indexName}
                          className="rounded border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-xs text-sky-200/90"
                        >
                          {indexName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {row.nationalIndexes.map((indexName) => (
                        <span
                          key={indexName}
                          className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs text-white/75"
                        >
                          {indexName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/55">{row.changeNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-white/45">
          Verdensindekser (MSCI ACWI IMI / ACWI / World) plus nationale
          storindekser pr. land — uden small-cap-indekser. Vægtene er andele af
          ACWI IMI.
        </p>
      </section>

      <section id="sammenlign" className="mt-16 scroll-mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Populære indekser — side om side
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          Samme “globale” etikette, meget forskellig dækning — og USA-indekserne
          S&P 500 og Nasdaq-100 er slet ikke globale.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {indexExplainers.map((item) => {
            const active = item.id === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(item.id)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-zinc-950"
                    : "bg-zinc-900 text-white/70 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="mt-6 border-l-2 border-zinc-700 pl-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="text-xl font-semibold text-white">
              {activeExplainer.name}
            </h3>
            {activeExplainer.pctOfAcwiImi != null ? (
              <span className="tabular-nums text-sm text-sky-300">
                ca. {formatPct(activeExplainer.pctOfAcwiImi)} af ACWI IMI
              </span>
            ) : (
              <span className="text-sm text-white/50">
                delmængde af USA — ikke direkte sammenlignelig
              </span>
            )}
          </div>
          <p className="mt-3 max-w-2xl leading-7 text-white/75">
            {activeExplainer.summary}
          </p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-white/40">
                Inkluderer
              </dt>
              <dd className="mt-1 text-sm text-white/80">
                {activeExplainer.includes}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-white/40">
                Mangler typisk
              </dt>
              <dd className="mt-1 text-sm text-white/80">
                {activeExplainer.excludes}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 max-w-2xl space-y-3 text-sm leading-6 text-white/60">
          <p>
            <span className="font-medium text-white/85">Relative vægte</span>{" "}
            fortæller, hvordan du fordeler det du har valgt (fx 88 % World + 12 %
            EM = 100 % af din portefølje).
          </p>
          <p>
            <span className="font-medium text-white/85">Absolutte vægte</span>{" "}
            fortæller, hvor tæt du er på hele markedet (fx World alene ≈ 78 % af
            ACWI IMI).
          </p>
        </div>
      </section>

      <section id="fonde" className="mt-16 scroll-mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Hvad dækker fonde, du kender?
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          Eksempler fra danske udbud — koblet til indekserne ovenfor. Se også{" "}
          <a
            href="/investering/aktie-kontotyper"
            className="text-sky-300 underline-offset-2 hover:underline"
          >
            Aktie kontotyper
          </a>
          .
        </p>

        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-white/60">
              <tr>
                <th className="px-4 py-3 font-medium">Fond</th>
                <th className="px-4 py-3 font-medium">Indeks</th>
                <th className="px-4 py-3 font-medium">Ca. dækning</th>
                <th className="px-4 py-3 font-medium">Dækker</th>
                <th className="px-4 py-3 font-medium">Mangler</th>
              </tr>
            </thead>
            <tbody>
              {fundCoverage.map((fund) => (
                <tr
                  key={fund.name}
                  className="border-b border-zinc-800/80 align-top last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {fund.name}
                  </td>
                  <td className="px-4 py-3 text-white/70">{fund.indeks}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[7rem] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-sky-400"
                          style={{
                            width: `${Math.min(fund.approxPct, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-10 tabular-nums text-white/80">
                        {fund.approxPct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/65">{fund.covers}</td>
                  <td className="px-4 py-3 text-white/65">{fund.misses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="afkast" className="mt-16 scroll-mt-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Historisk afkast
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          Sådan er indekserne steget over 1, 3, 5, 10, 20 og 30 år — inkl. S&P
          500 og Nasdaq. Justér startbeløbet, og se væksten dynamisk.
        </p>
        <div className="mt-6">
          <IndexReturns />
        </div>
      </section>

      <section id="daekning" className="mt-16 scroll-mt-16 pb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Byg din dækning
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          Start med World, og se hvad der sker, når du lægger emerging markets
          og small cap ovenpå. S&P 500 og Nasdaq er USA-only og erstatter ikke
          en global dækning — de er skiver af den amerikanske del.
        </p>
        <div className="mt-6 max-w-xl">
          <CoverageBuilder />
        </div>
      </section>

      <p className="mt-12 border-t border-zinc-800 pt-6 text-xs leading-5 text-white/35">
        Uddannelsesmateriale — ikke investeringsrådgivning. Vægte, afkast og
        markedsandele ændrer sig løbende. Kilder til inspiration: MSCI ACWI IMI
        geographic breakdown, MSCI factsheets og marketcaps.site. Afkasttal er
        illustrative (ca. juni 2026) og før dansk skat.
      </p>
    </div>
  );
}
