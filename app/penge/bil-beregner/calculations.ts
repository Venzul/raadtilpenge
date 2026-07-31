export type CarAffordabilityInput = {
  monthlyNetIncome: number;
  affordabilityPercent: number;
  downPayment: number;
  tradeInValue: number;
  loanTermMonths: number;
  annualInterestPercent: number;
  monthlyFuel: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyGreenTax: number;
};

export type CostBreakdownItem = {
  key: string;
  name: string;
  value: number;
};

export type DepreciationYear = {
  year: number;
  carValue: number;
  loanBalance: number;
  equity: number;
  underwater: boolean;
};

export type CarCategoryRecommendation = {
  title: string;
  description: string;
};

export type CarAffordabilityResult = {
  maxMonthlyBudget: number;
  monthlyRunningCosts: number;
  maxMonthlyLoanPayment: number;
  maxLoanAmount: number;
  maxVehiclePrice: number;
  totalMonthlyCost: number;
  costBreakdown: CostBreakdownItem[];
  depreciation: DepreciationYear[];
  recommendation: CarCategoryRecommendation;
  loanPaymentExceedsBudget: boolean;
};

/**
 * Reverse amortization: max principal given a fixed monthly payment.
 * P = M * (1 - (1+r)^(-n)) / r
 */
export function maxLoanFromPayment(
  monthlyPayment: number,
  annualInterestPercent: number,
  loanTermMonths: number,
): number {
  const payment = Math.max(0, monthlyPayment);
  const n = Math.max(0, Math.round(loanTermMonths));
  if (payment <= 0 || n <= 0) return 0;

  const r = annualInterestPercent / 100 / 12;
  if (r === 0) return payment * n;

  return (payment * (1 - Math.pow(1 + r, -n))) / r;
}

/** Remaining loan balance after `monthsElapsed` of annuity payments. */
export function remainingLoanBalance(
  principal: number,
  annualInterestPercent: number,
  loanTermMonths: number,
  monthsElapsed: number,
): number {
  const safePrincipal = Math.max(0, principal);
  const n = Math.max(0, Math.round(loanTermMonths));
  const k = Math.min(Math.max(0, Math.round(monthsElapsed)), n);
  if (safePrincipal <= 0 || n <= 0) return 0;
  if (k >= n) return 0;

  const r = annualInterestPercent / 100 / 12;
  if (r === 0) {
    return Math.max(0, safePrincipal * (1 - k / n));
  }

  const factor = Math.pow(1 + r, n);
  const paidFactor = Math.pow(1 + r, k);
  return (
    (safePrincipal * (factor - paidFactor)) / (factor - 1)
  );
}

/**
 * Depreciation model from the brief:
 * ~10% immediate drop, then steady decline to ~50% total loss over 5 years.
 */
export function estimateCarValue(purchasePrice: number, year: number): number {
  const price = Math.max(0, purchasePrice);
  if (price === 0) return 0;
  if (year <= 0) return price * 0.9;
  const clamped = Math.min(year, 5);
  // Year 0 after drive-off: 90% → year 5: 50%
  return price * (0.9 - (0.4 / 5) * clamped);
}

export function recommendCarCategory(
  maxVehiclePrice: number,
): CarCategoryRecommendation {
  if (maxVehiclePrice < 50_000) {
    return {
      title: "Brugt mikrobil",
      description:
        "Ved dette budget bør du kigge efter en ældre brugt mikrobil – fx en 2012–2016 VW Up, Skoda Citigo eller Toyota Aygo. Prioritér lav kilometerstand og dokumenteret service.",
    };
  }
  if (maxVehiclePrice < 100_000) {
    return {
      title: "Brugt lille bil",
      description:
        "Du kan typisk finde en solid brugt lille bil – fx VW Polo, Opel Corsa eller Hyundai i20. Hold dig til bilens alder og brændstoføkonomi, så de løbende omkostninger ikke æder budgettet.",
    };
  }
  if (maxVehiclePrice < 175_000) {
    return {
      title: "Brugt kompaktbil",
      description:
        "I dette leje kan du kigge efter en nyere brugt kompaktbil – fx Peugeot 208, VW Golf eller Toyota Yaris. Undgå dyre ekstra-udstyrspakker, der ikke forbedrer ejerøkonomien.",
    };
  }
  if (maxVehiclePrice < 275_000) {
    return {
      title: "Nyere brugt eller ny lille bil",
      description:
        "Du kan overveje en ny eller næsten ny lille bil – fx Peugeot 208, Renault Clio eller Hyundai i20. Sammenlign totalomkostning (forsikring, afgift og brændstof) før du vælger.",
    };
  }
  if (maxVehiclePrice < 400_000) {
    return {
      title: "Ny kompakt / mellemklasse",
      description:
        "Budgettet rækker typisk til en ny kompakt eller mindre mellemklassebil. Husk at afskrivning er den største skjulte omkostning – overvej om en 2–3 år gammel bil giver mere bil for pengene.",
    };
  }
  return {
    title: "Ny mellemklasse / SUV",
    description:
      "Du er i et prisleje, hvor nye mellemklassebiler og mindre SUV’er er mulige. Dobbelttjek at bilens samlede månedlige ejeromkostning stadig ligger inden for 10–15 % af din nettoindkomst.",
  };
}

export function calculateCarAffordability(
  input: CarAffordabilityInput,
): CarAffordabilityResult {
  const monthlyNetIncome = Math.max(0, input.monthlyNetIncome);
  const affordabilityPercent = Math.max(0, input.affordabilityPercent);
  const downPayment = Math.max(0, input.downPayment);
  const tradeInValue = Math.max(0, input.tradeInValue);
  const loanTermMonths = Math.max(0, Math.round(input.loanTermMonths));
  const annualInterestPercent = Math.max(0, input.annualInterestPercent);
  const monthlyFuel = Math.max(0, input.monthlyFuel);
  const monthlyInsurance = Math.max(0, input.monthlyInsurance);
  const monthlyMaintenance = Math.max(0, input.monthlyMaintenance);
  const monthlyGreenTax = Math.max(0, input.monthlyGreenTax);

  const maxMonthlyBudget =
    monthlyNetIncome * (affordabilityPercent / 100);

  const monthlyRunningCosts =
    monthlyFuel + monthlyInsurance + monthlyMaintenance + monthlyGreenTax;

  const maxMonthlyLoanPayment = maxMonthlyBudget - monthlyRunningCosts;
  const loanPaymentExceedsBudget = maxMonthlyLoanPayment < 0;

  const effectiveLoanPayment = Math.max(0, maxMonthlyLoanPayment);
  const maxLoanAmount = maxLoanFromPayment(
    effectiveLoanPayment,
    annualInterestPercent,
    loanTermMonths,
  );

  const maxVehiclePrice = maxLoanAmount + downPayment + tradeInValue;

  const actualLoanPayment = effectiveLoanPayment;
  const totalMonthlyCost =
    actualLoanPayment + monthlyRunningCosts;

  const costBreakdown: CostBreakdownItem[] = [
    { key: "loan", name: "Låneydelse", value: actualLoanPayment },
    { key: "fuel", name: "Brændstof/energi", value: monthlyFuel },
    { key: "insurance", name: "Forsikring", value: monthlyInsurance },
    { key: "maintenance", name: "Vedligehold", value: monthlyMaintenance },
    { key: "tax", name: "Grøn ejerafgift", value: monthlyGreenTax },
  ].filter((item) => item.value > 0);

  const depreciation: DepreciationYear[] = [];
  for (let year = 0; year <= 5; year++) {
    const carValue = estimateCarValue(maxVehiclePrice, year);
    const loanBalance = remainingLoanBalance(
      maxLoanAmount,
      annualInterestPercent,
      loanTermMonths,
      year * 12,
    );
    const equity = carValue - loanBalance;
    depreciation.push({
      year,
      carValue,
      loanBalance,
      equity,
      underwater: equity < 0,
    });
  }

  return {
    maxMonthlyBudget,
    monthlyRunningCosts,
    maxMonthlyLoanPayment: effectiveLoanPayment,
    maxLoanAmount,
    maxVehiclePrice,
    totalMonthlyCost,
    costBreakdown,
    depreciation,
    recommendation: recommendCarCategory(maxVehiclePrice),
    loanPaymentExceedsBudget,
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

export function formatPercentDa(value: number, fractionDigits = 0): string {
  return `${formatNumberDa(value, fractionDigits)}%`;
}

export function parseDaNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
