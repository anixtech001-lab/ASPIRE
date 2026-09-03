"use client";

import { useState } from "react";
import Link from "next/link";
import { useBusiness } from "@/lib/BusinessContext";
import { QuickQuestionId } from "@/lib/ai";
import { formatINR } from "@/lib/financialEngine";
import { Download, ArrowLeft, Info } from "lucide-react";

const TABS = [
  "Overview",
  "Market Reach & Opportunity",
  "SWOT & Risks",
  "Pricing & Competitors",
  "Financial Plan",
];

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
      <p className="text-sm text-slate-500 mb-3">
        Generated for {businessDetails.location}, {businessDetails.state} · {businessDetails.businessCategory}
      </p>
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1.5 mb-6">
        <Info className="h-3.5 w-3.5 shrink-0" />
        AI-Estimated Analysis — based on regional demographic &amp; economic patterns, not live field survey data
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`pb-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === i ? "border-emerald-600 text-emerald-700 font-medium" : "border-transparent text-slate-500"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === 0 && <OverviewTab report={feasibilityReport} />}
          {tab === 1 && <MarketOpportunityTab report={feasibilityReport} />}
          {tab === 2 && <SwotRisksTab report={feasibilityReport} />}
          {tab === 3 && <PricingCompetitorsTab report={feasibilityReport} />}
          {tab === 4 && <FinancialTab plan={financialPlan} />}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
            <h3 className="font-semibold text-sm mb-4">At a Glance</h3>
            <GlanceRow label="Business Type" value={businessDetails.businessCategory} />
            <GlanceRow label="Location" value={`${businessDetails.location}, ${businessDetails.state}`} />
            <GlanceRow label="Project Cost" value={formatINR(financialPlan.details.projectCost)} />
            <GlanceRow label="Loan Amount" value={formatINR(financialPlan.details.loanAmount)} />
            <GlanceRow
              label="Scheme"
              value={financialPlan.details.scheme?.name ?? "Exceeds standard limits"}
            />
            <GlanceRow label="Risk Level" value={feasibilityReport.riskLevel} last />
          </div>

          <QuickAssistant businessDetails={businessDetails} />
        </div>
      </div>
    </div>
  );
}

function QuickAssistant({ businessDetails }: { businessDetails: NonNullable<ReturnType<typeof useBusiness>["businessDetails"]> }) {
  const [activeQuestion, setActiveQuestion] = useState<QuickQuestionId | null>(null);
  const [answers, setAnswers] = useState<Partial<Record<QuickQuestionId, string>>>({});
  const [loadingId, setLoadingId] = useState<QuickQuestionId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buttons: { id: QuickQuestionId; label: string }[] = [
    { id: "raw_material", label: "💰 Saste raw material kahan milega?" },
    { id: "emi_default", label: "⚠️ EMI na de paun toh kya hoga?" },
    { id: "licenses", label: "📋 Kaun se license chahiye?" },
  ];

  const handleClick = async (id: QuickQuestionId) => {
    setActiveQuestion(id);
    setError(null);

    if (answers[id]) return; // already fetched — just show it

    setLoadingId(id);
    try {
      const res = await fetch("/api/quick-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: id,
          businessCategory: businessDetails.businessCategory,
          location: businessDetails.location,
          state: businessDetails.state,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setAnswers((prev) => ({ ...prev, [id]: data.answer }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't get an answer. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-sm mb-1">Quick Questions</h3>
      <p className="text-xs text-slate-400 mb-4">Common questions, answered for your business</p>

      <div className="space-y-2">
        {buttons.map((b) => (
          <button
            key={b.id}
            onClick={() => handleClick(b.id)}
            className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-colors ${activeQuestion === b.id
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {loadingId && (
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
          <span className="h-3 w-3 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
          Thinking…
        </p>
      )}

      {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

      {activeQuestion && answers[activeQuestion] && !loadingId && (
        <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">
          {answers[activeQuestion]}
        </div>
      )}
    </div>
  );
}

type Report = NonNullable<ReturnType<typeof useBusiness>["feasibilityReport"]>;
type Plan = NonNullable<ReturnType<typeof useBusiness>["financialPlan"]>;

function OverviewTab({ report }: { report: Report }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-3">Executive Summary</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">{report.executiveSummary}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MiniStat label="Feasibility Score" value={`${report.feasibilityScore}/100`} />
        <MiniStat label="Market Demand" value={report.marketDemand} />
        <MiniStat label="Risk Level" value={report.riskLevel} />
      </div>
    </div>
  );
}

function MarketOpportunityTab({ report }: { report: Report }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">Market Reach</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{report.marketReach}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">Opportunity Analysis</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{report.opportunityAnalysis}</p>
      </div>
    </div>
  );
}

function SwotRisksTab({ report }: { report: Report }) {
  return (
    <div className="space-y-4">
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
        <h3 className="font-semibold mb-3">Threats Identification</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{report.threatsIdentification}</p>
      </div>
    </div>
  );
}

function PricingCompetitorsTab({ report }: { report: Report }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">Competitor Mapping</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{report.competitorMapping}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">Product Market Value & Pricing</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{report.productMarketValue}</p>
      </div>
    </div>
  );
}

function FinancialTab({ plan }: { plan: Plan }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-4">Financial Structuring Plan</h3>
      {plan.details.exceedsLimits ? (
        <p className="text-sm text-amber-600">
          Project cost of {formatINR(plan.details.projectCost)} exceeds the ₹50 lakh Term Loan
          Scheme ceiling — this needs manual review by a Channel Partner.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <MiniStat label="Project Cost" value={formatINR(plan.details.projectCost)} />
            <MiniStat label="Loan Amount" value={formatINR(plan.details.loanAmount)} />
            <MiniStat label="Scheme" value={plan.details.scheme!.name} />
            <MiniStat label="Interest Rate" value={`${plan.details.scheme!.interestRate}% p.a.`} />
            <MiniStat label="Tenure" value={`${plan.details.scheme!.tenureYears} years`} />
            <MiniStat label="Moratorium" value={`${plan.details.scheme!.moratoriumMonths} months`} />
          </div>
          {plan.emiSchedule && (
            <MiniStat label="Quarterly EMI" value={formatINR(plan.emiSchedule.quarterlyEMI)} />
          )}
        </>
      )}
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
