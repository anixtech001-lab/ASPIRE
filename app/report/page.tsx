"use client";

import { useState } from "react";
import Link from "next/link";
import { useBusiness } from "@/lib/BusinessContext";
import { formatINR } from "@/lib/financialEngine";
import { Download, ArrowLeft } from "lucide-react";

const TABS = ["Overview", "Market Analysis", "Financial Plan", "Schemes", "Risks & Challenges", "Recommendations"];

export default function ReportPage() {
  const { businessDetails, feasibilityReport, financialPlan } = useBusiness();
  const [tab, setTab] = useState(0);

  if (!feasibilityReport || !financialPlan || !businessDetails) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <p className="text-slate-500 mb-4">No report generated yet.</p>
        <Link href="/advisor" className="text-emerald-600 font-medium text-sm hover:underline">
          Start a business analysis →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <button className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
          <Download className="h-4 w-4" /> Download Report
        </button>
      </div>
      <h1 className="text-xl font-semibold mt-3">AI Business Advisory Report</h1>
      <p className="text-sm text-slate-500 mb-6">
        Generated for {businessDetails.location}, {businessDetails.state} · {businessDetails.businessCategory}
      </p>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`pb-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === i ? "border-emerald-600 text-emerald-700 font-medium" : "border-transparent text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === 0 && <OverviewTab report={feasibilityReport} />}
          {tab === 1 && <MarketTab report={feasibilityReport} />}
          {tab === 2 && <FinancialTab plan={financialPlan} />}
          {tab === 3 && <SchemesTab />}
          {tab === 4 && <RisksTab report={feasibilityReport} />}
          {tab === 5 && <RecommendationsTab report={feasibilityReport} />}
        </div>

        {/* At a Glance sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
          <h3 className="font-semibold text-sm mb-4">At a Glance</h3>
          <GlanceRow label="Business Type" value={businessDetails.businessCategory} />
          <GlanceRow label="Location" value={`${businessDetails.location}, ${businessDetails.state}`} />
          <GlanceRow label="Initial Investment" value={formatINR(financialPlan.marginRequired)} />
          <GlanceRow label="Monthly Operating Cost" value={formatINR(financialPlan.emi * 0.6)} />
          <GlanceRow label="Expected Monthly Profit" value={formatINR(financialPlan.emi * 1.4)} />
          <GlanceRow label="Break-even Period" value="8 - 10 Months" />
          <GlanceRow label="Risk Level" value={feasibilityReport.riskLevel} last />
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ report }: { report: NonNullable<ReturnType<typeof useBusiness>["feasibilityReport"]> }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-3">Executive Summary</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">{report.executiveSummary}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MiniStat label="Feasibility Score" value={`${report.feasibilityScore}/100`} />
        <MiniStat label="Market Demand" value={report.marketDemand} />
        <MiniStat label="Competitor Density" value={report.competitorDensity.level} />
        <MiniStat label="Risk Level" value={report.riskLevel} />
      </div>

      <h4 className="font-medium text-sm mb-2">Key Strengths</h4>
      <ul className="space-y-1.5">
        {report.keyStrengths.map((s, i) => (
          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MarketTab({ report }: { report: NonNullable<ReturnType<typeof useBusiness>["feasibilityReport"]> }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">Market Reach</h3>
        <p className="text-sm text-slate-600 mb-3">
          Estimated <strong>{report.marketReach.estimatedPopulation}</strong> consumer base within{" "}
          <strong>{report.marketReach.radiusKm} km</strong> radius.
        </p>
        <div className="flex flex-wrap gap-2">
          {report.marketReach.distributionChannels.map((c, i) => (
            <span key={i} className="text-xs bg-slate-100 rounded-full px-3 py-1">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">Opportunity Analysis</h3>
        <ul className="space-y-1.5">
          {report.opportunityAnalysis.map((o, i) => (
            <li key={i} className="text-sm text-slate-600">• {o}</li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">SWOT Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <SwotBox title="Strengths" items={report.swot.strengths} color="emerald" />
          <SwotBox title="Weaknesses" items={report.swot.weaknesses} color="red" />
          <SwotBox title="Opportunities" items={report.swot.opportunities} color="blue" />
          <SwotBox title="Threats" items={report.swot.threats} color="amber" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-2">Pricing Strategy</h3>
        <p className="text-sm font-medium text-emerald-700 mb-1">
          {report.pricingStrategy.suggestedPriceRange}
        </p>
        <p className="text-sm text-slate-600">{report.pricingStrategy.reasoning}</p>
      </div>
    </div>
  );
}

function FinancialTab({ plan }: { plan: NonNullable<ReturnType<typeof useBusiness>["financialPlan"]> }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-4">Financial Structuring Plan</h3>
      {plan.outOfRange ? (
        <p className="text-sm text-amber-600">
          Project cost of {formatINR(plan.projectCost)} exceeds the ₹50 lakh Term Loan Scheme
          ceiling — this application needs manual review by a Channel Partner.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MiniStat label="Project Cost" value={formatINR(plan.projectCost)} />
          <MiniStat label="Loan Eligibility" value={formatINR(plan.maxLoan)} />
          <MiniStat label="Scheme" value={plan.schemeName} />
          <MiniStat label="Interest Rate" value={`${plan.interestRate}% p.a.`} />
          <MiniStat label="Tenure" value={`${plan.tenureYears} years`} />
          <MiniStat label="Moratorium" value={`${plan.moratoriumMonths} months`} />
          <MiniStat label="Monthly EMI" value={formatINR(plan.emi)} />
        </div>
      )}
    </div>
  );
}

function SchemesTab() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-sm text-slate-500 mb-3">
        See the full list of matched government schemes on the{" "}
        <Link href="/schemes" className="text-emerald-600 font-medium hover:underline">
          Schemes & Support
        </Link>{" "}
        page.
      </p>
    </div>
  );
}

function RisksTab({ report }: { report: NonNullable<ReturnType<typeof useBusiness>["feasibilityReport"]> }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-3">Threats & Challenges</h3>
      <ul className="space-y-1.5">
        {report.swot.threats.map((t, i) => (
          <li key={i} className="text-sm text-slate-600">• {t}</li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationsTab({ report }: { report: NonNullable<ReturnType<typeof useBusiness>["feasibilityReport"]> }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-3">Recommendations</h3>
      <ul className="space-y-2">
        {report.recommendations.map((r, i) => (
          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">→</span> {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GlanceRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`py-2.5 ${!last ? "border-b border-slate-100" : ""}`}>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
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

function SwotBox({ title, items, color }: { title: string; items: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-lg p-3 ${colorMap[color]}`}>
      <div className="text-xs font-semibold mb-1.5">{title}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-xs">• {it}</li>
        ))}
      </ul>
    </div>
  );
}
