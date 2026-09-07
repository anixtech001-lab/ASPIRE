import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export interface AdvisorInput {
  location: string;
  state: string;
  businessCategory: string;
  marginCapital: number;
  experience: string;
  motivation: string;
}

// ---------------------------------------------------------------------------
// Rich, chart-ready feasibility report schema. Every qualitative field
// (summaries, reasoning) comes from the LLM; the numeric estimates below are
// ALSO LLM-generated (plausible regional estimates, same as the text), never
// pulled from a real data source — they exist so the UI can chart them, not
// because they're verified figures. Financial numbers (project cost, EMI,
// loan amount) are NEVER part of this — those come only from
// financialEngine.ts's deterministic math.
// ---------------------------------------------------------------------------

export interface MarketReachData {
  summary: string;
  population5km: number;
  population10km: number;
  channels: string[];
}

export interface OpportunityCard {
  title: string;
  description: string;
}

export type RiskSeverity = "Low" | "Medium" | "High";

export interface RiskItem {
  name: string;
  severity: RiskSeverity;
}

export interface ThreatsData {
  summary: string;
  risks: RiskItem[];
}

export interface CompetitorMappingData {
  summary: string;
  saturationLevel: RiskSeverity;
}

export interface ProductMarketValueData {
  summary: string;
  suggestedPrice: number;
  regionalAveragePrice: number;
  unit: string;
}

export interface FeasibilityReport {
  marketReach: MarketReachData;
  opportunityAnalysis: OpportunityCard[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  threatsIdentification: ThreatsData;
  competitorMapping: CompetitorMappingData;
  productMarketValue: ProductMarketValueData;

  executiveSummary: string;
  feasibilityScore: number;
  marketDemand: RiskSeverity;
  riskLevel: "Low" | "Medium" | "High" | "Low to Medium";
}

const SYSTEM_PROMPT = `You are a rural business consultant AI for India. You analyze
hyper-local micro-enterprise opportunities for first-time entrepreneurs, grounded in
plausible, specific Indian rural/semi-urban economic context. Never give generic
startup advice — always tie your answer to the specific village/district and
business type given. Where a numeric estimate is requested, give a specific
plausible number appropriate to the location's scale — never leave it as 0 or a
placeholder.

Respond ONLY with valid JSON, no markdown fences, no commentary, matching exactly
this structure:

{
  "marketReach": {
    "summary": "string - 1-2 sentences on reach and distribution",
    "population5km": number,
    "population10km": number,
    "channels": ["string", ...]
  },
  "opportunityAnalysis": [
    { "title": "short string", "description": "1-2 sentence string" },
    { "title": "short string", "description": "1-2 sentence string" }
  ],
  "swot": {
    "strengths": ["string", ...],
    "weaknesses": ["string", ...],
    "opportunities": ["string", ...],
    "threats": ["string", ...]
  },
  "threatsIdentification": {
    "summary": "string - 1-2 sentences",
    "risks": [
      { "name": "short risk name", "severity": "Low" | "Medium" | "High" },
      { "name": "short risk name", "severity": "Low" | "Medium" | "High" }
    ]
  },
  "competitorMapping": {
    "summary": "string - 1-2 sentences",
    "saturationLevel": "Low" | "Medium" | "High"
  },
  "productMarketValue": {
    "summary": "string - 1-2 sentences",
    "suggestedPrice": number,
    "regionalAveragePrice": number,
    "unit": "string, e.g. 'per litre' or 'per unit'"
  },
  "executiveSummary": "2-3 sentence plain-language summary",
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

function coerceSeverity(v: any, fallback: RiskSeverity = "Medium"): RiskSeverity {
  return ["Low", "Medium", "High"].includes(v) ? v : fallback;
}

function normalizeReport(raw: any): FeasibilityReport {
  // The LLM can omit or malform any field even in json_object mode — every
  // field gets a safe fallback so the chart-heavy UI never crashes.
  const marketReach: MarketReachData = {
    summary: typeof raw?.marketReach?.summary === "string" ? raw.marketReach.summary : "Not available for this analysis.",
    population5km: typeof raw?.marketReach?.population5km === "number" ? raw.marketReach.population5km : 0,
    population10km: typeof raw?.marketReach?.population10km === "number" ? raw.marketReach.population10km : 0,
    channels: Array.isArray(raw?.marketReach?.channels) ? raw.marketReach.channels : [],
  };

  const opportunityAnalysis: OpportunityCard[] = Array.isArray(raw?.opportunityAnalysis)
    ? raw.opportunityAnalysis
      .filter((o: any) => o && typeof o.title === "string")
      .map((o: any) => ({ title: o.title, description: typeof o.description === "string" ? o.description : "" }))
    : [];

  const swot = {
    strengths: Array.isArray(raw?.swot?.strengths) ? raw.swot.strengths : [],
    weaknesses: Array.isArray(raw?.swot?.weaknesses) ? raw.swot.weaknesses : [],
    opportunities: Array.isArray(raw?.swot?.opportunities) ? raw.swot.opportunities : [],
    threats: Array.isArray(raw?.swot?.threats) ? raw.swot.threats : [],
  };

  const threatsIdentification: ThreatsData = {
    summary: typeof raw?.threatsIdentification?.summary === "string" ? raw.threatsIdentification.summary : "Not available for this analysis.",
    risks: Array.isArray(raw?.threatsIdentification?.risks)
      ? raw.threatsIdentification.risks
        .filter((r: any) => r && typeof r.name === "string")
        .map((r: any) => ({ name: r.name, severity: coerceSeverity(r.severity) }))
      : [],
  };

  const competitorMapping: CompetitorMappingData = {
    summary: typeof raw?.competitorMapping?.summary === "string" ? raw.competitorMapping.summary : "Not available for this analysis.",
    saturationLevel: coerceSeverity(raw?.competitorMapping?.saturationLevel),
  };

  const productMarketValue: ProductMarketValueData = {
    summary: typeof raw?.productMarketValue?.summary === "string" ? raw.productMarketValue.summary : "Not available for this analysis.",
    suggestedPrice: typeof raw?.productMarketValue?.suggestedPrice === "number" ? raw.productMarketValue.suggestedPrice : 0,
    regionalAveragePrice: typeof raw?.productMarketValue?.regionalAveragePrice === "number" ? raw.productMarketValue.regionalAveragePrice : 0,
    unit: typeof raw?.productMarketValue?.unit === "string" ? raw.productMarketValue.unit : "per unit",
  };

  return {
    marketReach,
    opportunityAnalysis,
    swot,
    threatsIdentification,
    competitorMapping,
    productMarketValue,
    executiveSummary: typeof raw?.executiveSummary === "string" ? raw.executiveSummary : "Summary not available.",
    feasibilityScore:
      typeof raw?.feasibilityScore === "number" && raw.feasibilityScore >= 0 && raw.feasibilityScore <= 100
        ? raw.feasibilityScore
        : 50,
    marketDemand: coerceSeverity(raw?.marketDemand),
    riskLevel: ["Low", "Medium", "High", "Low to Medium"].includes(raw?.riskLevel) ? raw.riskLevel : "Medium",
  };
}

export async function generateFeasibilityReport(input: AdvisorInput): Promise<FeasibilityReport> {
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
// Micro-Assistant — bounded, pre-defined quick-question feature (unchanged
// from before — not part of this rich-report upgrade).
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
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content?.trim() || "Sorry, couldn't generate an answer right now — please try again.";
}

// ---------------------------------------------------------------------------
// Compare Ideas — ranks multiple saved reports and recommends the best one.
// IMPORTANT: the LLM only produces the qualitative ranking/reasoning below.
// It never sees or recalculates money figures — projectCost/loanAmount here
// are passed in purely as context for its reasoning; the actual numbers
// displayed anywhere in the UI always come straight from financialEngine.ts.
// ---------------------------------------------------------------------------
export interface CompareIdeaInput {
  id: string;
  businessCategory: string;
  location: string;
  projectCost: number;
  loanAmount: number;
  scheme: string;
  marketSaturation: string;
  feasibilityScore: number;
  swotSummary: string;
}

export interface CompareRankingItem {
  ideaId: string;
  rank: number;
  viabilityScore: number;
  reasoning: string;
}

export interface CompareResult {
  ranking: CompareRankingItem[];
  recommendedIdeaId: string;
  recommendationSummary: string;
}

const COMPARE_SYSTEM_PROMPT = `You are a business consultant AI. Compare business ideas that
the same user is considering, and recommend the single best one. For each idea, give a
viability score out of 100 based on: market opportunity, financial feasibility, risk level,
and local demand — using the data given, not invented figures.

Respond ONLY with valid JSON, no markdown fences, no commentary, matching exactly:

{
  "ranking": [
    { "ideaId": "string", "rank": number, "viabilityScore": number, "reasoning": "short 1-2 sentence explanation" }
  ],
  "recommendedIdeaId": "string",
  "recommendationSummary": "2-3 sentence explanation of why this is the overall best choice, referencing specific factors"
}`;

function normalizeCompareResult(raw: any, ideaIds: string[]): CompareResult {
  const validIds = new Set(ideaIds);

  let ranking: CompareRankingItem[] = Array.isArray(raw?.ranking)
    ? raw.ranking
      .filter((r: any) => r && validIds.has(r.ideaId))
      .map((r: any) => ({
        ideaId: r.ideaId,
        rank: typeof r.rank === "number" ? r.rank : 0,
        viabilityScore: typeof r.viabilityScore === "number" ? r.viabilityScore : 50,
        reasoning: typeof r.reasoning === "string" ? r.reasoning : "",
      }))
    : [];

  // Fill in any idea the model dropped, so every idea always appears.
  const rankedIds = new Set(ranking.map((r) => r.ideaId));
  ideaIds.forEach((id) => {
    if (!rankedIds.has(id)) {
      ranking.push({ ideaId: id, rank: ranking.length + 1, viabilityScore: 50, reasoning: "No specific reasoning generated." });
    }
  });

  ranking.sort((a, b) => a.rank - b.rank);

  const recommendedIdeaId = validIds.has(raw?.recommendedIdeaId) ? raw.recommendedIdeaId : ranking[0]?.ideaId ?? ideaIds[0];

  return {
    ranking,
    recommendedIdeaId,
    recommendationSummary:
      typeof raw?.recommendationSummary === "string" ? raw.recommendationSummary : "Recommendation summary not available.",
  };
}

export async function compareIdeas(ideas: CompareIdeaInput[]): Promise<CompareResult> {
  const ideaIds = ideas.map((i) => i.id);

  const userPrompt = `Ideas:\n${ideas
    .map(
      (idea, i) => `${i + 1}. ID: ${idea.id}
   Business: ${idea.businessCategory} in ${idea.location}
   Project Cost: ₹${idea.projectCost}
   Loan Amount: ₹${idea.loanAmount}
   Matched Scheme: ${idea.scheme}
   Market Saturation: ${idea.marketSaturation}
   Feasibility Score: ${idea.feasibilityScore}/100
   Key SWOT points: ${idea.swotSummary}`
    )
    .join("\n\n")}

Rank these ideas and recommend the best one. Generate the JSON now.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: COMPARE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    return normalizeCompareResult(JSON.parse(raw), ideaIds);
  } catch {
    const retry = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: COMPARE_SYSTEM_PROMPT + "\n\nReturn ONLY valid JSON. No exceptions." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const retryRaw = retry.choices[0]?.message?.content ?? "{}";
    return normalizeCompareResult(JSON.parse(retryRaw), ideaIds);
  }
}
