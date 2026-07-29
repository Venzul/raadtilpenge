"use client";

import { useState } from "react";

type CategoryId = "boern" | "frie-midler" | "pension" | "erhverv";
type BoernTypeId = "boerneopsparing" | "depot-mindreaarige";
type FrieMidlerTypeId = "alm-aktiedepot" | "ask";
type PensionTypeId = "aldersopsparing" | "ratepension" | "livrente";

const categories: { id: CategoryId; label: string }[] = [
  { id: "boern", label: "Børn og Minderårige" },
  { id: "frie-midler", label: "Frie Midler" },
  { id: "pension", label: "Pension" },
  { id: "erhverv", label: "Erhverv" },
];

const boernTypes: { id: BoernTypeId; label: string }[] = [
  { id: "boerneopsparing", label: "Børneopsparing (værdipapirdepot)" },
  { id: "depot-mindreaarige", label: "Depot til Mindreårige" },
];

const frieMidlerTypes: { id: FrieMidlerTypeId; label: string }[] = [
  { id: "alm-aktiedepot", label: "Alm Aktiedepot" },
  { id: "ask", label: "ASK" },
];

const pensionTypes: { id: PensionTypeId; label: string }[] = [
  { id: "aldersopsparing", label: "Aldersopsparing" },
  { id: "ratepension", label: "Ratepension" },
  { id: "livrente", label: "Livrente" },
];

const pensionTypeInfo: Record<PensionTypeId, string> = {
  aldersopsparing:
    "Ingen fradrag ved indskud, men udbetalingerne er til gengæld helt skattefrie ved pensionering.",
  ratepension:
    "Opsparing med fradrag i topskat/bundskat, som udbetales i rater over 10-30 år.",
  livrente:
    "Investeringsdepoter tilknyttet livsvarige eller engangsudbetalte pensionsordninger.",
};

type EtfRow = {
  isin: string;
  navn: string;
  aop: string;
  indeks: string;
  antalAktier: string;
  pris: string;
  beskatningsform: string;
  skatPositiv: string;
  kommentar: string;
};

type InfoField = {
  label: string;
  text: string;
};

const boerneopsparingEtfs: EtfRow[] = [
  {
    isin: "P500",
    navn: "Amundi S&P 500 UCITS ETF",
    aop: "0,05 %",
    indeks: "S&P 500",
    antalAktier: "~500",
    pris: "130",
    beskatningsform: "Kapital",
    skatPositiv: "Akkum",
    kommentar: "Nej",
  },
  {
    isin: "FWRA",
    navn: "Invesco FTSE All-World",
    aop: "0,15 %",
    indeks: "FTSE All-World (Global)",
    antalAktier: "~2.000",
    pris: "60",
    beskatningsform: "Kapital",
    skatPositiv: "Akkum",
    kommentar: "Nej",
  },
  {
    isin: "ESGW",
    navn: "Invesco MSCI World ESG Universal",
    aop: "0,19 %",
    indeks: "Bred global (Udviklede markeder)",
    antalAktier: "~750",
    pris: "65",
    beskatningsform: "Kapital",
    skatPositiv: "Akkum",
    kommentar: "Nej",
  },
  {
    isin: "Nordnet Global",
    navn: "Nordnet Global Indeks",
    aop: "0,20 %",
    indeks: "MSCI World",
    antalAktier: "~1.400",
    pris: "140",
    beskatningsform: "Kapital",
    skatPositiv: "Akkum",
    kommentar: "Nej",
  },
];

const almAktiedepotEtfs: EtfRow[] = [
  {
    isin: "SPVIGAKL",
    navn: "Sparinvest INDEX Globale Aktier KL",
    aop: "0,50 %",
    indeks: "MSCI ACWI IMI",
    antalAktier: "~750 - 1.500",
    pris: "209",
    beskatningsform: "Aktie",
    skatPositiv: "Udlod",
    kommentar: "DK",
  },
  {
    isin: "STIIAM",
    navn: "Storebrand Indeks - Alle Markeder A5",
    aop: "0,30 %",
    indeks: "MSCI ACWI (Bæredygtighedsscreenet)",
    antalAktier: "~1.200 - 1.400",
    pris: "2446",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "DK",
  },
  {
    isin: "DK0064866222",
    navn: "Sparinvest INDEX MSCI ACWI",
    aop: "0,35 %",
    indeks: "MSCI ACWI",
    antalAktier: "~2.700",
    pris: "100",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "DK",
  },
  {
    isin: "DK0064866305",
    navn: "Sparinvest INDEX S&P 500",
    aop: "0,30 %",
    indeks: "S&P 500",
    antalAktier: "~500",
    pris: "100",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "DK",
  },
];

const askEtfs: EtfRow[] = [
  {
    isin: "SPYL",
    navn: "SPDR S&P 500 UCITS ETF",
    aop: "0,03 %",
    indeks: "S&P 500",
    antalAktier: "~500",
    pris: "82",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "Ja",
  },
  {
    isin: "PRAW",
    navn: "Amundi Prime Global UCITS ETF",
    aop: "0,05 %",
    indeks: "MSCI World",
    antalAktier: "~1.600",
    pris: "605",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "Ja",
  },
  {
    isin: "WEBN",
    navn: "Amundi Prime All Country World",
    aop: "0,07 %",
    indeks: "ACWI",
    antalAktier: "~3.650",
    pris: "105",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "Ja",
  },
  {
    isin: "WEBG",
    navn: "Amundi Prime All Country World",
    aop: "0,07 %",
    indeks: "ACWI",
    antalAktier: "~3.650",
    pris: "105",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "Ja",
  },
  {
    isin: "SPYI",
    navn: "SPDR MSCI ACWI IMI UCITS",
    aop: "0,17 %",
    indeks: "ACWI + Small Cap",
    antalAktier: "~1.500",
    pris: "260",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "Ja",
  },
  {
    isin: "IUSQ",
    navn: "iShares MSCI ACWI UCITS ETF",
    aop: "0,20 %",
    indeks: "MSCI ACWI",
    antalAktier: "~3.000+",
    pris: "445",
    beskatningsform: "Aktie",
    skatPositiv: "Akkum",
    kommentar: "Ja",
  },
];

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
        selected
          ? "border-white bg-white text-zinc-950"
          : "border-zinc-600 bg-zinc-950 text-white hover:border-zinc-400 hover:bg-zinc-900"
      }`}
    >
      {label}
    </button>
  );
}

function SelectedStep({
  label,
  onChange,
}: {
  label: string;
  onChange: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white bg-white px-4 py-3 text-zinc-950">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className="ml-auto rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
      >
        Skift
      </button>
    </div>
  );
}

function StepConnector() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <div className="h-6 w-px bg-zinc-600" />
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-sm text-white/70">
      Indhold for <span className="font-medium text-white">{title}</span> er under
      opbygning.
    </div>
  );
}

function EtfTable({ rows }: { rows: EtfRow[] }) {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-white">
        Forslag til ETF&apos;er
      </h3>
      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900 text-white/70">
            <tr>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                ISIN
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                Navn
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">ÅOP</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                Primært Indeks
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                Ca. Antal Aktier i Fonden
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                Pris pr. aktie
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                Beskatningsform
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                Skat positiv
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">
                Kommentar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((etf) => (
              <tr key={etf.isin} className="bg-zinc-950 text-white">
                <td className="whitespace-nowrap px-3 py-2.5 font-medium">
                  {etf.isin}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">{etf.navn}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{etf.aop}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{etf.indeks}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {etf.antalAktier}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">{etf.pris}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {etf.beskatningsform}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {etf.skatPositiv}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  {etf.kommentar}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoBox({
  title,
  fields,
  description,
}: {
  title: string;
  fields?: InfoField[];
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-white/80">{description}</p>
      ) : null}
      {fields && fields.length > 0 ? (
        <dl className="mt-4 space-y-3 text-sm leading-6 text-white/80">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="font-medium text-white">{field.label}</dt>
              <dd className="mt-0.5">{field.text}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function AccountResult({
  title,
  fields,
  description,
  etfs,
}: {
  title: string;
  fields?: InfoField[];
  description?: string;
  etfs: EtfRow[];
}) {
  return (
    <div className="space-y-6">
      <InfoBox title={title} fields={fields} description={description} />
      <EtfTable rows={etfs} />
    </div>
  );
}

export default function AktieKontotyper() {
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [boernType, setBoernType] = useState<BoernTypeId | null>(null);
  const [frieMidlerType, setFrieMidlerType] = useState<FrieMidlerTypeId | null>(
    null,
  );
  const [pensionType, setPensionType] = useState<PensionTypeId | null>(null);

  function resetFromCategory() {
    setCategory(null);
    setBoernType(null);
    setFrieMidlerType(null);
    setPensionType(null);
  }

  function selectCategory(id: CategoryId) {
    setCategory(id);
    setBoernType(null);
    setFrieMidlerType(null);
    setPensionType(null);
  }

  const selectedCategory = categories.find((c) => c.id === category);
  const selectedBoernType = boernTypes.find((t) => t.id === boernType);
  const selectedFrieMidlerType = frieMidlerTypes.find(
    (t) => t.id === frieMidlerType,
  );
  const selectedPensionType = pensionTypes.find((t) => t.id === pensionType);

  return (
    <div className="space-y-0">
      {/* Step 1: Category */}
      <section>
        <p className="mb-3 text-sm font-medium text-white/70">
          1. Vælg kontotype
        </p>
        {category && selectedCategory ? (
          <SelectedStep
            label={selectedCategory.label}
            onChange={resetFromCategory}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((item) => (
              <OptionButton
                key={item.id}
                label={item.label}
                selected={false}
                onClick={() => selectCategory(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Step 2: Børn subtypes */}
      {category === "boern" && (
        <>
          <StepConnector />
          <section>
            <p className="mb-3 text-sm font-medium text-white/70">
              2. Vælg depot til børn
            </p>
            {boernType && selectedBoernType ? (
              <SelectedStep
                label={selectedBoernType.label}
                onChange={() => setBoernType(null)}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {boernTypes.map((item) => (
                  <OptionButton
                    key={item.id}
                    label={item.label}
                    selected={false}
                    onClick={() => setBoernType(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Step 2: Frie Midler subtypes */}
      {category === "frie-midler" && (
        <>
          <StepConnector />
          <section>
            <p className="mb-3 text-sm font-medium text-white/70">
              2. Vælg depot
            </p>
            {frieMidlerType && selectedFrieMidlerType ? (
              <SelectedStep
                label={selectedFrieMidlerType.label}
                onChange={() => setFrieMidlerType(null)}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {frieMidlerTypes.map((item) => (
                  <OptionButton
                    key={item.id}
                    label={item.label}
                    selected={false}
                    onClick={() => setFrieMidlerType(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Step 2: Pension subtypes */}
      {category === "pension" && (
        <>
          <StepConnector />
          <InfoBox
            title="Pension"
            description="Investeringsdepoter knyttet til pensionsopsparinger, hvor afkastet beskattes med en fast, lav PAL-skat på 15,3 % (lagerbeskatning)."
          />
          <StepConnector />
          <section>
            <p className="mb-3 text-sm font-medium text-white/70">
              2. Vælg pensionstype
            </p>
            {pensionType && selectedPensionType ? (
              <SelectedStep
                label={selectedPensionType.label}
                onChange={() => setPensionType(null)}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {pensionTypes.map((item) => (
                  <OptionButton
                    key={item.id}
                    label={item.label}
                    selected={false}
                    onClick={() => setPensionType(item.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Result: Børneopsparing */}
      {category === "boern" && boernType === "boerneopsparing" && (
        <>
          <StepConnector />
          <AccountResult
            title="Børneopsparing (værdipapirdepot)"
            fields={[
              {
                label: "Beskatning",
                text: "Afkast og udbytter er 100 % skattefrie i hele bindingsperioden.",
              },
              {
                label: "Regler",
                text: "Kan oprettes til børn op til 14 år med årlige og samlede indskudslofter. Bindes typisk til barnet er mellem 18 og 21 år.",
              },
            ]}
            etfs={boerneopsparingEtfs}
          />
        </>
      )}

      {/* Result: Depot til Mindreårige – placeholder */}
      {category === "boern" && boernType === "depot-mindreaarige" && (
        <>
          <StepConnector />
          <ComingSoon title="Depot til Mindreårige" />
        </>
      )}

      {/* Result: Alm Aktiedepot */}
      {category === "frie-midler" && frieMidlerType === "alm-aktiedepot" && (
        <>
          <StepConnector />
          <AccountResult
            title="Alm Aktiedepot"
            fields={[
              {
                label: "Beskatning",
                text: "Aktieindkomst (27 % op til progressionsgrænsen og 42 % herover)",
              },
              {
                label: "Princip",
                text: "Generelt realisationsbeskatning på enkeltaktier (du betaler først skat, når du sælger) og lagerbeskatning på visse fondstyper/ETF'er.",
              },
              {
                label: "Loft",
                text: "Intet indskudsloft. Du kan have så mange depoter, du vil.",
              },
            ]}
            etfs={almAktiedepotEtfs}
          />
        </>
      )}

      {/* Result: ASK */}
      {category === "frie-midler" && frieMidlerType === "ask" && (
        <>
          <StepConnector />
          <AccountResult
            title="ASK"
            fields={[
              {
                label: "Beskatning",
                text: "Særlig lempelig skattesats på kun 17 %.",
              },
              {
                label: "Princip",
                text: "Lagerbeskatning (skatten beregnes og afregnes årligt af årets værdistigning).",
              },
              {
                label: "Loft",
                text: "Der er et lovfastsat maksimalt indskudsloft (reguleres årligt).",
              },
              {
                label: "Begrænsning",
                text: "Du må kun have én Aktiesparekonto pr. person.",
              },
            ]}
            etfs={askEtfs}
          />
        </>
      )}

      {/* Result: Pension subtypes */}
      {category === "pension" && pensionType && selectedPensionType && (
        <>
          <StepConnector />
          <AccountResult
            title={selectedPensionType.label}
            description={pensionTypeInfo[pensionType]}
            etfs={askEtfs}
          />
        </>
      )}

      {/* Other top-level categories – placeholder */}
      {category &&
        category !== "boern" &&
        category !== "frie-midler" &&
        category !== "pension" &&
        selectedCategory && (
          <>
            <StepConnector />
            <ComingSoon title={selectedCategory.label} />
          </>
        )}
    </div>
  );
}
