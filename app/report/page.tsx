"use client";

import { useState } from "react";
import Link from "next/link";
import { useBusiness } from "@/lib/BusinessContext";
import { QuickQuestionId } from "@/lib/ai";
import { formatINR } from "@/lib/financialEngine";
import { Download, ArrowLeft, Info, MapPin, Lightbulb, Users, DollarSign, FileDown, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BRAND_GREEN = "#2C5F2D";
const BRAND_MOSS = "#97BC62";
const SEVERITY_COLOR: Record<string, string> = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };

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
  const [pdfLoading, setPdfLoading] = useState(false);

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

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      // Dynamic import keeps @react-pdf/renderer out of the initial bundle
      // and — critically — ensures it only ever runs in the browser, never
      // during server-side rendering, avoiding any SSR compatibility issues.
      const [{ pdf }, { default: ReportPDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/ReportPDFDocument"),
      ]);

      const blob = await pdf(
        <ReportPDFDocument
          businessDetails={businessDetails}
          feasibilityReport={feasibilityReport}
          financialPlan={financialPlan}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ASPIRE_Report_${businessDetails.businessCategory}_${new Date().toISOString().slice(0, 10)}.pdf`.replace(
        /\s+/g,
        "_"
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[report] PDF generation failed:", err);
      alert("Couldn't generate the PDF right now. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = () => {
    const lines: string[] = [];
    const push = (text = "") => lines.push(text);
    const heading = (text: string) => {
      push(text);
      push("-".repeat(text.length));
    };

    push("ASPIRE — AI Business Advisory Report");
    push("=".repeat(40));
    push(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
    push();
    heading("BUSINESS DETAILS");
    push(`Business Type: ${businessDetails.businessCategory}`);
    push(`Location: ${businessDetails.location}, ${businessDetails.state}`);
    push(`Margin Capital: ${formatINR(businessDetails.marginCapital)}`);
    push();
    heading("EXECUTIVE SUMMARY");
    push(feasibilityReport.executiveSummary);
    push(`Feasibility Score: ${feasibilityReport.feasibilityScore}/100`);
    push(`Market Demand: ${feasibilityReport.marketDemand}`);
    push(`Risk Level: ${feasibilityReport.riskLevel}`);
    push();
    heading("MARKET REACH");
    push(feasibilityReport.marketReach.summary);
    push(`Population within 5km: ~${feasibilityReport.marketReach.population5km.toLocaleString("en-IN")}`);
    push(`Population within 10km: ~${feasibilityReport.marketReach.population10km.toLocaleString("en-IN")}`);
    push(`Distribution channels: ${feasibilityReport.marketReach.channels.join(", ")}`);
    push();
    heading("OPPORTUNITY ANALYSIS");
    feasibilityReport.opportunityAnalysis.forEach((o) => push(`${o.title}: ${o.description}`));
    push();
    heading("SWOT ANALYSIS");
    push(`Strengths: ${feasibilityReport.swot.strengths.join("; ")}`);
    push(`Weaknesses: ${feasibilityReport.swot.weaknesses.join("; ")}`);
    push(`Opportunities: ${feasibilityReport.swot.opportunities.join("; ")}`);
    push(`Threats: ${feasibilityReport.swot.threats.join("; ")}`);
    push();
    heading("THREATS IDENTIFICATION");
    push(feasibilityReport.threatsIdentification.summary);
    feasibilityReport.threatsIdentification.risks.forEach((r) => push(`- ${r.name}: ${r.severity} severity`));
    push();
    heading("COMPETITOR MAPPING");
    push(feasibilityReport.competitorMapping.summary);
    push(`Market Saturation: ${feasibilityReport.competitorMapping.saturationLevel}`);
    push();
    heading("PRODUCT MARKET VALUE & PRICING");
    push(feasibilityReport.productMarketValue.summary);
    push(
      `Suggested Price: ₹${feasibilityReport.productMarketValue.suggestedPrice} ${feasibilityReport.productMarketValue.unit} (Regional Avg: ₹${feasibilityReport.productMarketValue.regionalAveragePrice})`
    );
    push();
    heading("FINANCIAL STRUCTURING PLAN");
    if (financialPlan.details.exceedsLimits) {
      push(`Project cost of ${formatINR(financialPlan.details.projectCost)} exceeds standard scheme limits.`);
    } else {
      push(`Project Cost: ${formatINR(financialPlan.details.projectCost)}`);
      push(`Loan Amount: ${formatINR(financialPlan.details.loanAmount)}`);
      push(`Scheme: ${financialPlan.details.scheme!.name}`);
      push(`Interest Rate: ${financialPlan.details.scheme!.interestRate}% p.a.`);
      push(`Tenure: ${financialPlan.details.scheme!.tenureYears} years`);
      push(`Moratorium: ${financialPlan.details.scheme!.moratoriumMonths} months`);
      if (financialPlan.emiSchedule) push(`Quarterly EMI: ${formatINR(financialPlan.emiSchedule.quarterlyEMI)}`);
    }
    push();
    push("-".repeat(40));
    push("Note: This is an AI-estimated analysis based on regional demographic and");
    push("economic patterns, not live field survey data.");

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASPIRE_Report_${businessDetails.businessCategory}_${businessDetails.location}.txt`.replace(/\s+/g, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Download (.txt)
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {pdfLoading ? "Generating…" : "Download Full Report (PDF)"}
          </button>
        </div>
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
            <GlanceRow label="Scheme" value={financialPlan.details.scheme?.name ?? "Exceeds standard limits"} />
            <GlanceRow label="Risk Level" value={feasibilityReport.riskLevel} last />
          </div>

          <QuickAssistant businessDetails={businessDetails} />
        </div>
      </div>
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
  const reachData = [
    { name: "Within 5km", value: report.marketReach.population5km },
    { name: "Within 10km", value: report.marketReach.population10km },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" /> Market Reach
        </h3>
        <p className="text-sm text-slate-600 mb-4">{report.marketReach.summary}</p>

        {(report.marketReach.population5km > 0 || report.marketReach.population10km > 0) && (
          <div className="h-40 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reachData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => Number(v).toLocaleString("en-IN")} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  <Cell fill={BRAND_GREEN} />
                  <Cell fill={BRAND_MOSS} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {report.marketReach.channels.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5">
              <Users className="h-3 w-3" /> {c}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-emerald-600" /> Opportunity Analysis
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {report.opportunityAnalysis.map((o, i) => (
            <div key={i} className="bg-emerald-50 rounded-xl p-4">
              <div className="text-sm font-semibold text-emerald-800 mb-1">{o.title}</div>
              <p className="text-xs text-emerald-700 leading-relaxed">{o.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SwotRisksTab({ report }: { report: Report }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">SWOT Analysis</h3>
        <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden border border-slate-200">
          <SwotQuadrant title="Strengths" items={report.swot.strengths} bg="bg-emerald-50" text="text-emerald-800" chip="bg-emerald-100" />
          <SwotQuadrant title="Weaknesses" items={report.swot.weaknesses} bg="bg-amber-50" text="text-amber-800" chip="bg-amber-100" />
          <SwotQuadrant title="Opportunities" items={report.swot.opportunities} bg="bg-blue-50" text="text-blue-800" chip="bg-blue-100" />
          <SwotQuadrant title="Threats" items={report.swot.threats} bg="bg-red-50" text="text-red-800" chip="bg-red-100" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-2">Threats Identification</h3>
        <p className="text-sm text-slate-600 mb-4">{report.threatsIdentification.summary}</p>
        <div className="space-y-3">
          {report.threatsIdentification.risks.map((r, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">{r.name}</span>
                <span className="font-medium" style={{ color: SEVERITY_COLOR[r.severity] }}>
                  {r.severity}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: r.severity === "Low" ? "33%" : r.severity === "Medium" ? "66%" : "100%",
                    backgroundColor: SEVERITY_COLOR[r.severity],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingCompetitorsTab({ report }: { report: Report }) {
  const priceData = [
    { name: "Suggested", value: report.productMarketValue.suggestedPrice },
    { name: "Regional Avg", value: report.productMarketValue.regionalAveragePrice },
  ];
  const satIndex = { Low: 0, Medium: 1, High: 2 }[report.competitorMapping.saturationLevel];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-2">Competitor Mapping</h3>
        <p className="text-sm text-slate-600 mb-4">{report.competitorMapping.summary}</p>
        <div className="flex rounded-lg overflow-hidden h-8 text-[11px] font-medium">
          {["Low", "Medium", "High"].map((level, i) => (
            <div
              key={level}
              className={`flex-1 flex items-center justify-center ${i === satIndex ? "text-white" : "text-slate-400 bg-slate-100"
                }`}
              style={i === satIndex ? { backgroundColor: SEVERITY_COLOR[level] } : {}}
            >
              {level}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Market Saturation Level: {report.competitorMapping.saturationLevel}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-600" /> Product Market Value &amp; Pricing
        </h3>
        <p className="text-sm text-slate-600 mb-4">{report.productMarketValue.summary}</p>
        {report.productMarketValue.suggestedPrice > 0 && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => `₹${v} ${report.productMarketValue.unit}`} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  <Cell fill={BRAND_GREEN} />
                  <Cell fill={BRAND_MOSS} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
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
          {plan.emiSchedule && <MiniStat label="Quarterly EMI" value={formatINR(plan.emiSchedule.quarterlyEMI)} />}
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

function SwotQuadrant({ title, items, bg, text, chip }: { title: string; items: string[]; bg: string; text: string; chip: string }) {
  return (
    <div className={`${bg} p-4`}>
      <div className={`text-xs font-semibold mb-2 ${text}`}>{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className={`text-[11px] ${chip} ${text} rounded-full px-2 py-1`}>
            {it}
          </span>
        ))}
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
    if (answers[id]) return;

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
            className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-colors ${activeQuestion === b.id ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 hover:border-slate-300 text-slate-600"
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
        <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">{answers[activeQuestion]}</div>
      )}
    </div>
  );
}
