"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBusiness } from "@/lib/BusinessContext";
import { calculateFullFinancialPlan } from "@/lib/financialEngine";
import { matchScheme, MatchLabel } from "@/lib/schemeMatching";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import SchemeDetailModal from "@/components/SchemeDetailModal";
import { SCHEMES, SchemeInfo } from "@/lib/schemesData";

const LABEL_STYLE: Record<MatchLabel, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  "Strong Match": { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  "Check Conditions": { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle },
  "Likely Not Applicable": { bg: "bg-slate-100", text: "text-slate-500", icon: XCircle },
};

export default function SchemesPage() {
  const { businessDetails, financialPlan } = useBusiness();
  const [openScheme, setOpenScheme] = useState<SchemeInfo | null>(null);

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

  const getDefaultPrincipal = (scheme: SchemeInfo) => {
    const loanAmount = financialPlan?.details.loanAmount;
    const fallback = scheme.criteria.maxProjectCost / 3;
    const base = loanAmount && loanAmount > 0 ? loanAmount : fallback;
    return Math.min(Math.round(base), scheme.criteria.maxProjectCost);
  };

  const openSchemeMatch = openScheme
    ? ranked?.find((r) => r.scheme.name === openScheme.name)?.match ?? null
    : null;

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

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setOpenScheme(scheme)}
                  className="flex-1 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg py-2 text-center hover:bg-slate-50 transition-colors"
                >
                  View Details &amp; EMI
                </button>
                <a
                  href={scheme.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg py-2 text-center hover:bg-emerald-50 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
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

      {openScheme && (
        <SchemeDetailModal
          name={openScheme.name}
          desc={openScheme.desc}
          note={openScheme.note}
          applyUrl={openScheme.applyUrl}
          emiDefaults={openScheme.emiDefaults}
          defaultPrincipal={getDefaultPrincipal(openScheme)}
          maxPrincipal={openScheme.criteria.maxProjectCost}
          match={openSchemeMatch}
          onClose={() => setOpenScheme(null)}
        />
      )}
    </div>
  );
}
