"use client";

import { useState, useMemo } from "react";
import { formatINR, calculatePnL } from "@/lib/financialEngine";
import { Trash2, Plus } from "lucide-react";

interface LineItem {
  id: string;
  label: string;
  amount: number;
}

const DEFAULT_INVESTMENT: LineItem[] = [
  { id: "1", label: "Land / Shop (if any)", amount: 30000 },
  { id: "2", label: "Equipment", amount: 45000 },
  { id: "3", label: "Initial Working Capital", amount: 30000 },
];

const DEFAULT_EXPENSES: LineItem[] = [
  { id: "1", label: "Raw Materials", amount: 55000 },
  { id: "2", label: "Transportation", amount: 8000 },
  { id: "3", label: "Labor", amount: 5000 },
];

const DEFAULT_REVENUE: LineItem[] = [{ id: "1", label: "Sales Revenue", amount: 90000 }];

export default function FinancialPlannerPage() {
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
      <p className="text-sm text-slate-500 mb-6">Calculate your investment, costs and expected returns</p>

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
            Estimated break-even period: <strong className="text-slate-700">{pnl.breakEvenMonths} months</strong>
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
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, amount } : it)));

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
