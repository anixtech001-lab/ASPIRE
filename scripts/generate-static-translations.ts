// Fills in every scheduled-language dictionary in lib/i18n/translations.ts
// by calling Bhashini once per language (all ~90 UI keys batched into a
// SINGLE API call per language — 21 calls total, not 21 x 90).
//
// USAGE (after adding BHASHINI_USER_ID / BHASHINI_API_KEY to .env.local):
//   npx tsx --env-file=.env.local scripts/generate-static-translations.ts
//
// If your Node version is older than 20.6 (no --env-file support), install
// dotenv instead (`npm install -D dotenv`) and run:
//   node -r dotenv/config ./node_modules/.bin/tsx scripts/generate-static-translations.ts
//
// Safe to re-run any time new keys are added to the `en` dictionary — it
// only re-translates keys that are missing from a language's dictionary,
// so it won't overwrite anything you've hand-corrected.
//
// This only touches lib/i18n/translations.ts (static UI labels). The
// AI-generated report content is translated live at request time via
// /api/translate — see lib/i18n/reportTranslation.ts — and needs no script.

import { writeFileSync } from "fs";
import { join } from "path";
import { translations } from "../lib/i18n/translations";
import { LANGUAGES } from "../lib/i18n/languages";
import { translateBatch } from "../lib/bhashini";

const OUTPUT_PATH = join(__dirname, "..", "lib", "i18n", "translations.ts");
const EN_KEYS = Object.keys(translations.en);

function serializeDict(dict: Record<string, string>): string {
  // Preserve English key order for every language so diffs stay readable.
  const ordered: Record<string, string> = {};
  EN_KEYS.forEach((k) => {
    if (dict[k] !== undefined) ordered[k] = dict[k];
  });
  return JSON.stringify(ordered, null, 4).replace(/\n/g, "\n    ");
}

async function main() {
  if (!process.env.BHASHINI_USER_ID || !process.env.BHASHINI_API_KEY) {
    console.error(
      "BHASHINI_USER_ID / BHASHINI_API_KEY not set. Add them to .env.local and run with --env-file=.env.local"
    );
    process.exit(1);
  }

  const results: Record<string, Record<string, string>> = { en: translations.en, hi: translations.hi };

  for (const { code } of LANGUAGES) {
    if (code === "en" || code === "hi") continue; // already hand-written

    const existing = translations[code] ?? {};
    const missingKeys = EN_KEYS.filter((k) => !existing[k]);

    if (missingKeys.length === 0) {
      console.log(`[${code}] already complete, skipping`);
      results[code] = existing;
      continue;
    }

    console.log(`[${code}] translating ${missingKeys.length} keys…`);
    const englishValues = missingKeys.map((k) => translations.en[k]);

    try {
      const translatedValues = await translateBatch({
        texts: englishValues,
        sourceLang: "en",
        targetLang: code,
      });

      const merged = { ...existing };
      missingKeys.forEach((k, i) => {
        merged[k] = translatedValues[i] || translations.en[k];
      });
      results[code] = merged;

      const failedCount = translatedValues.filter((v, i) => v === englishValues[i]).length;
      if (failedCount === missingKeys.length) {
        console.warn(`[${code}] Bhashini returned no translations (check credentials/coverage) — left as English fallback`);
      } else {
        console.log(`[${code}] done`);
      }
    } catch (err) {
      console.error(`[${code}] failed, leaving as English fallback:`, err);
      results[code] = existing;
    }

    // Be polite to the API between languages.
    await new Promise((r) => setTimeout(r, 300));
  }

  const fileContent = `// Static UI-string translations — no third-party DOM manipulation, no
// external script dependency, no browser-banner conflicts.
//
// Language list lives in ./languages.ts (single source of truth). This file
// only holds the actual key->string dictionaries.
//
// AUTO-GENERATED for languages other than en/hi by
// scripts/generate-static-translations.ts — re-run that script (after
// adding new keys to \`en\` below) rather than hand-editing the generated
// dictionaries directly, or your edits will be overwritten next run.

import { Lang, LANGUAGES as LANGUAGE_INFOS } from "./languages";

export type { Lang };

export const LANGUAGES = LANGUAGE_INFOS.map((l) => ({ code: l.code, label: l.label }));

export const translations: Record<Lang, Record<string, string>> = {
${LANGUAGES.map((l) => `    ${l.code}: ${serializeDict(results[l.code] ?? {})},`).join("\n")}
};
`;

  writeFileSync(OUTPUT_PATH, fileContent, "utf-8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
}

main();
