// Deterministic, rule-based scheme eligibility matching — NOT an LLM call.
// Eligibility is a factual/rules question (does your project cost fall in
// this range? does your category qualify?), so it belongs here alongside
// the rest of the financial engine, not in a Groq prompt.

import { BusinessDetails } from "./BusinessContext";

export interface SchemeCriteria {
  targetCategories: string[] | "any";
  minProjectCost: number;
  maxProjectCost: number;
  /** Eligibility condition we cannot verify from the form (e.g. caste/gender
   * category) — when present, the match can never be labeled "Strong
   * Match" even if category+cost line up, since real eligibility genuinely
   * depends on something we don't know. */
  specialEligibility?: string;
}

export type MatchLabel = "Strong Match" | "Check Conditions" | "Likely Not Applicable";

export interface SchemeMatchResult {
  score: number; // 0-100, internal ranking value
  matchLabel: MatchLabel;
  reasons: string[];
  caveats: string[];
}

export function matchScheme(
  details: BusinessDetails,
  projectCost: number,
  criteria: SchemeCriteria
): SchemeMatchResult {
  const reasons: string[] = [];
  const caveats: string[] = [];
  let score = 0;

  const categoryEligible =
    criteria.targetCategories === "any" ||
    criteria.targetCategories.some((c) => c.toLowerCase() === details.businessCategory.toLowerCase());

  if (categoryEligible) {
    score += 50;
    reasons.push(
      criteria.targetCategories === "any"
        ? `Your business category (${details.businessCategory}) falls under this scheme's broad coverage`
        : `Your business category (${details.businessCategory}) is directly targeted by this scheme`
    );
  } else {
    caveats.push(`This scheme doesn't typically cover the ${details.businessCategory} category`);
  }

  const costEligible = projectCost >= criteria.minProjectCost && projectCost <= criteria.maxProjectCost;
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  if (costEligible) {
    score += 50;
    reasons.push(
      `Your project cost (${fmt(projectCost)}) is within this scheme's range (up to ${fmt(criteria.maxProjectCost)})`
    );
  } else if (projectCost < criteria.minProjectCost) {
    caveats.push(`Your project cost (${fmt(projectCost)}) is below this scheme's typical minimum (${fmt(criteria.minProjectCost)})`);
  } else {
    caveats.push(`Your project cost (${fmt(projectCost)}) exceeds this scheme's ceiling of ${fmt(criteria.maxProjectCost)}`);
  }

  if (criteria.specialEligibility) {
    caveats.push(`Also requires: ${criteria.specialEligibility} — we don't collect this in your profile yet, so confirm directly`);
  }

  let matchLabel: MatchLabel;
  if (score >= 100 && !criteria.specialEligibility) {
    matchLabel = "Strong Match";
  } else if (score >= 50) {
    matchLabel = "Check Conditions";
  } else {
    matchLabel = "Likely Not Applicable";
  }

  return { score, matchLabel, reasons, caveats };
}
