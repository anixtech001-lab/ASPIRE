"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useBusiness } from "@/lib/BusinessContext";
import {
  calculateFullFinancialPlan,
  calculatePnL,
  formatINR,
} from "@/lib/financialEngine";
import { Trash2, Plus, Info } from "lucide-react";

interface LineItem {
  id: string;
  label: string;
  amount: number;
}

const DEFAULT_INVESTMENT: LineItem[] = [
  { id: "1", label: "Land / Shop (if any)", amount: 0 },
  { id: "2", label: "Equipment", amount: 0 },
  { id: "3", label: "Initial Working Capital", amount: 0 },
];

const DEFAULT_EXPENSES: LineItem[] = [
  { id: "1", label: "Raw Materials", amount: 0 },
  { id: "2", label: "Transportation", amount: 0 },
  { id: "3", label: "Labor", amount: 0 },
];

const DEFAULT_REVENUE: LineItem[] = [{ id: "1", label: "Sales Revenue", amount: 0 }];

// Investment/expense/revenue amounts are real-world costs — negative numbers
// aren't meaningful here (you can't have "-₹53 transportation cost") and
// previously produced nonsense results downstream, e.g. a negative expense
// inflating profit, or a negative investment turning break-even into
// "-1 months". Every amount is clamped to zero at the point of entry so bad
// input can never reach the P&L math.
function clampToNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export default function FinancialPlannerPage() {
  const { businessDetails, hydrated } = useBusiness();

  const [marginCapitalInput, setMarginCapitalInput] = useState("");
  const userEditedRef = useRef(false);

  // Auto-fill margin capital from the Business Advisor flow once the saved
  // session has loaded — context rehydrates from localStorage asynchronously
  // on mount, so a plain useState initializer would often run before that
  // data is ready and show blank. This effect fills in the value the moment
  // it becomes available, but backs off if the user has already typed
  // something themselves.
  useEffect(() => {
    if (hydrated && businessDetails?.marginCapital && !userEditedRef.current) {
      setMarginCapitalInput(String(businessDetails.marginCapital));
    }
  }, [hydrated, businessDetails]);

  const handleMarginCapitalChange = (value: string) => {
    userEditedRef.current = true;
    setMarginCapitalInput(value);
  };

  const marginCapital = clampToNonNegative(Number(marginCapitalInput));

  const plan = useMemo(
    () => (marginCapital > 0 ? calculateFullFinancialPlan(marginCapital) : null),
    [marginCapital]
  );

  const [investment, setInvestment] = useState(DEFAULT_INVESTMENT);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [revenue, setRevenue] = useState(DEFAULT_REVENUE);

  const pnl = useMemo(
    () =>
      calculatePnL({
        revenueItems: revenue,
        expenseItems: expenses,
        oneTimeInvestmentItems: investment,
      }),
    [investment, expenses, revenue]
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Financial Planner</h1>
      <p className="text-sm text-slate-500 mb-6">
        Calculate indicative financing, scheme match, and monthly cash flow — final sanction
        depends on your lender&apos;s assessment
      </p>

      {/* ---- Loan / Scheme Calculator ---- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Scheme & Loan Calculator</h2>

        <div className="max-w-xs mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Available Margin Capital (₹)
          </label>
          <input
            type="number"
            min={0}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            placeholder="e.g. 100000"
            value={marginCapitalInput}
            onChange={(e) => handleMarginCapitalChange(e.target.value)}
          />
          {businessDetails?.marginCapital && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="h-3 w-3" /> Pre-filled from your Business Advisor plan
            </p>
          )}
        </div>

        {plan && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <MiniStat label="Project Cost" value={formatINR(plan.details.projectCost)} />
              <MiniStat label="Indicative Financing" value={formatINR(plan.details.loanAmount)} />
              <MiniStat
                label="Scheme"
                value={plan.details.scheme?.name ?? "Exceeds Limits"}
              />
              <MiniStat
                label="Interest Rate"
                value={plan.details.scheme ? `${plan.details.scheme.interestRate}% p.a.` : "—"}
              />
            </div>

            {plan.details.exceedsLimits ? (
              <div className="bg-amber-50 text-amber-700 text-sm rounded-lg p-4">
                Your project cost of {formatINR(plan.details.projectCost)} exceeds the ₹50 lakh
                Term Loan Scheme ceiling. This application needs manual review by a State
                Channelizing Agency (SCA) — it doesn&apos;t fit either standard scheme
                automatically.
              </div>
            ) : (
              <>
                <div className="bg-emerald-50 text-emerald-800 text-sm rounded-lg p-4 mb-2">
                  Your project cost of <strong>{formatINR(plan.details.projectCost)}</strong> falls
                  under the <strong>{plan.details.scheme!.name}</strong> because it is{" "}
                  {plan.details.scheme!.name === "Micro Finance Scheme"
                    ? "up to ₹1.40 lakh"
                    : "between ₹1.40 lakh and ₹50 lakh"}
                  .
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  This is an <strong>indicative</strong> structure based on the scheme assumptions
                  above — not a loan approval. Final sanction is subject to applicable scheme
                  rules and your lending/channelizing agency&apos;s own assessment.
                </p>
              </>
            )}

            {plan.emiSchedule && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Repayment Timeline</h3>
                <p className="text-sm text-slate-600 mb-3">
                  You have a <strong>{plan.details.scheme!.moratoriumMonths}-month grace period</strong>{" "}
                  (moratorium) before payments start. After that, you&apos;ll pay{" "}
                  <strong>{formatINR(plan.emiSchedule.quarterlyEMI)} every quarter</strong> for{" "}
                  {plan.details.scheme!.tenureYears} years.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat label="Moratorium (no payment)" value={`${plan.emiSchedule.moratoriumQuarters} qtr`} />
                  <MiniStat label="Repayment period" value={`${plan.emiSchedule.repaymentQuarters} qtr`} />
                  <MiniStat label="Quarterly EMI" value={formatINR(plan.emiSchedule.quarterlyEMI)} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ---- Cashbook / P&L ---- */}
      {plan && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm text-blue-800 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Your calculated Project Cost is <strong>{formatINR(plan.details.projectCost)}</strong> — use
            this as your target when breaking down the investment items below. We don&apos;t
            auto-fill individual line items (land, equipment, etc.) since we don&apos;t have
            real data on your specific costs — only you know those numbers accurately.
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LineItemCard
          title="Investment Calculator"
          items={investment}
          setItems={setInvestment}
          total={pnl.totalInvestment}
          totalLabel="Total Investment"
        />
        <LineItemCard
          title="Monthly Expenses"
          items={expenses}
          setItems={setExpenses}
          total={pnl.totalMonthlyExpense}
          totalLabel="Total Monthly Cost"
        />
        <LineItemCard
          title="Revenue"
          items={revenue}
          setItems={setRevenue}
          total={pnl.totalMonthlyRevenue}
          totalLabel="Total Monthly Revenue"
        />
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-4">Revenue & Profit Estimate</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Monthly Revenue" value={formatINR(pnl.totalMonthlyRevenue)} />
          <Stat label="Monthly Cost" value={formatINR(pnl.totalMonthlyExpense)} />
          <Stat label="Monthly Profit (Est.)" value={formatINR(pnl.monthlyProfit)} highlight />
          <Stat label="Annual Profit (Est.)" value={formatINR(pnl.annualProfit)} highlight />
        </div>
        {pnl.breakEvenMonths !== null && (
          <p className="text-sm text-slate-500 mt-4">
            Estimated break-even period:{" "}
            <strong className="text-slate-700">{pnl.breakEvenMonths} months</strong>
          </p>
        )}
      </div>
    </div>
  );
}

function LineItemCard({
  title,
  items,
  setItems,
  total,
  totalLabel,
}: {
  title: string;
  items: LineItem[];
  setItems: (fn: (prev: LineItem[]) => LineItem[]) => void;
  total: number;
  totalLabel: string;
}) {
  const updateAmount = (id: string, amount: number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, amount: clampToNonNegative(amount) } : it)));

  const updateLabel = (id: string, label: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, label } : it)));

  const remove = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  const add = () =>
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label: "New item", amount: 0 }]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>
      <div className="space-y-2.5 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1.5 outline-none focus:border-emerald-500"
              value={item.label}
              onChange={(e) => updateLabel(item.id, e.target.value)}
            />
            <input
              type="number"
              min={0}
              className="w-24 text-sm border border-slate-200 rounded-md px-2 py-1.5 outline-none focus:border-emerald-500"
              value={item.amount}
              onChange={(e) => updateAmount(item.id, Number(e.target.value))}
            />
            <button onClick={() => remove(item.id)} className="text-slate-300 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="flex items-center gap-1 text-xs text-emerald-600 font-medium mb-4 hover:underline"
      >
        <Plus className="h-3 w-3" /> Add item
      </button>
      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
        <span className="text-sm text-slate-500">{totalLabel}</span>
        <span className="font-semibold">{formatINR(total)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-emerald-50" : "bg-slate-50"}`}>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${highlight ? "text-emerald-700" : ""}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
