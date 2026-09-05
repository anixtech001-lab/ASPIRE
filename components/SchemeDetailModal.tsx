"use client";

import { useState, useMemo } from "react";
import { X, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { calculateMonthlyEMI, formatINR } from "@/lib/financialEngine";
import { MatchLabel, SchemeMatchResult } from "@/lib/schemeMatching";

export interface SchemeEmiDefaults {
    rate: number; // annual %
    tenureMonths: number;
    moratoriumMonths: number;
}

interface SchemeDetailModalProps {
    name: string;
    desc: string;
    note: string;
    applyUrl: string;
    emiDefaults: SchemeEmiDefaults;
    defaultPrincipal: number;
    maxPrincipal: number;
    match: SchemeMatchResult | null;
    onClose: () => void;
}

const LABEL_STYLE: Record<MatchLabel, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
    "Strong Match": { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
    "Check Conditions": { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle },
    "Likely Not Applicable": { bg: "bg-slate-100", text: "text-slate-500", icon: XCircle },
};

export default function SchemeDetailModal({
    name,
    desc,
    note,
    applyUrl,
    emiDefaults,
    defaultPrincipal,
    maxPrincipal,
    match,
    onClose,
}: SchemeDetailModalProps) {
    const [principal, setPrincipal] = useState(defaultPrincipal);
    const [rate, setRate] = useState(emiDefaults.rate);
    const [tenureMonths, setTenureMonths] = useState(emiDefaults.tenureMonths);
    const [moratoriumMonths, setMoratoriumMonths] = useState(emiDefaults.moratoriumMonths);
    const [showFullSchedule, setShowFullSchedule] = useState(false);

    const result = useMemo(
        () => calculateMonthlyEMI(principal, rate, tenureMonths, moratoriumMonths),
        [principal, rate, tenureMonths, moratoriumMonths]
    );

    const style = match ? LABEL_STYLE[match.matchLabel] : null;
    const Icon = style?.icon;

    const visibleRows = showFullSchedule ? result.schedule : result.schedule.slice(0, 6);

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
                    <div>
                        <h2 className="font-semibold text-lg">{name}</h2>
                        <p className="text-sm text-slate-500 mt-1">{desc}</p>
                        {match && style && Icon && (
                            <div className={`inline-flex items-center gap-1 text-xs font-medium ${style.bg} ${style.text} rounded-full px-2 py-1 mt-2`}>
                                <Icon className="h-3 w-3" />
                                {match.matchLabel}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {match && (match.reasons.length > 0 || match.caveats.length > 0) && (
                        <div>
                            <div className="text-xs font-semibold text-slate-500 mb-2">Why this matches you</div>
                            <ul className="space-y-1">
                                {match.reasons.map((r, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                        <span className="text-emerald-500 mt-0.5">✓</span> {r}
                                    </li>
                                ))}
                                {match.caveats.map((c, i) => (
                                    <li key={`c-${i}`} className="text-xs text-amber-600 flex items-start gap-1.5">
                                        <span className="mt-0.5">!</span> {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* EMI Calculator */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">EMI Calculator</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <Field label="Loan Principal (₹)">
                                <input
                                    type="number"
                                    className="input"
                                    value={principal}
                                    max={maxPrincipal}
                                    onChange={(e) => setPrincipal(Math.min(Number(e.target.value), maxPrincipal))}
                                />
                            </Field>
                            <Field label="Interest Rate (% p.a.)">
                                <input
                                    type="number"
                                    step="0.1"
                                    className="input"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                />
                            </Field>
                            <Field label="Tenure (months)">
                                <input
                                    type="number"
                                    className="input"
                                    value={tenureMonths}
                                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                                />
                            </Field>
                            <Field label="Moratorium (months)">
                                <input
                                    type="number"
                                    className="input"
                                    value={moratoriumMonths}
                                    onChange={(e) => setMoratoriumMonths(Math.min(Number(e.target.value), tenureMonths))}
                                />
                            </Field>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4">
                            Rate, tenure, and moratorium vary by bank/scheme guidelines — edit these to match
                            your actual offer.
                        </p>

                        <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-4">
                            <div>
                                <div className="text-[11px] text-slate-400">Monthly EMI</div>
                                <div className="text-lg font-semibold text-emerald-700">{formatINR(result.monthlyEMI)}</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-400">Total Interest</div>
                                <div className="text-lg font-semibold">{formatINR(result.totalInterest)}</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-400">Total Repayable</div>
                                <div className="text-lg font-semibold">{formatINR(result.totalRepayable)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Amortization schedule */}
                    {result.schedule.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-sm mb-3">Repayment Schedule</h3>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="text-left px-3 py-2">Month</th>
                                            <th className="text-right px-3 py-2">EMI</th>
                                            <th className="text-right px-3 py-2">Principal</th>
                                            <th className="text-right px-3 py-2">Interest</th>
                                            <th className="text-right px-3 py-2">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleRows.map((row) => (
                                            <tr key={row.month} className={`border-t border-slate-100 ${row.isMoratorium ? "bg-amber-50/50" : ""}`}>
                                                <td className="px-3 py-2">
                                                    M{row.month}
                                                    {row.isMoratorium && (
                                                        <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-700 rounded px-1 py-0.5">
                                                            Moratorium
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-right px-3 py-2">{formatINR(row.emi)}</td>
                                                <td className="text-right px-3 py-2">{formatINR(row.principalPaid)}</td>
                                                <td className="text-right px-3 py-2 text-amber-600">{formatINR(row.interestPaid)}</td>
                                                <td className="text-right px-3 py-2">{formatINR(row.closingBalance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {result.schedule.length > 6 && (
                                <button
                                    onClick={() => setShowFullSchedule((s) => !s)}
                                    className="text-xs text-emerald-600 font-medium mt-2 hover:underline"
                                >
                                    {showFullSchedule ? "Show less" : `Show all ${result.schedule.length} months`}
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-[11px] text-slate-400">{note}</p>

                    <a
                        href={applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2.5 transition-colors"
                    >
                        Apply Now →
                    </a>
                </div>
            </div>

            <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          outline: none;
        }
        .input:focus {
          border-color: #10b981;
        }
      `}</style>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">{label}</label>
            {children}
        </div>
    );
}
