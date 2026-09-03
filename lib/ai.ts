import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// llama-3.3-70b-versatile was deprecated by Groq on 17 June 2026 and fully
// decommissioned on 16 August 2026 — using it now returns an error on every
// call. Groq's recommended replacement is openai/gpt-oss-120b. Configurable
// via env var so a future Groq deprecation doesn't require a code change —
// just update GROQ_MODEL in Vercel's environment variables.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export interface AdvisorInput {
  location: string;
  state: string;
  businessCategory: string;
  marginCapital: number;
  experience: string;
  motivation: string;
}

// The 6 sections below are EXACTLY what the SIH26091 spec requires.
// feasibilityScore / marketDemand / riskLevel / executiveSummary are
// additive extras (not in the spec) kept only so the Dashboard stat cards
// still have something to show — safe to ignore/remove if you want a
// strictly spec-only response shape.
export interface FeasibilityReport {
  marketReach: string;
  opportunityAnalysis: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  threatsIdentification: string;
  competitorMapping: string;
  productMarketValue: string;

  // --- additive, non-spec fields (dashboard UX continuity) ---
  executiveSummary: string;
  feasibilityScore: number; // 0-100
  marketDemand: "Low" | "Medium" | "High";
  riskLevel: "Low" | "Medium" | "High" | "Low to Medium";
}

const SYSTEM_PROMPT = `You are a rural business consultant AI for India. You analyze
hyper-local micro-enterprise opportunities for first-time entrepreneurs, grounded in
plausible, specific Indian rural/semi-urban economic context. Never give generic
startup advice — always tie your answer to the specific village/district and
business type given.

Respond ONLY with valid JSON, no markdown fences, no commentary, matching exactly
this structure:

{
  "marketReach": "string - estimated consumer base within 5-10km radius and primary distribution channels",
  "opportunityAnalysis": "string - underserved niches for this business type in this local economy",
  "swot": {
    "strengths": ["string", ...],
    "weaknesses": ["string", ...],
    "opportunities": ["string", ...],
    "threats": ["string", ...]
  },
  "threatsIdentification": "string - specific local risks: supply chain, seasonality, single-buyer dependency",
  "competitorMapping": "string - estimated density of similar existing businesses in this area",
  "productMarketValue": "string - suggested pricing strategy based on regional purchasing power",
  "executiveSummary": "2-3 sentence plain-language summary of the opportunity",
  "feasibilityScore": number (0-100),
  "marketDemand": "Low" | "Medium" | "High",
  "riskLevel": "Low" | "Medium" | "High" | "Low to Medium"
}`;

function buildUserPrompt(input: AdvisorInput): string {
  return `Analyze this business opportunity:

Location: ${input.location}, ${input.state}
Available Margin Capital: ₹${input.marginCapital}
Business Category: ${input.businessCategory}
Applicant Experience: ${input.experience}
Motivation: ${input.motivation}

Be specific to this location and business type. Generate the JSON report now.`;
}

function normalizeReport(raw: any): FeasibilityReport {
  // Groq's json_object mode (used here) guarantees valid JSON syntax, but
  // NOT that every key we asked for is actually present — the model can
  // still omit a field. Without this normalization, a missing `swot` or
  // `marketReach` would crash the report page with a client-side exception
  // the moment the UI tries to read it. Every field gets a safe fallback.
  return {
    marketReach: typeof raw?.marketReach === "string" ? raw.marketReach : "Not available for this analysis.",
    opportunityAnalysis:
      typeof raw?.opportunityAnalysis === "string" ? raw.opportunityAnalysis : "Not available for this analysis.",
    swot: {
      strengths: Array.isArray(raw?.swot?.strengths) ? raw.swot.strengths : [],
      weaknesses: Array.isArray(raw?.swot?.weaknesses) ? raw.swot.weaknesses : [],
      opportunities: Array.isArray(raw?.swot?.opportunities) ? raw.swot.opportunities : [],
      threats: Array.isArray(raw?.swot?.threats) ? raw.swot.threats : [],
    },
    threatsIdentification:
      typeof raw?.threatsIdentification === "string" ? raw.threatsIdentification : "Not available for this analysis.",
    competitorMapping:
      typeof raw?.competitorMapping === "string" ? raw.competitorMapping : "Not available for this analysis.",
    productMarketValue:
      typeof raw?.productMarketValue === "string" ? raw.productMarketValue : "Not available for this analysis.",
    executiveSummary:
      typeof raw?.executiveSummary === "string" ? raw.executiveSummary : "Summary not available.",
    feasibilityScore:
      typeof raw?.feasibilityScore === "number" && raw.feasibilityScore >= 0 && raw.feasibilityScore <= 100
        ? raw.feasibilityScore
        : 50,
    marketDemand: ["Low", "Medium", "High"].includes(raw?.marketDemand) ? raw.marketDemand : "Medium",
    riskLevel: ["Low", "Medium", "High", "Low to Medium"].includes(raw?.riskLevel) ? raw.riskLevel : "Medium",
  };
}

export async function generateFeasibilityReport(
  input: AdvisorInput
): Promise<FeasibilityReport> {
  const userPrompt = buildUserPrompt(input);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    return normalizeReport(JSON.parse(raw));
  } catch {
    // Retry once with a stricter instruction if the model returns malformed JSON.
    // Always validate before rendering — never trust raw LLM output.
    const retry = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\nReturn ONLY valid JSON. No exceptions." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const retryRaw = retry.choices[0]?.message?.content ?? "{}";
    return normalizeReport(JSON.parse(retryRaw));
  }
}

// ---------------------------------------------------------------------------
// Micro-Assistant — bounded, pre-defined quick-question feature on the
// report page. Deliberately NOT a free-text chatbot: only these 3 fixed
// questions are ever sent, so responses stay short, predictable, and safe
// for a live demo (no open-ended input means no unpredictable/off-topic
// model output in front of judges).
// ---------------------------------------------------------------------------
export type QuickQuestionId = "raw_material" | "emi_default" | "licenses";

export const QUICK_QUESTIONS: Record<QuickQuestionId, string> = {
  raw_material: "Mujhe saste mein raw material kahan se milega?",
  emi_default: "Agar main pehle mahine EMI na de paun toh kya hoga?",
  licenses: "Is business ko shuru karne ke liye kaun-kaun se license chahiye?",
};

export interface QuickAdviceContext {
  businessCategory: string;
  location: string;
  state: string;
}

const QUICK_ADVICE_SYSTEM_PROMPT = `You are a practical business assistant for Indian rural
micro-entrepreneurs. Answer in simple Hinglish (Hindi-English mix), 3-5 short sentences max,
no headers or markdown formatting — plain conversational text only. Be concrete and specific
to the business type and location given. For anything involving money, loans, or legal
requirements, give general practical guidance and clearly suggest confirming exact
details with the relevant bank/Channel Partner or local authority — never state exact
penalty amounts, interest figures, or legal requirements as guaranteed fact.`;

export async function generateQuickAdvice(
  questionId: QuickQuestionId,
  context: QuickAdviceContext
): Promise<string> {
  const question = QUICK_QUESTIONS[questionId];

  const userPrompt = `Business: ${context.businessCategory} in ${context.location}, ${context.state}

Question: ${question}

Answer this specific question directly, in the context of this business and location.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: QUICK_ADVICE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 300, // keeps answers short by design — this is a quick-tip widget, not a chat
  });

  return completion.choices[0]?.message?.content?.trim() || "Sorry, couldn't generate an answer right now — please try again.";
}
