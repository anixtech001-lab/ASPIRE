"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBusiness } from "@/lib/BusinessContext";
import { calculateFullFinancialPlan } from "@/lib/financialEngine";
import { matchScheme, SchemeCriteria, MatchLabel } from "@/lib/schemeMatching";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface SchemeInfo {
  name: string;
  desc: string;
  rows: { label: string; value: string }[];
  note: string;
  applyUrl: string;
  criteria: SchemeCriteria;
}

const SCHEMES: SchemeInfo[] = [
  {
    name: "PMEGP Scheme",
    desc: "Credit-linked subsidy for setting up new micro-enterprises. Implemented by KVIC, Ministry of MSME.",
    rows: [
      { label: "Subsidy", value: "15% – 35% of project cost" },
      { label: "Max Project Cost", value: "₹50L (Mfg) / ₹20L (Service)" },
    ],
    note: "General category: 15% urban / 25% rural. SC/ST/Women/NE/special category: 25% urban / 35% rural. Ceiling depends on whether your unit is manufacturing (₹50L) or service (₹20L) — confirm which applies to you.",
    applyUrl: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
    criteria: {
      // PMEGP explicitly excludes primary agriculture/animal-husbandry
      // production — dairy farming itself doesn't qualify, though
      // dairy-product processing sometimes can. Kept conservative here.
      targetCategories: ["Retail", "Textiles", "Food Processing", "Handicrafts", "Services", "Other"],
      minProjectCost: 0,
      maxProjectCost: 5000000,
    },
  },
  {
    name: "Mudra Loan (PMMY)",
    desc: "Collateral-free loans for non-farm micro/small enterprises, in four tiers by business stage.",
    rows: [
      { label: "Loan Tiers", value: "Shishu ≤₹50K · Kishor ≤₹5L" },
      { label: "", value: "Tarun ≤₹10L · Tarun Plus ≤₹20L" },
    ],
    note: "Tarun Plus (₹10L–₹20L) requires a clean repayment record on a prior Tarun loan.",
    applyUrl: "https://www.udyamimitra.in/",
    criteria: {
      targetCategories: "any",
      minProjectCost: 0,
      maxProjectCost: 2000000,
    },
  },
  {
    name: "Stand-Up India Scheme",
    desc: "Bank loans for SC/ST and women entrepreneurs starting a new (greenfield) enterprise.",
    rows: [
      { label: "Loan Amount", value: "₹10L – ₹1 Crore" },
      { label: "Tenure", value: "7 years + 18mo moratorium" },
    ],
    note: "Interest rate = bank's MCLR + up to 3% + tenor premium (typically ~9-12% p.a.). Rates vary by bank — confirm before applying.",
    applyUrl: "https://www.standupmitra.in/",
    criteria: {
      targetCategories: "any",
      minProjectCost: 1100000,
      maxProjectCost: 11000000,
      specialEligibility: "SC/ST or Women entrepreneur, for a new (greenfield) enterprise",
    },
  },
  {
    name: "Kisan Credit Card (KCC)",
    desc: "Working-capital credit for farming and allied activities, including dairy, poultry, and fisheries.",
    rows: [
      { label: "Interest Rate", value: "~4% effective (with subvention)" },
      { label: "Limit", value: "Up to ₹3L at subsidized rate" },
    ],
    note: "This is a revolving working-capital limit, not a one-time project loan. Subsidized rate applies only for prompt repayment.",
    applyUrl: "https://www.myscheme.gov.in/schemes/kcc",
    criteria: {
      targetCategories: ["Dairy"],
      minProjectCost: 0,
      maxProjectCost: 300000,
    },
  },
];

const LABEL_STYLE: Record<MatchLabel, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  "Strong Match": { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  "Check Conditions": { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle },
  "Likely Not Applicable": { bg: "bg-slate-100", text: "text-slate-500", icon: XCircle },
};

export default function SchemesPage() {
  const { businessDetails, financialPlan } = useBusiness();

  const projectCost = useMemo(() => {
    if (financialPlan) return financialPlan.details.projectCost;
    if (businessDetails?.marginCapital) {
      return calculateFullFinancialPlan(businessDetails.marginCapital).details.projectCost;
    }
    return null;
  }, [businessDetails, financialPlan]);

  const ranked = useMemo(() => {
    if (!businessDetails || projectCost === null) return null;
    return SCHEMES.map((scheme) => ({
      scheme,
      match: matchScheme(businessDetails, projectCost, scheme.criteria),
    })).sort((a, b) => b.match.score - a.match.score);
  }, [businessDetails, projectCost]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Schemes & Support</h1>
      <p className="text-sm text-slate-500 mb-6">
        {ranked
          ? "Ranked for your business profile — based on your project cost and business category"
          : "Government schemes that you may be eligible for"}
      </p>

      {!ranked && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 text-sm text-emerald-800">
          <Link href="/advisor" className="font-medium underline">
            Complete your Business Advisor analysis
          </Link>{" "}
          to see these schemes ranked and matched to your specific project — showing general
          info for now.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(ranked ?? SCHEMES.map((scheme) => ({ scheme, match: null }))).map(({ scheme, match }, i) => {
          const style = match ? LABEL_STYLE[match.matchLabel] : null;
          const Icon = style?.icon;
          const isLowMatch = match?.matchLabel === "Likely Not Applicable";

          return (
            <div
              key={scheme.name}
              className={`bg-white rounded-2xl border border-slate-200 p-5 flex flex-col ${isLowMatch ? "opacity-60" : ""
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm leading-snug">{scheme.name}</h3>
                {ranked && !isLowMatch && (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 shrink-0 ml-2">
                    RANK #{i + 1}
                  </span>
                )}
              </div>

              {match && style && Icon && (
                <div className={`inline-flex items-center gap-1 text-[11px] font-medium ${style.bg} ${style.text} rounded-full px-2 py-1 mb-3 w-fit`}>
                  <Icon className="h-3 w-3" />
                  {match.matchLabel}
                </div>
              )}

              <p className="text-xs text-slate-500 mb-4 flex-1">{scheme.desc}</p>

              {scheme.rows.map((r, ri) => (
                <div key={ri} className="mb-1.5">
                  {r.label && <div className="text-xs text-slate-400">{r.label}</div>}
                  <div className="text-sm font-medium">{r.value}</div>
                </div>
              ))}

              {match && match.reasons.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Why this matches you</div>
                  <ul className="space-y-1">
                    {match.reasons.map((r, ri) => (
                      <li key={ri} className="text-[11px] text-slate-500 flex items-start gap-1">
                        <span className="text-emerald-500 mt-0.5">✓</span> {r}
                      </li>
                    ))}
                    {match.caveats.map((c, ci) => (
                      <li key={`c-${ci}`} className="text-[11px] text-amber-600 flex items-start gap-1">
                        <span className="mt-0.5">!</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-3 mb-4 leading-snug">{scheme.note}</p>

              <a
                href={scheme.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg py-2 text-center hover:bg-emerald-50 transition-colors mt-auto"
              >
                Apply Now →
              </a>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Note: Scheme terms change periodically and vary by bank/state. Match indicators are
        based on the eligibility rules described above — this page reflects publicly
        available information as of 2026. Always verify current terms on the official
        portal before applying.
      </p>
    </div>
  );
}
