import { NextRequest, NextResponse } from "next/server";
import { compareIdeas, CompareIdeaInput } from "@/lib/ai";

// POST /api/compare
// Takes 2+ idea summaries, returns AI ranking + reasoning. Never
// recalculates money figures — those are passed in as already-computed
// context from financialEngine.ts.
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const ideas: CompareIdeaInput[] = body.ideas;

        if (!Array.isArray(ideas) || ideas.length < 2) {
            return NextResponse.json({ error: "At least 2 ideas are required to compare" }, { status: 400 });
        }

        const result = await compareIdeas(ideas);
        return NextResponse.json(result);
    } catch (err) {
        console.error("[api/compare] error:", err);
        return NextResponse.json({ error: "Couldn't generate a comparison right now. Please try again." }, { status: 500 });
    }
}
