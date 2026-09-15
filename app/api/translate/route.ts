import { NextResponse } from "next/server";
import { translateBatch } from "@/lib/bhashini";
import { isValidLang } from "@/lib/i18n/languages";

// Keep individual requests small and cheap. Callers (useBatchTranslate) are
// expected to batch reasonably-sized chunks — this is a hard backstop, not
// the intended usage pattern.
const MAX_TEXTS = 60;
const MAX_TEXT_LENGTH = 2000;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { texts, sourceLang, targetLang } = body ?? {};

  if (!Array.isArray(texts) || texts.some((t) => typeof t !== "string")) {
    return NextResponse.json({ error: "`texts` must be an array of strings" }, { status: 400 });
  }
  if (texts.length === 0) {
    return NextResponse.json({ translated: [] });
  }
  if (texts.length > MAX_TEXTS) {
    return NextResponse.json({ error: `\`texts\` exceeds max batch size of ${MAX_TEXTS}` }, { status: 400 });
  }
  if (texts.some((t) => t.length > MAX_TEXT_LENGTH)) {
    return NextResponse.json({ error: `Each text must be under ${MAX_TEXT_LENGTH} characters` }, { status: 400 });
  }
  if (!isValidLang(sourceLang) || !isValidLang(targetLang)) {
    return NextResponse.json({ error: "Invalid sourceLang/targetLang" }, { status: 400 });
  }

  try {
    const translated = await translateBatch({ texts, sourceLang, targetLang });
    return NextResponse.json({ translated });
  } catch (err) {
    console.error("[api/translate] unexpected failure", err);
    // Same safe-fallback philosophy as bhashini.ts itself — never break the
    // page waiting on translation, just hand back the originals.
    return NextResponse.json({ translated: texts });
  }
}
