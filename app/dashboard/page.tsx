"use client";

import Link from "next/link";
import { useBusiness } from "@/lib/BusinessContext";
import {
  Gauge,
  Wallet,
  TrendingUp,
  CalendarClock,
  ArrowRight,
  MessageSquareText,
  Calculator,
  Landmark,
  TrendingUp as MarketIcon,
  MapPin,
} from "lucide-react";
import { formatINR } from "@/lib/financialEngine";

export default function DashboardPage() {
  const { businessDetails, feasibilityReport, financialPlan } = useBusiness();

  const hasReport = !!feasibilityReport && !!financialPlan;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back{businessDetails ? "" : ", let's get started"} 👋
          </p>
        </div>
        <div className="flex items-center gap-4">
          {businessDetails && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              {businessDetails.location}, {businessDetails.state}
            </div>
          )}
        </div>
      </div>

      {!hasReport ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Gauge className="h-5 w-5 text-emerald-600" />}
              label="Feasibility Score"
              value={`${feasibilityReport!.feasibilityScore} / 100`}
              sub={
                feasibilityReport!.feasibilityScore >= 70
                  ? "Good Potential"
                  : feasibilityReport!.feasibilityScore >= 40
                    ? "Moderate Potential"
                    : "Needs Review"
              }
              subColor="text-emerald-600"
            />
            <StatCard
              icon={<Wallet className="h-5 w-5 text-emerald-600" />}
              label="Project Cost"
              value={formatINR(financialPlan!.details.projectCost)}
              sub="Total Required"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
              label="Loan Eligibility"
              value={formatINR(financialPlan!.details.loanAmount)}
              sub={financialPlan!.details.scheme?.name ?? "Review Required"}
            />
            <StatCard
              icon={<CalendarClock className="h-5 w-5 text-emerald-600" />}
              label="Quarterly EMI"
              value={
                financialPlan!.emiSchedule
                  ? formatINR(financialPlan!.emiSchedule.quarterlyEMI)
                  : "—"
              }
              sub={
                financialPlan!.details.scheme
                  ? `${financialPlan!.details.scheme.moratoriumMonths}mo moratorium`
                  : "N/A"
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold mb-4">Business Feasibility Overview</h2>
              <p className="text-sm text-slate-500 mb-4">
                Based on your location, capital and business type
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500 mb-2">Top Recommendation</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{businessDetails?.businessCategory}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{feasibilityReport!.executiveSummary}</p>
                  <Link
                    href="/report"
                    className="text-xs font-medium text-emerald-600 flex items-center gap-1 hover:underline"
                  >
                    View Full Report <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500 mb-2">Key Strengths</div>
                  <ul className="space-y-1.5">
                    {feasibilityReport!.swot.strengths.slice(0, 4).map((s, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickAction
                  icon={<MessageSquareText className="h-4 w-4" />}
                  title="Get Business Advice"
                  sub="Find best business for you"
                  href="/advisor"
                />
                <QuickAction
                  icon={<Calculator className="h-4 w-4" />}
                  title="Plan Finances"
                  sub="Calculate costs & profits"
                  href="/financial-planner"
                />
                <QuickAction
                  icon={<Landmark className="h-4 w-4" />}
                  title="Explore Schemes"
                  sub="Government support for you"
                  href="/schemes"
                />
                <QuickAction
                  icon={<MarketIcon className="h-4 w-4" />}
                  title="Market Insights"
                  sub="Understand your market"
                  href="/market-insights"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
      <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
        <MessageSquareText className="h-6 w-6" />
      </div>
      <h2 className="font-semibold text-lg mb-2">No business plan yet</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        Tell us about your business idea and we&apos;ll generate a feasibility report and
        financial plan tailored to your location.
      </p>
      <Link
        href="/advisor"
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Start Business Analysis <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  subColor = "text-slate-500",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className={`text-xs ${subColor}`}>{sub}</div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  sub,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
    >
      <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-slate-500">{sub}</div>
      </div>
    </Link>
  );
}
