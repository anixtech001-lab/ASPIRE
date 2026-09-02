import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

export async function generateFeasibilityReport(
  input: AdvisorInput
): Promise<FeasibilityReport> {
  const userPrompt = buildUserPrompt(input);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(raw) as FeasibilityReport;
  } catch {
    // Retry once with a stricter instruction if the model returns malformed JSON.
    // Always validate before rendering — never trust raw LLM output.
    const retry = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\nReturn ONLY valid JSON. No exceptions." },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });
    const retryRaw = retry.choices[0]?.message?.content ?? "{}";
    return JSON.parse(retryRaw) as FeasibilityReport;
  }
}
