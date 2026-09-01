// Pure, deterministic financial logic — NO AI involved here.
// This guarantees every number shown to judges/users is always exactly correct.

export interface SchemeResult {
  projectCost: number;
  maxLoan: number;
  marginRequired: number;
  schemeName: "Micro Finance Scheme" | "Term Loan Scheme" | "Out of Range";
  interestRate: number; // annual %
  tenureYears: number;
  moratoriumMonths: number;
  emi: number; // monthly, post-moratorium
  outOfRange: boolean;
}

export function calculateFinancialPlan(marginCapital: number): SchemeResult {
  const projectCost = marginCapital / 0.10;
  const maxLoan = projectCost * 0.90;

  let schemeName: SchemeResult["schemeName"];
  let interestRate = 0;
  let tenureYears = 0;
  let moratoriumMonths = 0;
  let outOfRange = false;

  if (projectCost <= 140000) {
    schemeName = "Micro Finance Scheme";
    interestRate = 6.5;
    tenureYears = 3;
    moratoriumMonths = 3;
  } else if (projectCost <= 5000000) {
    schemeName = "Term Loan Scheme";
    interestRate = 8.0;
    tenureYears = 7;
    moratoriumMonths = 6;
  } else {
    schemeName = "Out of Range";
    outOfRange = true;
  }

  let emi = 0;
  if (!outOfRange) {
    const monthlyRate = interestRate / 12 / 100;
    const n = tenureYears * 12 - moratoriumMonths;
    emi =
      (maxLoan * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }

  return {
    projectCost,
    maxLoan,
    marginRequired: marginCapital,
    schemeName,
    interestRate,
    tenureYears,
    moratoriumMonths,
    emi: Math.round(emi),
    outOfRange,
  };
}

// Simple cashbook P&L calculator — used in the "Financial Planner" screen
export interface PnLInput {
  revenueItems: { label: string; amount: number }[];
  expenseItems: { label: string; amount: number }[];
  oneTimeInvestmentItems: { label: string; amount: number }[];
}

export function calculatePnL(input: PnLInput) {
  const totalMonthlyRevenue = input.revenueItems.reduce((s, i) => s + i.amount, 0);
  const totalMonthlyExpense = input.expenseItems.reduce((s, i) => s + i.amount, 0);
  const totalInvestment = input.oneTimeInvestmentItems.reduce((s, i) => s + i.amount, 0);
  const monthlyProfit = totalMonthlyRevenue - totalMonthlyExpense;
  const annualProfit = monthlyProfit * 12;
  const breakEvenMonths =
    monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : null;

  return {
    totalMonthlyRevenue,
    totalMonthlyExpense,
    totalInvestment,
    monthlyProfit,
    annualProfit,
    breakEvenMonths,
  };
}

export function formatINR(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}
