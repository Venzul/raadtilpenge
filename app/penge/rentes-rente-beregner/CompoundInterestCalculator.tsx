"use client";

import { useEffect, useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCalculatorAnalytics } from "../../lib/useCalculatorAnalytics";
import {
  formatDkk,
  formatNumberDa,
  parseDaNumber,
  projectCompoundInterest,
  type PeriodRow,
} from "./calculations";

type TableMode = "years" | "months";

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
            className="w-20 rounded-md border border-zinc-600 bg-zinc-950 px-2 py-1.5 text-right text-sm text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
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

function ProjectionTable({
  rows,
  mode,
}: {
  rows: PeriodRow[];
  mode: TableMode;
}) {
  const periodHeader = mode === "years" ? "År" : "Måned";

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-950">
      <table className="min-w-full text-left text-sm text-white">
        <thead className="border-b border-zinc-700 bg-zinc-900 text-white">
          <tr>
            <th className="px-4 py-3 font-medium">{periodHeader}</th>
            <th className="px-4 py-3 font-medium">Startbeløb</th>
            <th className="px-4 py-3 font-medium">Indbetaling</th>
            <th className="px-4 py-3 font-medium">Afkast</th>
            <th className="px-4 py-3 font-medium">%</th>
            <th className="px-4 py-3 font-medium">Slutbeløb</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-white/70">
                Ingen perioder at vise. Vælg en tidshorisont over 0 år.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const returnPct =
                row.startBalance > 0
                  ? (row.interest / row.startBalance) * 100
                  : 0;

              return (
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
                    {formatDkk(row.deposit)}
                  </td>
                  <td className="px-4 py-2.5 text-emerald-400">
                    {formatDkk(row.interest)}
                  </td>
                  <td className="px-4 py-2.5 text-emerald-400">
                    {formatNumberDa(returnPct, 2)}%
                  </td>
                  <td className="px-4 py-2.5 font-medium text-white">
                    {formatDkk(row.endBalance)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function CompoundInterestCalculator() {
  const baseId = useId();
  const [startAmount, setStartAmount] = useState(50_000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(1_000);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [years, setYears] = useState(10);
  const [tableMode, setTableMode] = useState<TableMode>("years");

  const projection = projectCompoundInterest(
    startAmount,
    monthlyDeposit,
    annualReturn,
    years,
  );

  const tableRows =
    tableMode === "years" ? projection.yearlyRows : projection.monthlyRows;

  useCalculatorAnalytics({
    section: "penge",
    tabKey: "rentes-rente-beregner",
    calculator: "rentes-rente-beregner",
    inputs: {
      startAmount,
      monthlyDeposit,
      annualReturn,
      years,
    },
    outputs: {
      finalBalance: projection.finalBalance,
      totalDeposited: projection.totalDeposited,
      totalReturn: projection.totalReturn,
    },
  });

  return (
    <div className="flex flex-col gap-10 text-white">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Forudsætninger</h2>

          <CurrencyInput
            id={`${baseId}-start`}
            label="Start beløb"
            value={startAmount}
            onChange={setStartAmount}
          />

          <CurrencyInput
            id={`${baseId}-monthly`}
            label="Månedlig indbetaling"
            value={monthlyDeposit}
            onChange={setMonthlyDeposit}
          />

          <SliderWithInput
            id={`${baseId}-return`}
            label="Årligt afkast"
            value={annualReturn}
            min={0}
            max={50}
            step={0.1}
            unit="%"
            fractionDigits={1}
            onChange={setAnnualReturn}
          />

          <SliderWithInput
            id={`${baseId}-years`}
            label="Tidshorisont"
            value={years}
            min={1}
            max={50}
            step={1}
            unit=" år"
            fractionDigits={0}
            onChange={setYears}
          />
        </section>

        <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryStat
              label="Samlet beløb"
              value={formatDkk(projection.finalBalance)}
            />
            <SummaryStat
              label="Afkast"
              value={formatDkk(projection.totalReturn)}
            />
            <SummaryStat
              label="Samlet indbetaling"
              value={formatDkk(projection.totalDeposited)}
            />
          </div>

          <div className="h-72 w-full sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={projection.chartPoints}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillBelob" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillIndbetaling" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#ffffff", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    value === 0 ? "Start" : `${value} år`
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
                    Number(label) === 0 ? "Start" : `År ${label}`
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
                <Area
                  type="monotone"
                  dataKey="samletBelob"
                  name="Samlet beløb"
                  stroke="#ffffff"
                  fill="url(#fillBelob)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="samletIndbetaling"
                  name="Samlet indbetaling"
                  stroke="#a1a1aa"
                  fill="url(#fillIndbetaling)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="afkast"
                  name="Afkast"
                  stroke="#34d399"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Udvikling</h2>
          <div className="inline-flex rounded-md border border-zinc-700 bg-zinc-950 p-0.5">
            <button
              type="button"
              onClick={() => setTableMode("years")}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                tableMode === "years"
                  ? "bg-white text-zinc-950"
                  : "text-white hover:bg-zinc-800"
              }`}
            >
              År
            </button>
            <button
              type="button"
              onClick={() => setTableMode("months")}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                tableMode === "months"
                  ? "bg-white text-zinc-950"
                  : "text-white hover:bg-zinc-800"
              }`}
            >
              Måneder
            </button>
          </div>
        </div>

        <ProjectionTable rows={tableRows} mode={tableMode} />
      </section>
    </div>
  );
}
