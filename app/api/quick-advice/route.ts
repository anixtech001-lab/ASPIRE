import { NextRequest, NextResponse } from "next/server";
import { generateQuickAdvice, QuickQuestionId, QUICK_QUESTIONS } from "@/lib/ai";

// POST /api/quick-advice
// Only accepts one of the 3 pre-defined question IDs — never free text.
// This keeps the feature bounded and demo-safe (see lib/ai.ts comments).
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { questionId, businessCategory, location, state } = body;

        if (!questionId || !(questionId in QUICK_QUESTIONS)) {
            return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
        }
        if (!businessCategory || !location || !state) {
            return NextResponse.json(
                { error: "businessCategory, location, and state are required" },
                { status: 400 }
            );
        }

        const answer = await generateQuickAdvice(questionId as QuickQuestionId, {
            businessCategory,
            location,
            state,
        });

        return NextResponse.json({ answer });
    } catch (err) {
        console.error("[api/quick-advice] error:", err);
        return NextResponse.json(
            { error: "Couldn't generate an answer right now. Please try again." },
            { status: 500 }
        );
    }
}
