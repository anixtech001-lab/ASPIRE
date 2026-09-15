// Canonical language list — the single source of truth for every language
// code used across the app (static UI translations, Bhashini API calls,
// the language switcher dropdown). Adding a language later means editing
// ONLY this file — translations.ts, LanguageContext.tsx and bhashini.ts all
// read from here.
//
// Codes follow the ISO-639 series, same as Bhashini's own API
// (https://dibd-bhashini.gitbook.io/bhashini-apis — "Language Code for
// Hindi is hi, English is en, and so on. Bhashini follows ISO-639 series").
//
// NOTE for Ansh: Bhashini's live translation-model coverage can vary per
// language pair (not every one of the 22 scheduled languages necessarily
// has a ready translation model behind every pipeline). Nothing breaks if
// a language isn't supported yet — bhashini.ts already falls back to the
// original English text on any failure, so an unsupported language just
// silently shows English until Bhashini adds coverage. Worth spot-checking
// 2-3 of the less common ones (Santali, Sindhi, Bodo) once credentials are
// in, before demo day.

export type Lang =
  | "en"
  | "hi"
  | "as"
  | "bn"
  | "brx"
  | "doi"
  | "gu"
  | "kn"
  | "ks"
  | "gom"
  | "mai"
  | "ml"
  | "mni"
  | "mr"
  | "ne"
  | "or"
  | "pa"
  | "sa"
  | "sat"
  | "sd"
  | "ta"
  | "te"
  | "ur";

export interface LanguageInfo {
  code: Lang;
  /** Native-script display name, shown in the language switcher */
  label: string;
  /** English name, useful for logs/scripts */
  englishName: string;
}

// English + all 22 languages of the Eighth Schedule of the Constitution.
export const LANGUAGES: LanguageInfo[] = [
  { code: "en", label: "English", englishName: "English" },
  { code: "hi", label: "हिन्दी", englishName: "Hindi" },
  { code: "as", label: "অসমীয়া", englishName: "Assamese" },
  { code: "bn", label: "বাংলা", englishName: "Bengali" },
  { code: "brx", label: "बड़ो", englishName: "Bodo" },
  { code: "doi", label: "डोगरी", englishName: "Dogri" },
  { code: "gu", label: "ગુજરાતી", englishName: "Gujarati" },
  { code: "kn", label: "ಕನ್ನಡ", englishName: "Kannada" },
  { code: "ks", label: "کٲشُر", englishName: "Kashmiri" },
  { code: "gom", label: "कोंकणी", englishName: "Konkani" },
  { code: "mai", label: "मैथिली", englishName: "Maithili" },
  { code: "ml", label: "മലയാളം", englishName: "Malayalam" },
  { code: "mni", label: "মৈতৈলোন্", englishName: "Manipuri (Meitei)" },
  { code: "mr", label: "मराठी", englishName: "Marathi" },
  { code: "ne", label: "नेपाली", englishName: "Nepali" },
  { code: "or", label: "ଓଡ଼ିଆ", englishName: "Odia" },
  { code: "pa", label: "ਪੰਜਾਬੀ", englishName: "Punjabi" },
  { code: "sa", label: "संस्कृतम्", englishName: "Sanskrit" },
  { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ", englishName: "Santali" },
  { code: "sd", label: "سنڌي", englishName: "Sindhi" },
  { code: "ta", label: "தமிழ்", englishName: "Tamil" },
  { code: "te", label: "తెలుగు", englishName: "Telugu" },
  { code: "ur", label: "اردو", englishName: "Urdu" },
];

export const LANGUAGE_CODES: Lang[] = LANGUAGES.map((l) => l.code);

export function isValidLang(value: string | null | undefined): value is Lang {
  return !!value && (LANGUAGE_CODES as string[]).includes(value);
}
