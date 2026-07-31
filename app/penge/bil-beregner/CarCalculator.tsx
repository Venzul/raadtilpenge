"use client";

import { useEffect, useId, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  calculateCarAffordability,
  formatDkk,
  formatNumberDa,
  formatPercentDa,
  parseDaNumber,
} from "./calculations";

const LOAN_TERM_OPTIONS = [36, 48, 60, 72, 84] as const;

const COST_COLORS: Record<string, string> = {
  loan: "#ffffff",
  fuel: "#a1a1aa",
  insurance: "#71717a",
  maintenance: "#52525b",
  tax: "#3f3f46",
};

const inputClassName =
  "w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-white outline-none placeholder:text-zinc-400 focus:border-white focus:ring-1 focus:ring-white";

function CurrencyInput({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
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
      {hint ? <p className="text-xs text-white/50">{hint}</p> : null}
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

function SummaryStat({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-white/70">{label}</p>
      <p
        className={`mt-0.5 tracking-tight text-white ${
          emphasize ? "text-3xl font-semibold" : "text-xl font-semibold"
        }`}
      >
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

export default function CarCalculator() {
  const baseId = useId();

  const [monthlyNetIncome, setMonthlyNetIncome] = useState(45_000);
  const [affordabilityPercent, setAffordabilityPercent] = useState(12);
  const [downPayment, setDownPayment] = useState(50_000);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [loanTermMonths, setLoanTermMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(5.5);
  const [monthlyFuel, setMonthlyFuel] = useState(1_200);
  const [monthlyInsurance, setMonthlyInsurance] = useState(500);
  const [monthlyMaintenance, setMonthlyMaintenance] = useState(400);
  const [monthlyGreenTax, setMonthlyGreenTax] = useState(200);

  const result = calculateCarAffordability({
    monthlyNetIncome,
    affordabilityPercent,
    downPayment,
    tradeInValue,
    loanTermMonths,
    annualInterestPercent: interestRate,
    monthlyFuel,
    monthlyInsurance,
    monthlyMaintenance,
    monthlyGreenTax,
  });

  const chartData = result.depreciation.map((row) => ({
    year: row.year,
    bilvaerdi: Math.round(row.carValue),
    restgaeld: Math.round(row.loanBalance),
  }));

  const underwaterYears = result.depreciation.filter((row) => row.underwater);

  return (
    <div className="flex flex-col gap-10 text-white">
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Din økonomi
          </h2>

          <CurrencyInput
            id={`${baseId}-income`}
            label="Månedlig husstandsnettoindkomst"
            value={monthlyNetIncome}
            onChange={setMonthlyNetIncome}
            hint="Samlet beløb efter skat pr. måned"
          />

          <SliderWithInput
            id={`${baseId}-threshold`}
            label="Andel af netto til transport"
            value={affordabilityPercent}
            min={5}
            max={25}
            step={1}
            unit="%"
            fractionDigits={0}
            onChange={setAffordabilityPercent}
          />
          <p className="text-xs text-white/50">
            Tommelfingerregel: 10–15 % af husstandens nettoindkomst til bil.
          </p>

          <CurrencyInput
            id={`${baseId}-down`}
            label="Udbetaling"
            value={downPayment}
            onChange={setDownPayment}
          />

          <CurrencyInput
            id={`${baseId}-tradein`}
            label="Byttepris (valgfrit)"
            value={tradeInValue}
            onChange={setTradeInValue}
            hint="Værdi af nuværende bil ved bytte"
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${baseId}-term`}
              className="text-sm font-medium text-white"
            >
              Løbetid
            </label>
            <select
              id={`${baseId}-term`}
              value={loanTermMonths}
              onChange={(event) =>
                setLoanTermMonths(Number(event.target.value))
              }
              className={inputClassName}
            >
              {LOAN_TERM_OPTIONS.map((months) => (
                <option key={months} value={months}>
                  {months} måneder ({months / 12} år)
                </option>
              ))}
            </select>
            <p className="text-xs text-white/50">
              Undgå ekstremt lange lån (fx 120 måneder) – du risikerer at skylde
              mere, end bilen er værd.
            </p>
          </div>

          <SliderWithInput
            id={`${baseId}-apr`}
            label="Rente (ÅOP)"
            value={interestRate}
            min={0}
            max={15}
            step={0.1}
            unit="%"
            fractionDigits={1}
            onChange={setInterestRate}
          />
        </section>

        <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Løbende ejeromkostninger
          </h2>
          <p className="text-sm text-white/60">
            Estimerede månedlige udgifter ud over låneydelsen. Disse trækkes fra
            dit bilbudget, før vi regner baglæns til max bilpris.
          </p>

          <CurrencyInput
            id={`${baseId}-fuel`}
            label="Brændstof / energi pr. måned"
            value={monthlyFuel}
            onChange={setMonthlyFuel}
          />

          <CurrencyInput
            id={`${baseId}-insurance`}
            label="Forsikring pr. måned"
            value={monthlyInsurance}
            onChange={setMonthlyInsurance}
          />

          <CurrencyInput
            id={`${baseId}-maintenance`}
            label="Vedligehold & reparationer pr. måned"
            value={monthlyMaintenance}
            onChange={setMonthlyMaintenance}
            hint="Service, dæk, bremser og uforudsete reparationer"
          />

          <CurrencyInput
            id={`${baseId}-tax`}
            label="Grøn ejerafgift pr. måned"
            value={monthlyGreenTax}
            onChange={setMonthlyGreenTax}
            hint="Omregn halvårs-/årsafgift til månedligt beløb"
          />
        </section>
      </div>

      <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Hvad kan du købe bil for?
        </h2>

        {result.loanPaymentExceedsBudget ? (
          <div className="rounded-lg border border-amber-700/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            Dine løbende ejeromkostninger ({formatDkk(result.monthlyRunningCosts)}
            /md) overstiger dit bilbudget ({formatDkk(result.maxMonthlyBudget)}
            /md). Sænk brændstof, forsikring eller vedligehold – eller hæv
            andelen af indkomst til transport – før et billån giver mening.
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-3">
          <SummaryStat
            label="Maksimal bilpris"
            value={formatDkk(result.maxVehiclePrice)}
            emphasize
          />
          <SummaryStat
            label="Samlet månedlig ejeromkostning"
            value={formatDkk(result.totalMonthlyCost)}
          />
          <SummaryStat
            label="Max låneydelse"
            value={formatDkk(result.maxMonthlyLoanPayment)}
          />
        </div>

        <div className="grid gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailRow
            label="Bilbudget (md)"
            value={formatDkk(result.maxMonthlyBudget)}
          />
          <DetailRow
            label="Løbende omkostninger"
            value={formatDkk(result.monthlyRunningCosts)}
          />
          <DetailRow
            label="Max lånebeløb"
            value={formatDkk(result.maxLoanAmount)}
          />
          <DetailRow
            label="Udbetaling + bytte"
            value={formatDkk(downPayment + tradeInValue)}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Fordeling af månedlige omkostninger
          </h2>

          {result.costBreakdown.length === 0 ? (
            <p className="text-sm text-white/60">
              Ingen omkostninger at vise endnu.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.costBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="52%"
                      outerRadius="78%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {result.costBreakdown.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={COST_COLORS[entry.key] ?? "#71717a"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatDkk(Number(value ?? 0))}
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "#52525b",
                        backgroundColor: "#09090b",
                        color: "#ffffff",
                        fontSize: 13,
                      }}
                      labelStyle={{ color: "#ffffff" }}
                      itemStyle={{ color: "#ffffff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="space-y-2.5">
                {result.costBreakdown.map((entry) => {
                  const share =
                    result.totalMonthlyCost > 0
                      ? (entry.value / result.totalMonthlyCost) * 100
                      : 0;
                  return (
                    <li
                      key={entry.key}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="flex items-center gap-2 text-white/80">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              COST_COLORS[entry.key] ?? "#71717a",
                          }}
                        />
                        {entry.name}
                      </span>
                      <span className="tabular-nums text-white">
                        {formatDkk(entry.value)}{" "}
                        <span className="text-white/50">
                          ({formatPercentDa(share, 0)})
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Bilkategori
          </h2>
          <p className="text-2xl font-semibold tracking-tight text-white">
            {result.recommendation.title}
          </p>
          <p className="leading-7 text-white/75">
            {result.recommendation.description}
          </p>
          <p className="text-sm text-white/50">
            Anbefalingen er vejledende og baseret på din maksimale bilpris (
            {formatDkk(result.maxVehiclePrice)}). Markedspriser varierer.
          </p>
        </section>
      </div>

      <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Den usynlige omkostning: afskrivning
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
            Biler taber typisk ca. 10 % i værdi med det samme og omkring halvdelen
            over 5 år. Graferne viser estimeret bilværdi over for restgæld – hvis
            restgælden ligger over bilværdien, er du &quot;under water&quot; på
            lånet.
          </p>
        </div>

        {underwaterYears.length > 0 ? (
          <div className="rounded-lg border border-rose-800/50 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
            I {underwaterYears.length === 6 ? "alle" : underwaterYears.length}{" "}
            af de første 5 år er restgælden højere end bilens værdi. Overvej
            større udbetaling eller kortere løbetid.
          </div>
        ) : null}

        <div className="h-72 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#ffffff", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  value === 0 ? "Køb" : `${value} år`
                }
              />
              <YAxis
                tick={{ fill: "#ffffff", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat("da-DK", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
                }
                width={56}
              />
              <Tooltip
                formatter={(value) => formatDkk(Number(value ?? 0))}
                labelFormatter={(label) =>
                  Number(label) === 0 ? "Ved køb (efter drive-off)" : `År ${label}`
                }
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#52525b",
                  backgroundColor: "#09090b",
                  color: "#ffffff",
                  fontSize: 13,
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#ffffff" }}
              />
              <Legend wrapperStyle={{ color: "#ffffff" }} />
              <Line
                type="monotone"
                dataKey="bilvaerdi"
                name="Bilværdi"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ r: 3, fill: "#ffffff" }}
              />
              <Line
                type="monotone"
                dataKey="restgaeld"
                name="Restgæld"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3, fill: "#a1a1aa" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="min-w-full text-left text-sm text-white">
            <thead className="border-b border-zinc-700 bg-zinc-900 text-white">
              <tr>
                <th className="px-4 py-3 font-medium">År</th>
                <th className="px-4 py-3 font-medium">Estimeret bilværdi</th>
                <th className="px-4 py-3 font-medium">Restgæld</th>
                <th className="px-4 py-3 font-medium">Egenkapital</th>
              </tr>
            </thead>
            <tbody>
              {result.depreciation.map((row) => (
                <tr
                  key={row.year}
                  className="border-b border-zinc-800 last:border-0"
                >
                  <td className="px-4 py-2.5 font-medium text-white">
                    {row.year === 0 ? "Køb" : row.year}
                  </td>
                  <td className="px-4 py-2.5 text-white">
                    {formatDkk(row.carValue)}
                  </td>
                  <td className="px-4 py-2.5 text-white">
                    {formatDkk(row.loanBalance)}
                  </td>
                  <td
                    className={`px-4 py-2.5 font-medium ${
                      row.underwater ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatDkk(row.equity)}
                    {row.underwater ? " (under water)" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
