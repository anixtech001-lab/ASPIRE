"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSavedReports, deleteReport, SavedReport } from "@/lib/reportsStorage";
import { useBusiness } from "@/lib/BusinessContext";
import { formatINR } from "@/lib/financialEngine";
import { FileText, Trash2, ArrowRight } from "lucide-react";

export default function MyReportsPage() {
    const router = useRouter();
    const { setBusinessDetails, setFeasibilityReport, setFinancialPlan } = useBusiness();
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setReports(getSavedReports());
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
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold mb-1">My Reports</h1>
            <p className="text-sm text-slate-500 mb-6">
                Every business plan you&apos;ve generated, saved on this device
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
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">{r.businessDetails.businessCategory}</span>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                        {r.businessDetails.location}, {r.businessDetails.state}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400">
                                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                    {"  ·  "}
                                    Investment {formatINR(r.financialPlan.details.projectCost)}
                                    {"  ·  "}
                                    Feasibility {r.feasibilityReport.feasibilityScore}/100
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => handleDelete(r.id, e)}
                                    className="text-slate-300 hover:text-red-500 p-1"
                                    aria-label="Delete report"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <ArrowRight className="h-4 w-4 text-slate-300" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
