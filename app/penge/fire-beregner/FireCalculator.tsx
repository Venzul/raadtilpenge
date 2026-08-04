"use client";

import { useEffect, useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCalculatorAnalytics } from "../../lib/useCalculatorAnalytics";
import {
  calculateFire,
  formatDkk,
  formatNumberDa,
  formatPercentDa,
  formatYearsDa,
  parseDaNumber,
} from "./calculations";

const inputClassName =
  "w-full rounded-md border border-zinc-600 bg-zinc-950 px-3 py-2 text-white outline-none placeholder:text-zinc-400 focus:border-white focus:ring-1 focus:ring-white";

const readonlyInputClassName =
  "w-full cursor-default rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-white outline-none";

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
          onChange(parsed ?? 0);
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

function ReadOnlyField({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white">
        {label}
      </label>
      <div id={id} className={readonlyInputClassName} aria-live="polite">
        {value}
      </div>
    </div>
  );
}

export default function FireCalculator() {
  const baseId = useId();
  const [annualIncome, setAnnualIncome] = useState(450_000);
  const [annualExpenses, setAnnualExpenses] = useState(250_000);
  const [currentSavings, setCurrentSavings] = useState(200_000);
  const [currentAge, setCurrentAge] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [inflation, setInflation] = useState(2);

  const result = calculateFire({
    annualIncome,
    annualExpenses,
    currentSavings,
    expectedReturnPercent: expectedReturn,
    inflationPercent: inflation,
    currentAge,
  });

  useCalculatorAnalytics({
    section: "penge",
    tabKey: "fire-beregner",
    calculator: "fire-beregner",
    inputs: {
      annualIncome,
      annualExpenses,
      currentSavings,
      currentAge,
      expectedReturn,
      inflation,
    },
    outputs: {
      fireGoal: result.fireGoal,
      yearsToFire: result.yearsToFire,
      fireAge: result.fireAge,
      annualSavings: result.annualSavings,
      savingsRatePercent: result.savingsRatePercent,
    },
  });

  return (
    <div className="flex flex-col gap-10 text-white">
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6 lg:col-span-1">
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-white">Din Situation</h2>

            <CurrencyInput
              id={`${baseId}-income`}
              label="Årlig indkomst (efter skat)"
              value={annualIncome}
              onChange={setAnnualIncome}
            />

            <CurrencyInput
              id={`${baseId}-expenses`}
              label="Årlige udgifter"
              value={annualExpenses}
              onChange={setAnnualExpenses}
            />

            <CurrencyInput
              id={`${baseId}-savings`}
              label="Nuværende opsparing (investeret)"
              value={currentSavings}
              onChange={setCurrentSavings}
            />

            <SliderWithInput
              id={`${baseId}-age`}
              label="Nuværende alder"
              value={currentAge}
              min={18}
              max={80}
              step={1}
              unit=" år"
              fractionDigits={0}
              onChange={setCurrentAge}
            />
          </div>

          <div className="mt-2 flex flex-col gap-5 border-t border-zinc-700 pt-5">
            <h2 className="text-lg font-semibold text-white">Forventninger</h2>

            <SliderWithInput
              id={`${baseId}-return`}
              label="Forventet årligt afkast"
              value={expectedReturn}
              min={0}
              max={50}
              step={0.1}
              unit="%"
              fractionDigits={1}
              onChange={setExpectedReturn}
            />

            <SliderWithInput
              id={`${baseId}-inflation`}
              label="Forventet inflation"
              value={inflation}
              min={0}
              max={15}
              step={0.1}
              unit="%"
              fractionDigits={1}
              onChange={setInflation}
            />
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-white/70">FIRE Mål</p>
              <p className="mt-0.5 text-xl font-semibold tracking-tight text-white">
                {formatDkk(result.fireGoal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Est År til FIRE</p>
              <p className="mt-0.5 text-lg font-semibold tracking-tight text-white">
                {result.yearsToFire === null
                  ? "Ikke muligt"
                  : formatYearsDa(result.yearsToFire)}
              </p>
            </div>
          </div>

          <div className="h-80 w-full sm:h-96">
            {result.yearsToFire === null ? (
              <div className="flex h-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-center text-sm text-white/70">
                Kan ikke beregne en FIRE-tidslinje med de nuværende
                forudsætninger.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={result.chartPoints}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="fillFireOpsparing"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ffffff"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ffffff"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis
                    dataKey="year"
                    type="number"
                    domain={[0, Math.max(1, result.chartYearsMax)]}
                    ticks={
                      result.chartYearsMax <= 1
                        ? [0, result.chartYearsMax]
                        : undefined
                    }
                    allowDecimals={false}
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
                    domain={[
                      0,
                      (dataMax: number) =>
                        Math.max(dataMax, result.fireGoal) * 1.05,
                    ]}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatDkk(Number(value ?? 0)),
                      "Opsparing",
                    ]}
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
                  <ReferenceLine
                    y={result.fireGoal}
                    stroke="#34d399"
                    strokeDasharray="4 4"
                    label={{
                      value: "FIRE Mål",
                      fill: "#34d399",
                      fontSize: 12,
                      position: "insideTopRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="opsparing"
                    name="Opsparing"
                    stroke="#ffffff"
                    fill="url(#fillFireOpsparing)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-5 rounded-xl border border-zinc-700 bg-zinc-950 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">
          Dit FIRE Mål 4% reglen
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ReadOnlyField
            id={`${baseId}-fire-goal`}
            label="FIRE Mål"
            value={formatDkk(result.fireGoal)}
          />

          <ReadOnlyField
            id={`${baseId}-annual-savings`}
            label="Årlig Opsparing"
            value={formatDkk(result.annualSavings)}
          />

          <ReadOnlyField
            id={`${baseId}-savings-rate`}
            label="Opsparingsrate"
            value={
              result.savingsRatePercent === null
                ? "—"
                : formatPercentDa(result.savingsRatePercent, 1)
            }
          />

          <ReadOnlyField
            id={`${baseId}-real-return`}
            label="Forventet realafkast"
            value={formatPercentDa(result.realReturnPercent, 1)}
          />

          <ReadOnlyField
            id={`${baseId}-years`}
            label="Est År til FIRE"
            value={
              result.yearsToFire === null
                ? "Ikke muligt"
                : formatYearsDa(result.yearsToFire)
            }
          />

          <ReadOnlyField
            id={`${baseId}-fire-age`}
            label="Est FIRE alder"
            value={
              result.fireAge === null
                ? "—"
                : `${formatNumberDa(Math.round(result.fireAge), 0)} år`
            }
          />
        </div>
      </section>
    </div>
  );
}
