// lib/financialEngine.ts
//
// Deterministic financial logic — NEVER call the LLM for these numbers.
// Every value here is plain arithmetic, so it is always exactly correct
// regardless of AI model behavior.

export interface Scheme {
  name: "Micro Finance Scheme" | "Term Loan Scheme";
  interestRate: number; // annual %
  tenureYears: number;
  moratoriumMonths: number;
  maxLoanCap: number;
}

export interface ProjectDetails {
  projectCost: number;
  loanAmount: number;
  marginCapital: number;
  scheme: Scheme | null; // null when project cost exceeds standard scheme limits
  exceedsLimits: boolean;
}

export interface EMISchedule {
  quarterlyEMI: number;
  totalQuarters: number;
  moratoriumQuarters: number;
  repaymentQuarters: number;
}

/**
 * Given the user's margin capital (their 10% contribution), derive the total
 * project cost, the loan amount, and the matching government scheme.
 */
export function calculateProjectDetails(marginCapital: number): ProjectDetails {
  const projectCost = marginCapital / 0.10; // margin capital is 10% of project cost
  const loanAmount = projectCost * 0.90;

  let scheme: Scheme | null;

  if (projectCost <= 140000) {
    scheme = {
      name: "Micro Finance Scheme",
      interestRate: 6.5,
      tenureYears: 3,
      moratoriumMonths: 3,
      maxLoanCap: 125000,
    };
  } else if (projectCost <= 5000000) {
    scheme = {
      name: "Term Loan Scheme",
      interestRate: 8,
      tenureYears: 7,
      moratoriumMonths: 6,
      maxLoanCap: 4500000,
    };
  } else {
    // Project cost exceeds scheme limits — handled gracefully by the caller
    scheme = null;
  }

  const actualLoan = scheme ? Math.min(loanAmount, scheme.maxLoanCap) : loanAmount;

  return {
    projectCost,
    loanAmount: actualLoan,
    marginCapital,
    scheme,
    exceedsLimits: scheme === null,
  };
}

/**
 * Standard reducing-balance EMI formula, applied quarterly, after the
 * scheme's moratorium period has passed.
 */
export function calculateEMISchedule(
  loanAmount: number,
  annualRate: number,
  tenureYears: number,
  moratoriumMonths: number
): EMISchedule {
  const quarterlyRate = annualRate / 4 / 100;
  const totalQuarters = tenureYears * 4;
  const moratoriumQuarters = Math.ceil(moratoriumMonths / 3);
  const repaymentQuarters = totalQuarters - moratoriumQuarters;

  const emi =
    (loanAmount * quarterlyRate * Math.pow(1 + quarterlyRate, repaymentQuarters)) /
    (Math.pow(1 + quarterlyRate, repaymentQuarters) - 1);

  return {
    quarterlyEMI: Math.round(emi),
    totalQuarters,
    moratoriumQuarters,
    repaymentQuarters,
  };
}

// ---------------------------------------------------------------------------
// Full quarter-by-quarter amortization row-set — used by the PDF export to
// show a real repayment schedule table (not just the summary totals above).
// Same reducing-balance math as calculateEMISchedule, just broken out per
// quarter. Interest-only during moratorium, standard EMI after.
// ---------------------------------------------------------------------------
export interface QuarterlyAmortizationRow {
  quarter: number;
  isMoratorium: boolean;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export function calculateQuarterlyAmortization(
  loanAmount: number,
  annualRate: number,
  tenureYears: number,
  moratoriumMonths: number
): QuarterlyAmortizationRow[] {
  const quarterlyRate = annualRate / 4 / 100;
  const totalQuarters = tenureYears * 4;
  const moratoriumQuarters = Math.ceil(moratoriumMonths / 3);
  const repaymentQuarters = totalQuarters - moratoriumQuarters;

  const moratoriumEMI = loanAmount * quarterlyRate;
  const postMoratoriumEMI =
    repaymentQuarters > 0
      ? (loanAmount * quarterlyRate * Math.pow(1 + quarterlyRate, repaymentQuarters)) /
      (Math.pow(1 + quarterlyRate, repaymentQuarters) - 1)
      : 0;

  const rows: QuarterlyAmortizationRow[] = [];
  let balance = loanAmount;

  for (let q = 1; q <= totalQuarters; q++) {
    const isMoratorium = q <= moratoriumQuarters;
    const interestPaid = balance * quarterlyRate;
    const emi = isMoratorium ? moratoriumEMI : postMoratoriumEMI;
    const principalPaid = isMoratorium ? 0 : Math.max(emi - interestPaid, 0);
    const closingBalance = isMoratorium ? balance : Math.max(balance - principalPaid, 0);

    rows.push({
      quarter: q,
      isMoratorium,
      openingBalance: Math.round(balance),
      emi: Math.round(emi),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      closingBalance: Math.round(closingBalance),
    });

    balance = closingBalance;
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Convenience wrapper — combines both functions above into one call, since
// the UI almost always needs project details + EMI schedule together.
// ---------------------------------------------------------------------------
export interface FullFinancialPlan {
  details: ProjectDetails;
  emiSchedule: EMISchedule | null; // null if exceedsLimits
}

export function calculateFullFinancialPlan(marginCapital: number): FullFinancialPlan {
  const details = calculateProjectDetails(marginCapital);

  if (details.exceedsLimits || !details.scheme) {
    return { details, emiSchedule: null };
  }

  const emiSchedule = calculateEMISchedule(
    details.loanAmount,
    details.scheme.interestRate,
    details.scheme.tenureYears,
    details.scheme.moratoriumMonths
  );

  return { details, emiSchedule };
}

// ---------------------------------------------------------------------------
// Simple cashbook P&L calculator — used on the Financial Planner page for
// monthly income/expense tracking (separate from the loan-scheme math above).
// ---------------------------------------------------------------------------
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
  const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : null;

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

// ---------------------------------------------------------------------------
// Generic monthly EMI + amortization calculator — used by the Scheme Detail
// view so a user can experiment with any scheme's principal/rate/tenure
// (bank rates and tenures vary in practice, so these are editable, unlike
// the fixed quarterly calculator above which only serves the two national
// margin-capital schemes). During moratorium months, only interest is paid
// (standard practice for these schemes); full reducing-balance EMI applies
// after. Pure deterministic math — no AI involved.
// ---------------------------------------------------------------------------
export interface AmortizationRow {
  month: number;
  isMoratorium: boolean;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface MonthlyEMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalRepayable: number;
  schedule: AmortizationRow[];
}

export function calculateMonthlyEMI(
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
  moratoriumMonths: number
): MonthlyEMIResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEMI: 0, totalInterest: 0, totalRepayable: 0, schedule: [] };
  }

  const monthlyRate = annualRatePct / 12 / 100;
  const repaymentMonths = Math.max(tenureMonths - moratoriumMonths, 0);

  const moratoriumEMI = principal * monthlyRate; // interest-only during moratorium
  const postMoratoriumEMI =
    repaymentMonths > 0 && monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
      (Math.pow(1 + monthlyRate, repaymentMonths) - 1)
      : principal / Math.max(repaymentMonths, 1);

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    const isMoratorium = m <= moratoriumMonths;
    const interestPaid = balance * monthlyRate;
    const emi = isMoratorium ? moratoriumEMI : postMoratoriumEMI;
    const principalPaid = isMoratorium ? 0 : Math.max(emi - interestPaid, 0);
    const closingBalance = isMoratorium ? balance : Math.max(balance - principalPaid, 0);

    schedule.push({
      month: m,
      isMoratorium,
      openingBalance: Math.round(balance),
      emi: Math.round(emi),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      closingBalance: Math.round(closingBalance),
    });

    totalInterest += interestPaid;
    balance = closingBalance;
  }

  return {
    monthlyEMI: Math.round(postMoratoriumEMI || moratoriumEMI),
    totalInterest: Math.round(totalInterest),
    totalRepayable: Math.round(principal + totalInterest),
    schedule,
  };
}
