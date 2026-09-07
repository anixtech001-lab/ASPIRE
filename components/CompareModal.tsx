"use client";

import { X, Trophy, Loader2 } from "lucide-react";
import { SavedReport } from "@/lib/reportsStorage";
import { formatINR } from "@/lib/financialEngine";
import { CompareResult } from "@/lib/ai";

interface CompareModalProps {
    reports: SavedReport[];
    result: CompareResult | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
}

export default function CompareModal({ reports, result, loading, error, onClose }: CompareModalProps) {
    const getReport = (id: string) => reports.find((r) => r.id === id);
    const recommended = result ? getReport(result.recommendedIdeaId) : null;
    const recommendedRanking = result?.ranking.find((r) => r.ideaId === result.recommendedIdeaId);

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <h2 className="font-semibold text-lg">Compare Ideas</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin mb-3" />
                            <p className="text-sm">Comparing {reports.length} ideas…</p>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500 py-8 text-center">{error}</p>}

                    {result && recommended && recommendedRanking && (
                        <>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Recommended Idea</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">
                                    {recommended.businessDetails.businessCategory} — {recommended.businessDetails.location}
                                </h3>
                                <p className="text-sm text-emerald-800 mb-3">{result.recommendationSummary}</p>
                                <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-full px-3 py-1">
                                    Viability Score: {recommendedRanking.viabilityScore}/100
                                </div>
                            </div>

                            <h3 className="font-semibold text-sm mb-3">Full Ranking</h3>
                            <div className="space-y-2 mb-6">
                                {result.ranking.map((item) => {
                                    const report = getReport(item.ideaId);
                                    if (!report) return null;
                                    return (
                                        <div key={item.ideaId} className="border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                                            <div className="text-lg font-bold text-slate-300 w-8">#{item.rank}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-sm">
                                                        {report.businessDetails.businessCategory} — {report.businessDetails.location}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500">{item.viabilityScore}/100</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{item.reasoning}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <h3 className="font-semibold text-sm mb-3">Side-by-Side Comparison</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="text-left px-3 py-2">Idea</th>
                                            <th className="text-right px-3 py-2">Project Cost</th>
                                            <th className="text-right px-3 py-2">Loan Amount</th>
                                            <th className="text-right px-3 py-2">Saturation</th>
                                            <th className="text-right px-3 py-2">Feasibility</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((r) => (
                                            <tr key={r.id} className="border-t border-slate-100">
                                                <td className="px-3 py-2 font-medium">
                                                    {r.businessDetails.businessCategory} ({r.businessDetails.location})
                                                </td>
                                                <td className="text-right px-3 py-2">{formatINR(r.financialPlan.details.projectCost)}</td>
                                                <td className="text-right px-3 py-2">{formatINR(r.financialPlan.details.loanAmount)}</td>
                                                <td className="text-right px-3 py-2">{r.feasibilityReport.competitorMapping.saturationLevel}</td>
                                                <td className="text-right px-3 py-2">{r.feasibilityReport.feasibilityScore}/100</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
