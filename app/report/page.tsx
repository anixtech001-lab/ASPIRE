"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useBusiness } from "@/lib/BusinessContext";
import { QuickQuestionId } from "@/lib/ai";
import { formatINR } from "@/lib/financialEngine";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTranslatedReport } from "@/lib/i18n/reportTranslation";
import { useBatchTranslate } from "@/lib/i18n/useBatchTranslate";
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

export default function ReportPage() {
  const { businessDetails, feasibilityReport, financialPlan } = useBusiness();
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Dynamic AI-generated content (executive summary, SWOT, risks, etc.) is
  // translated live via Bhashini — see lib/i18n/reportTranslation.ts. The
  // original English `feasibilityReport` from context is untouched and is
  // what handleDownload/handleDownloadPDF below still use, so downloads stay
  // in English for now regardless of the UI language (translating the PDF
  // itself is a reasonable next step, not done in this pass).
  const { report: displayReport, loading: translatingReport } = useTranslatedReport(feasibilityReport, lang);

  const TABS = [
    t("report.tabs.overview"),
    t("report.tabs.marketOpportunity"),
    t("report.tabs.swotRisks"),
    t("report.tabs.pricingCompetitors"),
    t("report.tabs.financialPlan"),
  ];

  if (!feasibilityReport || !financialPlan || !businessDetails || !displayReport) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <p className="text-slate-500 mb-4">{t("report.noReportYet")}</p>
        <Link href="/advisor" className="text-emerald-600 font-medium text-sm hover:underline">
          {t("report.startAnalysis")}
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
      push(`Indicative Financing: ${formatINR(financialPlan.details.loanAmount)}`);
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
          <ArrowLeft className="h-4 w-4" /> {t("report.back")}
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50">
            <Download className="h-4 w-4" /> {t("report.downloadTxt")}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {pdfLoading ? t("report.generatingPdf") : t("report.downloadPdf")}
          </button>
        </div>
      </div>
      <h1 className="text-xl font-semibold mt-3">{t("report.title")}</h1>
      <p className="text-sm text-slate-500 mb-3">
        {t("report.generatedFor")} {businessDetails.location}, {businessDetails.state} · {businessDetails.businessCategory}
      </p>
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1.5 mb-6">
        <Info className="h-3.5 w-3.5 shrink-0" />
        {t("report.aiEstimatedBadge")}
        {translatingReport && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`pb-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === i ? "border-emerald-600 text-emerald-700 font-medium" : "border-transparent text-slate-500"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === 0 && <OverviewTab report={displayReport} t={t} />}
          {tab === 1 && <MarketOpportunityTab report={displayReport} t={t} />}
          {tab === 2 && <SwotRisksTab report={displayReport} t={t} />}
          {tab === 3 && <PricingCompetitorsTab report={displayReport} t={t} />}
          {tab === 4 && <FinancialTab plan={financialPlan} t={t} />}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit">
            <h3 className="font-semibold text-sm mb-4">{t("report.atAGlance")}</h3>
            <GlanceRow label={t("report.businessType")} value={businessDetails.businessCategory} />
            <GlanceRow label={t("report.location")} value={`${businessDetails.location}, ${businessDetails.state}`} />
            <GlanceRow label={t("report.projectCost")} value={formatINR(financialPlan.details.projectCost)} />
            <GlanceRow label={t("report.indicativeFinancing")} value={formatINR(financialPlan.details.loanAmount)} />
            <GlanceRow label={t("report.scheme")} value={financialPlan.details.scheme?.name ?? t("report.exceedsLimits")} />
            <GlanceRow label={t("report.riskLevel")} value={displayReport.riskLevel} last />
          </div>

          <QuickAssistant businessDetails={businessDetails} t={t} lang={lang} />
        </div>
      </div>
    </div>
  );
}

type Report = NonNullable<ReturnType<typeof useBusiness>["feasibilityReport"]>;
type Plan = NonNullable<ReturnType<typeof useBusiness>["financialPlan"]>;
type T = (key: string) => string;

function severityLabel(t: T, severity: string): string {
  return t(`report.severity.${severity}`) || severity;
}

function OverviewTab({ report, t }: { report: Report; t: T }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-3">{t("report.executiveSummary")}</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">{report.executiveSummary}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MiniStat label={t("report.feasibilityScore")} value={`${report.feasibilityScore}/100`} />
        <MiniStat label={t("report.marketDemand")} value={severityLabel(t, report.marketDemand)} />
        <MiniStat label={t("report.riskLevel")} value={report.riskLevel} />
      </div>
    </div>
  );
}

function MarketOpportunityTab({ report, t }: { report: Report; t: T }) {
  const reachData = [
    { name: "Within 5km", value: report.marketReach.population5km },
    { name: "Within 10km", value: report.marketReach.population10km },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" /> {t("report.marketReach")}
        </h3>
        <p className="text-sm text-slate-600 mb-4">{report.marketReach.summary}</p>

        {(report.marketReach.population5km > 0 || report.marketReach.population10km > 0) && (
          <div className="mb-4">
            <div className="mb-1.5">
              <ModelEstimateBadge t={t} />
            </div>
            <div className="h-40">
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
          <Lightbulb className="h-4 w-4 text-emerald-600" /> {t("report.opportunityAnalysis")}
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

function SwotRisksTab({ report, t }: { report: Report; t: T }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-3">{t("report.swotAnalysis")}</h3>
        <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden border border-slate-200">
          <SwotQuadrant title={t("report.strengths")} items={report.swot.strengths} bg="bg-emerald-50" text="text-emerald-800" chip="bg-emerald-100" />
          <SwotQuadrant title={t("report.weaknesses")} items={report.swot.weaknesses} bg="bg-amber-50" text="text-amber-800" chip="bg-amber-100" />
          <SwotQuadrant title={t("report.opportunities")} items={report.swot.opportunities} bg="bg-blue-50" text="text-blue-800" chip="bg-blue-100" />
          <SwotQuadrant title={t("report.threats")} items={report.swot.threats} bg="bg-red-50" text="text-red-800" chip="bg-red-100" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-2">{t("report.threatsIdentification")}</h3>
        <p className="text-sm text-slate-600 mb-4">{report.threatsIdentification.summary}</p>
        <div className="space-y-3">
          {report.threatsIdentification.risks.map((r, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">{r.name}</span>
                <span className="font-medium" style={{ color: SEVERITY_COLOR[r.severity] }}>
                  {severityLabel(t, r.severity)}
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

function PricingCompetitorsTab({ report, t }: { report: Report; t: T }) {
  const priceData = [
    { name: "Suggested", value: report.productMarketValue.suggestedPrice },
    { name: "Regional Avg", value: report.productMarketValue.regionalAveragePrice },
  ];
  const satIndex = { Low: 0, Medium: 1, High: 2 }[report.competitorMapping.saturationLevel];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-2">{t("report.competitorMapping")}</h3>
        <p className="text-sm text-slate-600 mb-4">{report.competitorMapping.summary}</p>
        <div className="flex rounded-lg overflow-hidden h-8 text-[11px] font-medium">
          {(["Low", "Medium", "High"] as const).map((level, i) => (
            <div
              key={level}
              className={`flex-1 flex items-center justify-center ${i === satIndex ? "text-white" : "text-slate-400 bg-slate-100"
                }`}
              style={i === satIndex ? { backgroundColor: SEVERITY_COLOR[level] } : {}}
            >
              {severityLabel(t, level)}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-400">
            {t("report.marketSaturationLevel")}: {severityLabel(t, report.competitorMapping.saturationLevel)}
          </p>
          <ModelEstimateBadge t={t} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-600" /> {t("report.productMarketValue")}
        </h3>
        <p className="text-sm text-slate-600 mb-4">{report.productMarketValue.summary}</p>
        {report.productMarketValue.suggestedPrice > 0 && (
          <div>
            <div className="mb-1.5">
              <ModelEstimateBadge t={t} />
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
}

function FinancialTab({ plan, t }: { plan: Plan; t: T }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold mb-4">{t("report.financialPlanTitle")}</h3>
      {plan.details.exceedsLimits ? (
        <p className="text-sm text-amber-600">
          {t("report.projectCost")} {formatINR(plan.details.projectCost)} {t("report.exceedsLimitsMsg")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <MiniStat label={t("report.projectCost")} value={formatINR(plan.details.projectCost)} />
            <MiniStat label={t("report.indicativeFinancing")} value={formatINR(plan.details.loanAmount)} />
            <MiniStat label={t("report.scheme")} value={plan.details.scheme!.name} />
            <MiniStat label={t("report.interestRate")} value={`${plan.details.scheme!.interestRate}% p.a.`} />
            <MiniStat label={t("report.tenure")} value={`${plan.details.scheme!.tenureYears} years`} />
            <MiniStat label={t("report.moratorium")} value={`${plan.details.scheme!.moratoriumMonths} months`} />
          </div>
          {plan.emiSchedule && <MiniStat label={t("report.quarterlyEmi")} value={formatINR(plan.emiSchedule.quarterlyEMI)} />}
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

function ModelEstimateBadge({ t }: { t: T }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
      ⚠ {t("report.modelEstimate")}
    </span>
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

function QuickAssistant({
  businessDetails,
  t,
  lang,
}: {
  businessDetails: NonNullable<ReturnType<typeof useBusiness>["businessDetails"]>;
  t: T;
  lang: import("@/lib/i18n/languages").Lang;
}) {
  const [activeQuestion, setActiveQuestion] = useState<QuickQuestionId | null>(null);
  const [answers, setAnswers] = useState<Partial<Record<QuickQuestionId, string>>>({});
  const [loadingId, setLoadingId] = useState<QuickQuestionId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buttons: { id: QuickQuestionId; label: string }[] = [
    { id: "raw_material", label: "💰 Saste raw material kahan milega?" },
    { id: "emi_default", label: "⚠️ EMI na de paun toh kya hoga?" },
    { id: "licenses", label: "📋 Kaun se license chahiye?" },
  ];

  const activeAnswer = activeQuestion ? answers[activeQuestion] : undefined;
  // Quick-advice answers are also Groq-generated free text, in English —
  // translated the same way as the report, just a single-string batch.
  const answerMap = useMemo(
    () => (activeAnswer ? { answer: activeAnswer } : null),
    [activeAnswer]
  );
  const { translated: translatedAnswer, loading: translatingAnswer } = useBatchTranslate(answerMap, lang);

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
      <h3 className="font-semibold text-sm mb-1">{t("report.quickQuestions")}</h3>
      <p className="text-xs text-slate-400 mb-4">{t("report.quickQuestionsDesc")}</p>
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
      {(loadingId || translatingAnswer) && (
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
          <span className="h-3 w-3 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
          {t("report.thinking")}
        </p>
      )}
      {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      {activeQuestion && activeAnswer && !loadingId && !translatingAnswer && (
        <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">
          {translatedAnswer?.answer ?? activeAnswer}
        </div>
      )}
    </div>
  );
}
