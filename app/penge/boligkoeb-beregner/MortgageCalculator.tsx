"use client";

import { useEffect, useId, useState } from "react";
import {
  calculateMortgage,
  formatDkk,
  formatNumberDa,
  formatPercentDa,
  getAmortizationRows,
  parseDaNumber,
  type AmortizationDisplayRow,
  type AmortizationMode,
} from "./calculations";

/** Approximate current fixed realkredit rate (user-adjustable). */
const DEFAULT_INTEREST_RATE = 2.6;

const inputClassName =
  "w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-white outline-none placeholder:text-zinc-400 focus:border-white focus:ring-1 focus:ring-white";

function CurrencyInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(formatNumberDa(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatNumberDa(value));
  }, [value, focused]);

  function formatTypedAmount(
    raw: string,
    cursor: number | null,
  ): { formatted: string; parsed: number | null; nextCursor: number } {
    const digitsBeforeCursor = raw
      .slice(0, cursor ?? raw.length)
      .replace(/\D/g, "").length;
    const digits = raw.replace(/\D/g, "");

    if (digits === "") {
      return { formatted: "", parsed: null, nextCursor: 0 };
    }

    const parsed = Number(digits);
    const formatted = formatNumberDa(parsed);

    let nextCursor = 0;
    let seen = 0;
    while (nextCursor < formatted.length && seen < digitsBeforeCursor) {
      if (/\d/.test(formatted[nextCursor] ?? "")) seen += 1;
      nextCursor += 1;
    }

    return { formatted, parsed, nextCursor };
  }

  function commit(raw: string) {
    const parsed = parseDaNumber(raw);
    if (parsed === null || parsed < 0) {
      setText(formatNumberDa(value));
      return;
    }
    onChange(parsed);
    setText(formatNumberDa(parsed));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        value={text}
        onFocus={() => setFocused(true)}
        onChange={(event) => {
          const input = event.target;
          const { formatted, parsed, nextCursor } = formatTypedAmount(
            input.value,
            input.selectionStart,
          );
          setText(formatted);
          if (parsed !== null) onChange(parsed);
          requestAnimationFrame(() => {
            input.setSelectionRange(nextCursor, nextCursor);
          });
        }}
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
        className={inputClassName}
      />
    </div>
  );
}

function SliderWithInput({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  fractionDigits = 0,
  inputWidthClassName = "w-20",
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  fractionDigits?: number;
  inputWidthClassName?: string;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(formatNumberDa(value, fractionDigits));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatNumberDa(value, fractionDigits));
  }, [value, fractionDigits, focused]);

  function commit(raw: string) {
    const parsed = parseDaNumber(raw);
    if (parsed === null) {
      setText(formatNumberDa(value, fractionDigits));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setText(formatNumberDa(clamped, fractionDigits));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-white">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            id={`${id}-input`}
            inputMode="decimal"
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
            className={`${inputWidthClassName} rounded-md border border-zinc-600 bg-zinc-950 px-2 py-1.5 text-right text-sm text-white outline-none focus:border-white focus:ring-1 focus:ring-white`}
          />
          <span className="text-sm text-white">{unit}</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-white"
      />
      <div className="flex justify-between text-xs text-white/70">
        <span>
          {formatNumberDa(min, fractionDigits)}
          {unit}
        </span>
        <span>
          {formatNumberDa(max, fractionDigits)}
          {unit}
        </span>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-800 py-2.5 last:border-0">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function AmortizationTable({
  rows,
  mode,
}: {
  rows: AmortizationDisplayRow[];
  mode: AmortizationMode;
}) {
  const periodHeader =
    mode === "years" ? "År" : mode === "months" ? "Måned" : "Termin";

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950">
      <table className="min-w-full text-left text-sm text-white">
        <thead className="border-b border-zinc-700 bg-zinc-900 text-white">
          <tr>
            <th className="px-4 py-3 font-medium">{periodHeader}</th>
            <th className="px-4 py-3 font-medium">Restgæld primo</th>
            <th className="px-4 py-3 font-medium">Ydelse</th>
            <th className="px-4 py-3 font-medium">Rente</th>
            <th className="px-4 py-3 font-medium">Bidrag</th>
            <th className="px-4 py-3 font-medium">Afdrag</th>
            <th className="px-4 py-3 font-medium">Restgæld ultimo</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-white/70">
                Ingen perioder at vise. Vælg lånebeløb og løbetid over 0.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={`${mode}-${row.period}`}
                className="border-b border-zinc-800 last:border-0"
              >
                <td className="px-4 py-2.5 font-medium text-white">
                  {row.period}
                </td>
                <td className="px-4 py-2.5 text-white">
                  {formatDkk(row.startBalance)}
                </td>
                <td className="px-4 py-2.5 text-white">
                  {formatDkk(row.payment)}
                </td>
                <td className="px-4 py-2.5 text-white">
                  {formatDkk(row.interest)}
                </td>
                <td className="px-4 py-2.5 text-white">
                  {formatDkk(row.contribution)}
                </td>
                <td className="px-4 py-2.5 text-emerald-400">
                  {formatDkk(row.principal)}
                </td>
                <td className="px-4 py-2.5 font-medium text-white">
                  {formatDkk(row.endBalance)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function MortgageCalculator() {
  const baseId = useId();
  const [guideOpen, setGuideOpen] = useState(false);
  const [buyingPowerOpen, setBuyingPowerOpen] = useState(false);
  const [annualSalary, setAnnualSalary] = useState(750_000);
  const [debtFactor, setDebtFactor] = useState(3.5);
  const [disposableIncome, setDisposableIncome] = useState(15_000);
  const [downPayment, setDownPayment] = useState(131_250);
  const [housePrice, setHousePrice] = useState(() => 750_000 * 3.5);
  const [savings, setSavings] = useState(() => 750_000 * 3.5 * 0.05);
  const [loanAmount, setLoanAmount] = useState(() =>
    Math.round(750_000 * 3.5 * 0.95),
  );
  const [years, setYears] = useState(30);
  const [contributionRate, setContributionRate] = useState(0.9);
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE);
  const [tableMode, setTableMode] = useState<AmortizationMode>("years");

  const maxPurchasePrice = annualSalary * debtFactor;
  const minDownPayment = maxPurchasePrice * 0.05;
  const estimatedLoanAmount = Math.max(
    0,
    Math.round(maxPurchasePrice - downPayment),
  );
  const calculatedLoanAmount = Math.max(
    0,
    Math.round(housePrice - savings),
  );

  useEffect(() => {
    setHousePrice(maxPurchasePrice);
    setSavings(minDownPayment);
  }, [maxPurchasePrice, minDownPayment, disposableIncome, downPayment]);

  useEffect(() => {
    setLoanAmount(calculatedLoanAmount);
  }, [calculatedLoanAmount]);

  const result = calculateMortgage(
    loanAmount,
    years,
    interestRate,
    contributionRate,
  );

  const tableRows = getAmortizationRows(result.rows, tableMode);

  return (
    <div className="flex flex-col gap-10 text-white">
      <section className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setGuideOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={guideOpen}
        >
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Hvor meget kan jeg købe hus for?
          </h2>
          <span
            className={`shrink-0 text-white/70 transition-transform ${
              guideOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {guideOpen ? (
          <div className="flex flex-col gap-8">
            <div>
              <p className="max-w-3xl leading-7 text-white">
                Når banken vurderer, hvor meget du kan købe bolig for, kigger de
                primært på tre nøgletal
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-white">
                <li>Gældsfaktor</li>
                <li>Udbetalingen</li>
                <li>Rådighedsbeløbet</li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">
                Gældsfaktor
              </h3>
              <div className="mt-3 max-w-3xl space-y-3 leading-7 text-white">
                <p>
                  Der er en tommelfingerregel med at man kan købe hus for 4
                  gange årsløn også kaldet gældsfaktor.
                </p>
                <p>
                  Gældsfaktor (samlet gæld divideret med årsindkomst før skat).
                  Finanstilsynet anbefaler, at din samlede gæld som
                  udgangspunkt ikke overstiger en gældsfaktor på 3,5 til 4.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Under 3,5: Betragtes som en sund og ukompliceret
                    gældsfaktor
                  </li>
                  <li>3,5 – 4,0: Standardgrænsen for de fleste boligkøbere</li>
                  <li>
                    Over 4,0: Svært, Finanstilsynet stiller strengere krav til
                    din økonomi
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">
                Udbetalingen
              </h3>
              <p className="mt-3 max-w-3xl leading-7 text-white">
                Du skal ifølge loven selv kunne lægge min. 5 % af boligens pris
                i kontant udbetaling, plus omkostninger til skøde, advokat og
                tinglysning.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">
                Rådighedsbeløbet
              </h3>
              <div className="mt-3 max-w-3xl space-y-3 leading-7 text-white">
                <p>
                  Uanset hvor høj din løn er, skal dit budget vise et
                  tilstrækkeligt overskud hver måned, efter at skat, varme,
                  ejendomsskatter og faste udgifter er betalt. Standardkravene
                  i bankerne ligger typisk omkring:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>8.000 – 10.000 kr./md (Enlig)</li>
                  <li>13.000 – 16.000 kr./md (Par uden børn)</li>
                  <li>2.500 – 3.000 kr./md (Tillæg pr. barn)</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setBuyingPowerOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={buyingPowerOpen}
        >
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Du kan købe hus for:
          </h2>
          <span
            className={`shrink-0 text-white/70 transition-transform ${
              buyingPowerOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {buyingPowerOpen ? (
          <>
            <div className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
              <SliderWithInput
                id={`${baseId}-down-payment`}
                label="Udbetaling"
                value={downPayment}
                min={0}
                max={2_000_000}
                step={1_250}
                unit=" kr"
                fractionDigits={0}
                inputWidthClassName="w-28"
                onChange={setDownPayment}
              />

              <SliderWithInput
                id={`${baseId}-salary`}
                label="Årsløn samlet"
                value={annualSalary}
                min={200_000}
                max={2_000_000}
                step={10_000}
                unit=" kr"
                fractionDigits={0}
                inputWidthClassName="w-28"
                onChange={setAnnualSalary}
              />

              <SliderWithInput
                id={`${baseId}-debt-factor`}
                label="Gældsfaktor"
                value={debtFactor}
                min={1}
                max={5}
                step={0.1}
                unit=""
                fractionDigits={1}
                onChange={setDebtFactor}
              />

              <SliderWithInput
                id={`${baseId}-disposable`}
                label="Rådighedsbeløbet"
                value={disposableIncome}
                min={5_000}
                max={30_000}
                step={500}
                unit=" kr"
                fractionDigits={0}
                inputWidthClassName="w-24"
                onChange={setDisposableIncome}
              />
            </div>

            <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-white/70">Estimeret købspris</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {formatDkk(maxPurchasePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Lånebeløb</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {formatDkk(estimatedLoanAmount)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-white/70">Min. udbetaling (5%)</p>
                  <p className="mt-0.5 text-lg font-semibold text-white">
                    {formatDkk(minDownPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Rådighedsbeløb pr. måned</p>
                  <p className="mt-0.5 text-lg font-semibold text-white">
                    {formatDkk(disposableIncome)}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <SliderWithInput
            id={`${baseId}-house-price`}
            label="Boligens pris"
            value={housePrice}
            min={500_000}
            max={10_000_000}
            step={25_000}
            unit=" kr"
            fractionDigits={0}
            inputWidthClassName="w-28"
            onChange={setHousePrice}
          />

          <SliderWithInput
            id={`${baseId}-savings`}
            label="Din opsparing"
            value={savings}
            min={0}
            max={2_000_000}
            step={1_250}
            unit=" kr"
            fractionDigits={0}
            inputWidthClassName="w-28"
            onChange={setSavings}
          />
        </div>

        <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <p className="text-sm text-white/70">Beregnet lånebeløb</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {formatDkk(calculatedLoanAmount)}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Nuværende rente</p>
            <p className="mt-0.5 text-3xl font-semibold tracking-tight text-white">
              {formatPercentDa(interestRate, 2)}
            </p>
            <p className="mt-1 text-sm text-white/60">
              Debitorrente til beregningen (vejledende).
            </p>
          </div>
          <div className="w-full max-w-xs">
            <SliderWithInput
              id={`${baseId}-interest`}
              label="Justér rente"
              value={interestRate}
              min={0}
              max={10}
              step={0.05}
              unit="%"
              fractionDigits={2}
              onChange={setInterestRate}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-white">Boliglån</h2>

        <div className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h3 className="text-base font-semibold text-white">Input</h3>

          <CurrencyInput
            id={`${baseId}-principal`}
            label="Lånebeløb (hovedstol)"
            value={loanAmount}
            onChange={setLoanAmount}
          />

          <SliderWithInput
            id={`${baseId}-years`}
            label="Løbetid"
            value={years}
            min={1}
            max={30}
            step={1}
            unit=" år"
            fractionDigits={0}
            onChange={setYears}
          />

          <SliderWithInput
            id={`${baseId}-contribution`}
            label="Bidragssats pr. år"
            value={contributionRate}
            min={0}
            max={2}
            step={0.01}
            unit="%"
            fractionDigits={2}
            onChange={setContributionRate}
          />
        </div>

        <div className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h3 className="text-base font-semibold text-white">Ydelse</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryStat
              label="Ydelse pr. måned før skat"
              value={formatDkk(result.monthlyPaymentBeforeTax)}
            />
            <SummaryStat
              label="Ydelse pr. måned efter skat"
              value={formatDkk(result.monthlyPaymentAfterTax)}
            />
            <SummaryStat
              label="Månedligt afdrag"
              value={formatDkk(result.monthlyPrincipal)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h3 className="mb-2 text-base font-semibold text-white">
            Lånedetaljer
          </h3>
          <DetailRow
            label="Lånebeløb (hovedstol)"
            value={formatDkk(loanAmount)}
          />
          <DetailRow label="Løbetid" value={`${years} år`} />
          <DetailRow
            label="Terminer (antal kvartårlige betalinger)"
            value={formatNumberDa(result.terms)}
          />
          <DetailRow
            label="Debitorrente"
            value={formatPercentDa(result.debtorRate, 2)}
          />
          <DetailRow
            label="Bidragssats pr. år"
            value={formatPercentDa(result.contributionRate, 2)}
          />
          <DetailRow label="ÅOP" value={formatPercentDa(result.apr, 2)} />
          <DetailRow
            label="Rente og bidrag i lånets løbetid"
            value={formatDkk(result.totalInterestAndContribution)}
          />
          <DetailRow
            label="Samlet beløb, der skal betales i lånets løbetid"
            value={formatDkk(result.totalPaid)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">
            Amortisationstabel
          </h2>
          <div className="inline-flex rounded-md border border-zinc-700 bg-zinc-950 p-0.5">
            {(
              [
                { mode: "years", label: "År" },
                { mode: "terms", label: "Terminer" },
                { mode: "months", label: "Måneder" },
              ] as const
            ).map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTableMode(mode)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  tableMode === mode
                    ? "bg-white text-zinc-950"
                    : "text-white hover:bg-zinc-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <AmortizationTable rows={tableRows} mode={tableMode} />
      </section>
    </div>
  );
}
