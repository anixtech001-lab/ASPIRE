"use client";

import Link from "next/link";
import { useBusiness } from "@/lib/BusinessContext";
import { TrendingUp, Users, Target, DollarSign, ArrowRight } from "lucide-react";

export default function MarketInsightsPage() {
    const { businessDetails, feasibilityReport } = useBusiness();

    if (!businessDetails || !feasibilityReport) {
        return (
            <div className="p-6 md:p-8 max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold mb-1">Market Insights</h1>
                <p className="text-sm text-slate-500 mb-6">Understand your market before you invest</p>

                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">No market data yet</h2>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                        Market insights are generated as part of your Business Advisory Report — complete
                        an analysis first to see your market reach, competitor mapping, and pricing
                        intelligence here.
                    </p>
                    <Link
                        href="/advisor"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Start Business Analysis <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold mb-1">Market Insights</h1>
            <p className="text-sm text-slate-500 mb-6">
                For your {businessDetails.businessCategory} business in {businessDetails.location},{" "}
                {businessDetails.state}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <MiniStat icon={<TrendingUp className="h-4 w-4" />} label="Market Demand" value={feasibilityReport.marketDemand} />
                <MiniStat
                    icon={<Target className="h-4 w-4" />}
                    label="Competitor Density"
                    value={feasibilityReport.competitorMapping.split(".")[0].slice(0, 40) + "…"}
                />
                <MiniStat icon={<Users className="h-4 w-4" />} label="Feasibility Score" value={`${feasibilityReport.feasibilityScore}/100`} />
            </div>

            <div className="space-y-4">
                <Section icon={<Users className="h-4 w-4 text-emerald-600" />} title="Market Reach">
                    {feasibilityReport.marketReach}
                </Section>

                <Section icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} title="Opportunity Analysis">
                    {feasibilityReport.opportunityAnalysis}
                </Section>

                <Section icon={<Target className="h-4 w-4 text-emerald-600" />} title="Competitor Mapping">
                    {feasibilityReport.competitorMapping}
                </Section>

                <Section icon={<DollarSign className="h-4 w-4 text-emerald-600" />} title="Pricing Intelligence">
                    {feasibilityReport.productMarketValue}
                </Section>

                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-semibold mb-3">Opportunities &amp; Threats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs font-semibold text-emerald-700 mb-2">Opportunities</div>
                            <ul className="space-y-1.5">
                                {feasibilityReport.swot.opportunities.map((o, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">↑</span> {o}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-amber-700 mb-2">Threats</div>
                            <ul className="space-y-1.5">
                                {feasibilityReport.swot.threats.map((t, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">↓</span> {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-400 mt-6">
                This analysis is AI-estimated based on regional demographic and economic patterns, not
                live field survey data. See your full{" "}
                <Link href="/report" className="text-emerald-600 hover:underline">
                    Business Advisory Report
                </Link>{" "}
                for the complete picture.
            </p>
        </div>
    );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                {icon}
                {label}
            </div>
            <div className="text-sm font-semibold">{value}</div>
        </div>
    );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
        </div>
    );
}
