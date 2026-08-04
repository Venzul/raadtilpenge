"use client";

import { useDeferredValue, useEffect, useState } from "react";

type SearchRow = {
  isin: string;
  name: string;
  nameShareclass: string | null;
  nameSubfund: string | null;
  taxResidence: string | null;
  registeredYears: string | null;
};

type RecommendedEtfStatus = {
  ticker: string;
  isin: string | null;
  navn: string;
  kontotyper: string[];
  danishImb: boolean;
  onList: boolean;
  listName: string | null;
};

type RecommendedResponse = {
  ok: boolean;
  source: string;
  meta: {
    count: number;
    published: string;
    importedAt: string;
    sheet: string;
    version: string;
    sourcePage: string;
  };
  etfs: RecommendedEtfStatus[];
};

function formatDaDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({
  onList,
  danishImb,
}: {
  onList: boolean;
  danishImb: boolean;
}) {
  if (onList) {
    return (
      <span className="inline-flex rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
        På listen
      </span>
    );
  }
  if (danishImb) {
    return (
      <span className="inline-flex rounded-md bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-300">
        Dansk IMB
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">
      Ikke på listen
    </span>
  );
}

export default function SkatsPositivliste() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [searchRows, setSearchRows] = useState<SearchRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<RecommendedResponse | null>(
    null,
  );
  const [recommendedError, setRecommendedError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/positivliste/recommended")
      .then(async (res) => {
        const data = (await res.json()) as RecommendedResponse & {
          error?: string;
        };
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Kunne ikke hente data");
        }
        if (!cancelled) setRecommended(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setRecommendedError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = deferredQuery.trim();
    if (q.length < 2) {
      setSearchRows([]);
      setSearchSource(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    const handle = window.setTimeout(() => {
      fetch(`/api/positivliste/search?q=${encodeURIComponent(q)}`)
        .then(async (res) => {
          const data = await res.json();
          if (!cancelled) {
            setSearchRows(data.rows ?? []);
            setSearchSource(data.source ?? null);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSearchRows([]);
            setSearchSource(null);
          }
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [deferredQuery]);

  return (
    <div className="space-y-14">
      <section className="max-w-3xl space-y-4 text-base leading-7 text-white/75">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Hvad er Skats positivliste?
        </h2>
        <p>
          Skats positivliste — officielt{" "}
          <span className="text-white">
            listen over aktiebaserede investeringsselskaber (ABIS)
          </span>{" "}
          — er Skattestyrelsens oversigt over udenlandske fonde og ETF&apos;er,
          der har oplyst, at mindst halvdelen af formuen er aktier. Når en fond
          står på listen, beskattes dit afkast som{" "}
          <span className="text-white">aktieindkomst</span> (27&nbsp;%/42&nbsp;%
          efter lagerprincippet på et almindeligt depot). Står den ikke på
          listen, beskattes den typisk som{" "}
          <span className="text-white">kapitalindkomst</span> — ofte dyrere.
        </p>
        <p>
          Listen er{" "}
          <span className="text-white">ikke</span> en anbefaling. Den siger
          intet om kvalitet, risiko eller forventet afkast — kun om
          skatteklassifikationen.
        </p>
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Hvorfor er den relevant?
        </h2>
        <ul className="space-y-3 text-base leading-7 text-white/75">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
            <span>
              <span className="text-white">Aktiesparekonto (ASK):</span> Du må
              kun købe ETF&apos;er, der beskattes som aktieindkomst — dvs. dem på
              positivlisten (eller danske aktiebaserede IMB&apos;er).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
            <span>
              <span className="text-white">Almindeligt aktiedepot:</span>{" "}
              Listen afgør, om lagerbeskatningen falder som aktie- eller
              kapitalindkomst.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
            <span>
              <span className="text-white">Pension og børneopsparing:</span>{" "}
              Mindre afgørende, fordi PAL-skat / skattefrihed gælder uanset
              listen.
            </span>
          </li>
        </ul>
      </section>

      <section className="max-w-3xl rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Eksempel
        </h2>
        <p className="mt-3 text-base leading-7 text-white/75">
          Du overvejer to globale ETF&apos;er til din ASK. Den ene er{" "}
          <span className="text-white">Amundi Prime All Country World (WEBN)</span>{" "}
          — den står på positivlisten og kan købes på ASK med 17&nbsp;%
          lagerbeskatning. Den anden er{" "}
          <span className="text-white">Invesco FTSE All-World (FWRA)</span> — den
          står ikke på listen. Så kan du ikke købe den på ASK, og på et
          almindeligt depot vil afkastet typisk blive kapitalindkomst i stedet
          for aktieindkomst.
        </p>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Tip: Tjek altid med ISIN-koden. Tickers kan dække flere andelsklasser.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Søg i positivlisten
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          Søg på ISIN-kode eller (del af) navn på ETF.
        </p>
        <p className="mt-2 text-sm text-white/45">
          {recommended ? (
            <>
              Version:{" "}
              <span className="text-white/70">{recommended.meta.version}</span>
              {" · "}
              Skats offentliggørelse:{" "}
              <span className="text-white/70">
                {formatDaDate(recommended.meta.published)}
              </span>
              {" · "}
              Opdateret her:{" "}
              <span className="text-white/70">
                {formatDaDate(recommended.meta.importedAt)}
              </span>
              {" · "}
              {recommended.meta.count.toLocaleString("da-DK")} fonde
            </>
          ) : (
            "Henter versionsinfo…"
          )}
        </p>

        <label className="mt-5 block max-w-xl">
          <span className="sr-only">Søg ISIN eller navn</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fx IE0003XJA0J9 eller Amundi Prime…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-0 transition focus:border-white/40"
          />
        </label>

        <div className="mt-4 min-h-10">
          {deferredQuery.trim().length > 0 &&
            deferredQuery.trim().length < 2 && (
              <p className="text-sm text-white/45">Skriv mindst 2 tegn…</p>
            )}
          {searchLoading && (
            <p className="text-sm text-white/45">Søger…</p>
          )}
          {!searchLoading &&
            deferredQuery.trim().length >= 2 &&
            searchRows.length === 0 && (
              <p className="text-sm text-amber-300/90">
                Ingen match — fonden er sandsynligvis ikke på positivlisten for
                2026.
              </p>
            )}
          {searchRows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-white/55">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">ISIN</th>
                    <th className="px-3 py-2.5 font-medium">Navn</th>
                    <th className="px-3 py-2.5 font-medium">Hjemsted</th>
                    <th className="px-3 py-2.5 font-medium">Registreret</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-white/85">
                  {searchRows.map((row) => (
                    <tr key={`${row.isin}-${row.name}`}>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-white">
                        {row.isin}
                      </td>
                      <td className="px-3 py-2.5">{row.name}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-white/60">
                        {row.taxResidence ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-white/60">
                        {row.registeredYears ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {searchSource && (
                <p className="border-t border-zinc-800 px-3 py-2 text-xs text-white/35">
                  Kilde: {searchSource === "database" ? "database" : "lokal liste"}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Vores anbefalede ETF&apos;er
        </h2>
        <p className="mt-2 max-w-2xl text-white/65">
          Samme ETF&apos;er som under{" "}
          <a
            href="/investering/aktie-kontotyper"
            className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
          >
            Aktie kontotyper
          </a>
          — her med status på Skats positivliste for 2026.
        </p>

        {recommendedError && (
          <p className="mt-4 text-sm text-amber-300">{recommendedError}</p>
        )}

        {!recommended && !recommendedError && (
          <p className="mt-4 text-sm text-white/45">Henter status…</p>
        )}

        {recommended && (
          <>
            <div className="mt-5 overflow-x-auto rounded-lg border border-zinc-800">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-white/55">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Ticker</th>
                    <th className="px-3 py-2.5 font-medium">Navn</th>
                    <th className="px-3 py-2.5 font-medium">ISIN</th>
                    <th className="px-3 py-2.5 font-medium">Kontotyper</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-white/85">
                  {recommended.etfs.map((etf) => (
                    <tr key={etf.ticker}>
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-white">
                        {etf.ticker}
                      </td>
                      <td className="px-3 py-2.5">
                        <div>{etf.navn}</div>
                        {etf.danishImb && !etf.onList && (
                          <p className="mt-1 text-xs text-white/45">
                            Danske aktiebaserede IMB&apos;er står normalt ikke på
                            ABIS-listen, men beskattes stadig som aktieindkomst.
                          </p>
                        )}
                        {!etf.danishImb && !etf.onList && etf.isin && (
                          <p className="mt-1 text-xs text-white/45">
                            Ikke fundet på 2026-listen — tjek evt. anden
                            andelsklasse / opdateret liste hos Skat.
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                        {etf.isin ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-white/65">
                        {etf.kontotyper.join(", ")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <StatusBadge
                          onList={etf.onList}
                          danishImb={etf.danishImb}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-white/45">
              Officiel liste:{" "}
              <a
                href={recommended.meta.sourcePage}
                target="_blank"
                rel="noreferrer"
                className="text-white/70 underline decoration-white/25 underline-offset-2 hover:text-white"
              >
                skat.dk — investeringsforeninger og selskaber
              </a>
              . Offentliggjort den 29. juni 2026 (
              {recommended.meta.count.toLocaleString("da-DK")} poster).
            </p>
          </>
        )}
      </section>
    </div>
  );
}
