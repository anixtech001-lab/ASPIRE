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

export interface FeasibilityReport {
  executiveSummary: string;
  feasibilityScore: number; // 0-100
  marketDemand: "Low" | "Medium" | "High";
  riskLevel: "Low" | "Medium" | "High" | "Low to Medium";
  keyStrengths: string[];
  marketReach: { radiusKm: number; estimatedPopulation: string; distributionChannels: string[] };
  opportunityAnalysis: string[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  competitorDensity: { level: "Low" | "Medium" | "High"; reasoning: string };
  pricingStrategy: { suggestedPriceRange: string; reasoning: string };
  recommendations: string[];
}

const SYSTEM_PROMPT = `You are an expert rural business consultant for India, specializing in
hyper-local micro-enterprise feasibility for first-time entrepreneurs. Given a location, business
category, and available capital, produce a structured, realistic feasibility analysis grounded in
plausible Indian rural/semi-urban economic context.

Respond ONLY with valid JSON matching exactly this schema, no markdown fences, no commentary:

{
  "executiveSummary": "2-3 sentence plain-language summary",
  "feasibilityScore": number (0-100),
  "marketDemand": "Low" | "Medium" | "High",
  "riskLevel": "Low" | "Medium" | "High" | "Low to Medium",
  "keyStrengths": ["string", ...],
  "marketReach": {
    "radiusKm": number,
    "estimatedPopulation": "string",
    "distributionChannels": ["string", ...]
  },
  "opportunityAnalysis": ["string", ...],
  "swot": {
    "strengths": ["string", ...],
    "weaknesses": ["string", ...],
    "opportunities": ["string", ...],
    "threats": ["string", ...]
  },
  "competitorDensity": { "level": "Low" | "Medium" | "High", "reasoning": "string" },
  "pricingStrategy": { "suggestedPriceRange": "string", "reasoning": "string" },
  "recommendations": ["string", ...]
}`;

export async function generateFeasibilityReport(
  input: AdvisorInput
): Promise<FeasibilityReport> {
  const userPrompt = `Location: ${input.location}, ${input.state}
Business Category: ${input.businessCategory}
Available Margin Capital: ₹${input.marginCapital}
Applicant Experience: ${input.experience}
Motivation: ${input.motivation}

Generate the feasibility report JSON now.`;

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
    // Retry once with a stricter instruction if the model returns malformed JSON
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
