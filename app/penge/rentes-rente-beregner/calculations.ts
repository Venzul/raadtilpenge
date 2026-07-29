export type PeriodRow = {
  period: number;
  label: string;
  startBalance: number;
  deposit: number;
  interest: number;
  endBalance: number;
  totalDeposited: number;
};

export type Projection = {
  monthlyRows: PeriodRow[];
  yearlyRows: PeriodRow[];
  finalBalance: number;
  totalDeposited: number;
  totalReturn: number;
  chartPoints: {
    year: number;
    samletBelob: number;
    samletIndbetaling: number;
    afkast: number;
  }[];
};

export function projectCompoundInterest(
  startAmount: number,
  monthlyDeposit: number,
  annualReturnPercent: number,
  years: number,
): Projection {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = annualReturnPercent / 100 / 12;

  const monthlyRows: PeriodRow[] = [];
  let balance = Math.max(0, startAmount);
  let totalDeposited = Math.max(0, startAmount);

  for (let month = 1; month <= months; month++) {
    const startBalance = balance;
    const interest = startBalance * monthlyRate;
    balance = startBalance + interest + monthlyDeposit;
    totalDeposited += monthlyDeposit;

    monthlyRows.push({
      period: month,
      label: `Måned ${month}`,
      startBalance,
      deposit: monthlyDeposit,
      interest,
      endBalance: balance,
      totalDeposited,
    });
  }

  const yearlyRows: PeriodRow[] = [];
  for (let year = 1; year <= Math.floor(months / 12); year++) {
    const yearMonths = monthlyRows.slice((year - 1) * 12, year * 12);
    const first = yearMonths[0];
    const last = yearMonths[yearMonths.length - 1];
    if (!first || !last) continue;

    yearlyRows.push({
      period: year,
      label: `År ${year}`,
      startBalance: first.startBalance,
      deposit: yearMonths.reduce((sum, row) => sum + row.deposit, 0),
      interest: yearMonths.reduce((sum, row) => sum + row.interest, 0),
      endBalance: last.endBalance,
      totalDeposited: last.totalDeposited,
    });
  }

  const chartPoints = [
    {
      year: 0,
      samletBelob: Math.max(0, startAmount),
      samletIndbetaling: Math.max(0, startAmount),
      afkast: 0,
    },
    ...yearlyRows.map((row) => ({
      year: row.period,
      samletBelob: row.endBalance,
      samletIndbetaling: row.totalDeposited,
      afkast: row.endBalance - row.totalDeposited,
    })),
  ];

  // If horizon is not a whole number of years, include the final month as last point
  if (months > 0 && months % 12 !== 0) {
    const last = monthlyRows[monthlyRows.length - 1];
    chartPoints.push({
      year: years,
      samletBelob: last.endBalance,
      samletIndbetaling: last.totalDeposited,
      afkast: last.endBalance - last.totalDeposited,
    });
  }

  const finalBalance = months === 0 ? Math.max(0, startAmount) : balance;
  const deposited =
    months === 0 ? Math.max(0, startAmount) : totalDeposited;

  return {
    monthlyRows,
    yearlyRows,
    finalBalance,
    totalDeposited: deposited,
    totalReturn: finalBalance - deposited,
    chartPoints,
  };
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

export function parseDaNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
