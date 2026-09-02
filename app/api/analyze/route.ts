import { NextRequest, NextResponse } from "next/server";
import { generateFeasibilityReport, AdvisorInput } from "@/lib/ai";
import { calculateFullFinancialPlan } from "@/lib/financialEngine";

// POST /api/analyze
// Takes business details + margin capital, returns:
//  1. AI-generated feasibility report (Groq) — 6 spec-required sections + dashboard extras
//  2. Deterministic financial structuring plan (zero-AI, always exact)
export async function POST(req: NextRequest) {
  try {
    const body: AdvisorInput = await req.json();

    if (!body.location || !body.businessCategory || !body.marginCapital) {
      return NextResponse.json(
        { error: "location, businessCategory, and marginCapital are required" },
        { status: 400 }
      );
    }

    // Financial plan never depends on AI succeeding — always computed first.
    const financialPlan = calculateFullFinancialPlan(body.marginCapital);

    let feasibilityReport;
    try {
      feasibilityReport = await generateFeasibilityReport(body);
    } catch (err) {
      console.error("[api/analyze] Groq call failed:", err);
      return NextResponse.json(
        {
          financialPlan,
          feasibilityReport: null,
          warning: "AI feasibility report could not be generated. Financial plan is still valid.",
        },
        { status: 207 } // partial success
      );
    }

    return NextResponse.json({ financialPlan, feasibilityReport });
  } catch (err) {
    console.error("[api/analyze] unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
