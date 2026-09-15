"use client";

// Translates DYNAMIC content (AI-generated report text, quick-advice
// answers — anything that isn't a fixed UI label) via Bhashini, batched into
// a single /api/translate call no matter how many strings are passed.
//
// For fixed UI labels (buttons, headings, nav items) use `t()` from
// LanguageContext instead — those are pre-translated ahead of time by
// scripts/generate-static-translations.ts and don't need a live API call.
//
// IMPORTANT: `values` must be referentially stable across re-renders (e.g.
// come straight from a context/useState that only changes when new content
// is actually generated) — wrap it in useMemo if you build the object
// inline, otherwise this will re-request on every render.

import { useEffect, useRef, useState } from "react";
import { Lang } from "./languages";

type StringMap = Record<string, string>;

function cacheKey(lang: Lang, values: StringMap): string {
  const sorted = Object.keys(values)
    .sort()
    .map((k) => `${k}:${values[k]}`)
    .join("|");
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = (hash * 31 + sorted.charCodeAt(i)) | 0;
  }
  return `aspire_translate_${lang}_${hash}`;
}

export function useBatchTranslate(values: StringMap | null, lang: Lang) {
  const [translated, setTranslated] = useState<StringMap | null>(values);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (!values || Object.keys(values).length === 0) {
      setTranslated(values);
      return;
    }

    if (lang === "en") {
      setTranslated(values);
      return;
    }

    const key = cacheKey(lang, values);
    try {
      const cached = window.sessionStorage.getItem(key);
      if (cached) {
        setTranslated(JSON.parse(cached));
        return;
      }
    } catch {
      // sessionStorage unavailable (private mode etc.) — fall through to a live call
    }

    const myRequestId = ++requestId.current;
    const keys = Object.keys(values);
    const texts = keys.map((k) => values[k]);

    setLoading(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, sourceLang: "en", targetLang: lang }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (myRequestId !== requestId.current) return; // a newer request superseded this one
        const translatedTexts: string[] = Array.isArray(data?.translated) ? data.translated : texts;
        const result: StringMap = {};
        keys.forEach((k, i) => {
          result[k] = translatedTexts[i] ?? values[k];
        });
        setTranslated(result);
        try {
          window.sessionStorage.setItem(key, JSON.stringify(result));
        } catch {
          // storage full/unavailable — translation still works, just not cached
        }
      })
      .catch(() => {
        if (myRequestId !== requestId.current) return;
        setTranslated(values); // safe fallback: show English rather than nothing
      })
      .finally(() => {
        if (myRequestId === requestId.current) setLoading(false);
      });
  }, [lang, values]);

  return { translated: translated ?? values, loading };
}
