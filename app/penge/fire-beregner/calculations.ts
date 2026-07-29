export type FireResult = {
  fireGoal: number;
  annualSavings: number;
  savingsRatePercent: number | null;
  realReturnPercent: number;
  yearsToFire: number | null;
  fireAge: number | null;
  chartPoints: FireChartPoint[];
  chartYearsMax: number;
};

export type FireChartPoint = {
  year: number;
  opsparing: number;
};

const WITHDRAWAL_RATE = 0.04;
const MAX_YEARS = 100;

export function calculateFire({
  annualIncome,
  annualExpenses,
  currentSavings,
  expectedReturnPercent,
  inflationPercent,
  currentAge,
}: {
  annualIncome: number;
  annualExpenses: number;
  currentSavings: number;
  expectedReturnPercent: number;
  inflationPercent: number;
  currentAge: number | null;
}): FireResult {
  const income = Math.max(0, annualIncome);
  const expenses = Math.max(0, annualExpenses);
  const savings = Math.max(0, currentSavings);
  const annualSavings = income - expenses;
  const fireGoal = expenses / WITHDRAWAL_RATE;

  const savingsRatePercent =
    income > 0 ? (annualSavings / income) * 100 : null;

  const realReturnPercent = expectedReturnPercent - inflationPercent;
  const realReturn = realReturnPercent / 100;

  const yearsToFire = estimateYearsToFire(
    savings,
    annualSavings,
    fireGoal,
    realReturn,
  );

  const fireAge =
    yearsToFire !== null && currentAge !== null
      ? currentAge + yearsToFire
      : null;

  const chartYearsMax =
    yearsToFire === null ? 0 : Math.max(0, Math.round(yearsToFire));

  const chartPoints = buildFireChartPoints(
    savings,
    annualSavings,
    realReturn,
    chartYearsMax,
  );

  return {
    fireGoal,
    annualSavings,
    savingsRatePercent,
    realReturnPercent,
    yearsToFire,
    fireAge,
    chartPoints,
    chartYearsMax,
  };
}

function buildFireChartPoints(
  currentSavings: number,
  annualSavings: number,
  realReturn: number,
  maxYear: number,
): FireChartPoint[] {
  const points: FireChartPoint[] = [
    { year: 0, opsparing: Math.max(0, currentSavings) },
  ];

  let balance = Math.max(0, currentSavings);
  for (let year = 1; year <= maxYear; year++) {
    balance = balance * (1 + realReturn) + annualSavings;
    points.push({ year, opsparing: Math.max(0, balance) });
  }

  return points;
}

function estimateYearsToFire(
  currentSavings: number,
  annualSavings: number,
  fireGoal: number,
  realReturn: number,
): number | null {
  if (!Number.isFinite(fireGoal) || fireGoal <= 0) return null;
  if (currentSavings >= fireGoal) return 0;

  // Cannot reach goal without positive savings when return is non-positive
  if (annualSavings <= 0 && realReturn <= 0) return null;

  // Closed-form solution for FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
  if (Math.abs(realReturn) > 1e-12) {
    const r = realReturn;
    const pv = currentSavings;
    const pmt = annualSavings;
    const fv = fireGoal;

    // If contributions and growth pull away from the goal, unreachable
    if (pmt <= 0 && pv * r + pmt <= 0) return null;

    const numerator = fv * r + pmt;
    const denominator = pv * r + pmt;

    if (denominator === 0 || numerator / denominator <= 0) return null;

    const years = Math.log(numerator / denominator) / Math.log(1 + r);
    if (!Number.isFinite(years) || years < 0) return null;
    if (years > MAX_YEARS) return null;
    return years;
  }

  // Zero real return: linear savings only
  if (annualSavings <= 0) return null;
  const years = (fireGoal - currentSavings) / annualSavings;
  if (!Number.isFinite(years) || years < 0 || years > MAX_YEARS) return null;
  return years;
}

export function formatDkk(value: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumberDa(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("da-DK", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercentDa(value: number, fractionDigits = 1): string {
  return `${formatNumberDa(value, fractionDigits)}%`;
}

export function formatYearsDa(value: number): string {
  return `${formatNumberDa(value, 1)} år`;
}

export function parseDaNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
