"use client";

import { useMemo } from "react";
import { FeasibilityReport } from "@/lib/ai";
import { Lang } from "./languages";
import { useBatchTranslate } from "./useBatchTranslate";

type StringMap = Record<string, string>;

// Flattens every translatable (free-text) string in a FeasibilityReport into
// a flat key->value map. Enum-like fields (marketDemand, severity levels,
// saturationLevel) are deliberately NOT included here — those are rendered
// via t("report.severity.<value>") in the UI instead, so they stay reliable
// fixed values rather than round-tripping through translation. riskLevel IS
// included since it can be the free-form "Low to Medium", not just a plain
// enum value.
function flattenReport(report: FeasibilityReport): StringMap {
  const map: StringMap = {};
  map["executiveSummary"] = report.executiveSummary;
  map["riskLevel"] = report.riskLevel;
  map["marketReach.summary"] = report.marketReach.summary;
  report.marketReach.channels.forEach((c, i) => {
    map[`marketReach.channels.${i}`] = c;
  });
  report.opportunityAnalysis.forEach((o, i) => {
    map[`opportunityAnalysis.${i}.title`] = o.title;
    map[`opportunityAnalysis.${i}.description`] = o.description;
  });
  (["strengths", "weaknesses", "opportunities", "threats"] as const).forEach((k) => {
    report.swot[k].forEach((v, i) => {
      map[`swot.${k}.${i}`] = v;
    });
  });
  map["threatsIdentification.summary"] = report.threatsIdentification.summary;
  report.threatsIdentification.risks.forEach((r, i) => {
    map[`threatsIdentification.risks.${i}.name`] = r.name;
  });
  map["competitorMapping.summary"] = report.competitorMapping.summary;
  map["productMarketValue.summary"] = report.productMarketValue.summary;
  map["productMarketValue.unit"] = report.productMarketValue.unit;
  return map;
}

// Reassembles a FeasibilityReport, swapping in translated text wherever the
// map has an entry and falling back to the original English value for
// anything missing (partial translation failure never blanks out content).
function applyTranslatedMap(report: FeasibilityReport, map: StringMap): FeasibilityReport {
  return {
    ...report,
    executiveSummary: map["executiveSummary"] ?? report.executiveSummary,
    riskLevel: (map["riskLevel"] ?? report.riskLevel) as FeasibilityReport["riskLevel"],
    marketReach: {
      ...report.marketReach,
      summary: map["marketReach.summary"] ?? report.marketReach.summary,
      channels: report.marketReach.channels.map((c, i) => map[`marketReach.channels.${i}`] ?? c),
    },
    opportunityAnalysis: report.opportunityAnalysis.map((o, i) => ({
      title: map[`opportunityAnalysis.${i}.title`] ?? o.title,
      description: map[`opportunityAnalysis.${i}.description`] ?? o.description,
    })),
    swot: {
      strengths: report.swot.strengths.map((v, i) => map[`swot.strengths.${i}`] ?? v),
      weaknesses: report.swot.weaknesses.map((v, i) => map[`swot.weaknesses.${i}`] ?? v),
      opportunities: report.swot.opportunities.map((v, i) => map[`swot.opportunities.${i}`] ?? v),
      threats: report.swot.threats.map((v, i) => map[`swot.threats.${i}`] ?? v),
    },
    threatsIdentification: {
      summary: map["threatsIdentification.summary"] ?? report.threatsIdentification.summary,
      risks: report.threatsIdentification.risks.map((r, i) => ({
        ...r,
        name: map[`threatsIdentification.risks.${i}.name`] ?? r.name,
      })),
    },
    competitorMapping: {
      ...report.competitorMapping,
      summary: map["competitorMapping.summary"] ?? report.competitorMapping.summary,
    },
    productMarketValue: {
      ...report.productMarketValue,
      summary: map["productMarketValue.summary"] ?? report.productMarketValue.summary,
      unit: map["productMarketValue.unit"] ?? report.productMarketValue.unit,
    },
  };
}

/**
 * Returns a display-only translated copy of the report (one Bhashini batch
 * call per report+language, cached in sessionStorage). The original English
 * `report` object is never mutated — keep using it for the PDF/.txt
 * downloads and anywhere the code needs the raw English text.
 */
export function useTranslatedReport(report: FeasibilityReport | null, lang: Lang) {
  const map = useMemo(() => (report ? flattenReport(report) : null), [report]);
  const { translated, loading } = useBatchTranslate(map, lang);

  const translatedReport = useMemo(() => {
    if (!report) return report;
    if (!translated) return report;
    return applyTranslatedMap(report, translated);
  }, [report, translated]);

  return { report: translatedReport, loading };
}
