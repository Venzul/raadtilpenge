/** Tax value of interest/bidrag deduction (approx. Danish rentefradrag). */
export const TAX_DEDUCTION_RATE = 0.3311;

export type AmortizationRow = {
  term: number;
  startBalance: number;
  payment: number;
  interest: number;
  contribution: number;
  principal: number;
  endBalance: number;
};

export type AmortizationDisplayRow = {
  period: number;
  startBalance: number;
  payment: number;
  interest: number;
  contribution: number;
  principal: number;
  endBalance: number;
};

export type AmortizationMode = "years" | "terms" | "months";

/** Aggregate quarterly term rows into yearly rows (4 terms per year). */
export function aggregateByYear(
  rows: AmortizationRow[],
): AmortizationDisplayRow[] {
  const yearly: AmortizationDisplayRow[] = [];
  const yearCount = Math.ceil(rows.length / 4);

  for (let year = 1; year <= yearCount; year++) {
    const yearTerms = rows.slice((year - 1) * 4, year * 4);
    const first = yearTerms[0];
    const last = yearTerms[yearTerms.length - 1];
    if (!first || !last) continue;

    yearly.push({
      period: year,
      startBalance: first.startBalance,
      payment: yearTerms.reduce((sum, row) => sum + row.payment, 0),
      interest: yearTerms.reduce((sum, row) => sum + row.interest, 0),
      contribution: yearTerms.reduce((sum, row) => sum + row.contribution, 0),
      principal: yearTerms.reduce((sum, row) => sum + row.principal, 0),
      endBalance: last.endBalance,
    });
  }

  return yearly;
}

/** Expand quarterly terms into monthly rows (3 months per term). */
export function expandToMonths(
  rows: AmortizationRow[],
): AmortizationDisplayRow[] {
  const monthly: AmortizationDisplayRow[] = [];
  let month = 0;

  for (const term of rows) {
    const monthPayment = term.payment / 3;
    const monthInterest = term.interest / 3;
    const monthContribution = term.contribution / 3;
    const monthPrincipal = term.principal / 3;
    let balance = term.startBalance;

    for (let i = 0; i < 3; i++) {
      month += 1;
      const startBalance = balance;
      const endBalance =
        i === 2 ? term.endBalance : Math.max(0, startBalance - monthPrincipal);

      monthly.push({
        period: month,
        startBalance,
        payment: monthPayment,
        interest: monthInterest,
        contribution: monthContribution,
        principal: monthPrincipal,
        endBalance,
      });

      balance = endBalance;
    }
  }

  return monthly;
}

export function getAmortizationRows(
  rows: AmortizationRow[],
  mode: AmortizationMode,
): AmortizationDisplayRow[] {
  if (mode === "years") return aggregateByYear(rows);
  if (mode === "months") return expandToMonths(rows);
  return rows.map((row) => ({
    period: row.term,
    startBalance: row.startBalance,
    payment: row.payment,
    interest: row.interest,
    contribution: row.contribution,
    principal: row.principal,
    endBalance: row.endBalance,
  }));
}

export type MortgageResult = {
  terms: number;
  debtorRate: number;
  contributionRate: number;
  apr: number;
  /** First-term monthly figures (quarterly / 3). */
  monthlyPaymentBeforeTax: number;
  monthlyPaymentAfterTax: number;
  monthlyPrincipal: number;
  totalInterestAndContribution: number;
  totalPaid: number;
  rows: AmortizationRow[];
};

/**
 * Danish-style realkredit annuity with quarterly terms (terminer).
 * Bidrag is charged on outstanding balance each term.
 */
export function calculateMortgage(
  principal: number,
  years: number,
  annualInterestPercent: number,
  annualContributionPercent: number,
): MortgageResult {
  const safePrincipal = Math.max(0, principal);
  const terms = Math.max(0, Math.round(years * 4));
  const debtorRate = annualInterestPercent;
  const contributionRate = annualContributionPercent;
  const apr = debtorRate + contributionRate;

  if (terms === 0 || safePrincipal === 0) {
    return {
      terms,
      debtorRate,
      contributionRate,
      apr,
      monthlyPaymentBeforeTax: 0,
      monthlyPaymentAfterTax: 0,
      monthlyPrincipal: 0,
      totalInterestAndContribution: 0,
      totalPaid: 0,
      rows: [],
    };
  }

  const r = debtorRate / 100 / 4;
  const c = contributionRate / 100 / 4;

  const annuity =
    r === 0
      ? safePrincipal / terms
      : (safePrincipal * (r * Math.pow(1 + r, terms))) /
        (Math.pow(1 + r, terms) - 1);

  const rows: AmortizationRow[] = [];
  let balance = safePrincipal;
  let totalInterestAndContribution = 0;
  let totalPaid = 0;

  for (let term = 1; term <= terms; term++) {
    const startBalance = balance;
    const interest = startBalance * r;
    const contribution = startBalance * c;
    let principalPayment = annuity - interest;

    // Final term: clear remaining balance (floating-point guard)
    if (term === terms) {
      principalPayment = startBalance;
    }

    const payment = principalPayment + interest + contribution;
    const endBalance = Math.max(0, startBalance - principalPayment);

    totalInterestAndContribution += interest + contribution;
    totalPaid += payment;

    rows.push({
      term,
      startBalance,
      payment,
      interest,
      contribution,
      principal: principalPayment,
      endBalance,
    });

    balance = endBalance;
  }

  const first = rows[0]!;
  const firstDeductible = first.interest + first.contribution;
  const monthlyPaymentBeforeTax = first.payment / 3;
  const monthlyPaymentAfterTax =
    (first.payment - firstDeductible * TAX_DEDUCTION_RATE) / 3;
  const monthlyPrincipal = first.principal / 3;

  return {
    terms,
    debtorRate,
    contributionRate,
    apr,
    monthlyPaymentBeforeTax,
    monthlyPaymentAfterTax,
    monthlyPrincipal,
    totalInterestAndContribution,
    totalPaid,
    rows,
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

export function formatPercentDa(value: number, fractionDigits = 2): string {
  return `${formatNumberDa(value, fractionDigits)}%`;
}

export function parseDaNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
