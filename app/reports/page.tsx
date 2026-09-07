"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSavedReports, deleteReport, SavedReport } from "@/lib/reportsStorage";
import { useBusiness } from "@/lib/BusinessContext";
import { formatINR } from "@/lib/financialEngine";
import { CompareResult } from "@/lib/ai";
import { FileText, Trash2, ArrowRight, GitCompareArrows } from "lucide-react";
import CompareModal from "@/components/CompareModal";

export default function MyReportsPage() {
    const router = useRouter();
    const { setBusinessDetails, setFeasibilityReport, setFinancialPlan } = useBusiness();
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const [compareOpen, setCompareOpen] = useState(false);
    const [compareLoading, setCompareLoading] = useState(false);
    const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
    const [compareError, setCompareError] = useState<string | null>(null);

    useEffect(() => {
        const saved = getSavedReports();
        setReports(saved);
        setSelected(new Set(saved.map((r) => r.id))); // default: all selected
        setLoaded(true);
    }, []);

    const openReport = (report: SavedReport) => {
        setBusinessDetails(report.businessDetails);
        setFeasibilityReport(report.feasibilityReport);
        setFinancialPlan(report.financialPlan);
        router.push("/report");
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteReport(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectedReports = reports.filter((r) => selected.has(r.id));

    const handleCompare = async () => {
        if (selectedReports.length < 2) return;
        setCompareOpen(true);
        setCompareLoading(true);
        setCompareError(null);
        setCompareResult(null);

        try {
            const ideas = selectedReports.map((r) => ({
                id: r.id,
                businessCategory: r.businessDetails.businessCategory,
                location: r.businessDetails.location,
                projectCost: r.financialPlan.details.projectCost,
                loanAmount: r.financialPlan.details.loanAmount,
                scheme: r.financialPlan.details.scheme?.name ?? "Manual Review",
                marketSaturation: r.feasibilityReport.competitorMapping.saturationLevel,
                feasibilityScore: r.feasibilityReport.feasibilityScore,
                swotSummary: [...r.feasibilityReport.swot.strengths.slice(0, 2), ...r.feasibilityReport.swot.threats.slice(0, 2)].join("; "),
            }));

            const res = await fetch("/api/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ideas }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");
            setCompareResult(data);
        } catch (err) {
            setCompareError(err instanceof Error ? err.message : "Couldn't generate a comparison. Please try again.");
        } finally {
            setCompareLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-semibold">My Reports</h1>
                {reports.length >= 2 && (
                    <button
                        onClick={handleCompare}
                        disabled={selectedReports.length < 2}
                        className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-4 py-2 transition-colors"
                    >
                        <GitCompareArrows className="h-4 w-4" /> Compare {selectedReports.length > 0 ? `(${selectedReports.length})` : "Ideas"}
                    </button>
                )}
            </div>
            <p className="text-sm text-slate-500 mb-6">
                Every business plan you&apos;ve generated, saved on this device
                {reports.length >= 2 && " — select 2 or more below to compare"}
            </p>

            {!loaded ? null : reports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">No saved reports yet</h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                        Reports are saved automatically here every time you generate a business plan.
                    </p>
                    <Link
                        href="/advisor"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Start Business Analysis <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => openReport(r)}
                            className="w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                {reports.length >= 2 && (
                                    <input
                                        type="checkbox"
                                        checked={selected.has(r.id)}
                                        onClick={(e) => toggleSelect(r.id, e)}
                                        onChange={() => { }}
                                        className="h-4 w-4 accent-emerald-600 shrink-0"
                                    />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{r.businessDetails.businessCategory}</span>
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                            {r.businessDetails.location}, {r.businessDetails.state}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        {"  ·  "}
                                        Investment {formatINR(r.financialPlan.details.projectCost)}
                                        {"  ·  "}
                                        Feasibility {r.feasibilityReport.feasibilityScore}/100
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={(e) => handleDelete(r.id, e)} className="text-slate-300 hover:text-red-500 p-1" aria-label="Delete report">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <ArrowRight className="h-4 w-4 text-slate-300" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {compareOpen && (
                <CompareModal
                    reports={selectedReports}
                    result={compareResult}
                    loading={compareLoading}
                    error={compareError}
                    onClose={() => setCompareOpen(false)}
                />
            )}
        </div>
    );
}
