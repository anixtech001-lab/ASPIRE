// Bhashini integration — National Language Translation Mission API.
//
// SETUP NEEDED (Ansh):
// 1. Register at https://bhashini.gov.in/ubhasini/en/signup and get a User ID + Ulca API Key.
// 2. Add to .env.local:
//      BHASHINI_USER_ID=your_user_id
//      BHASHINI_API_KEY=your_ulca_api_key
// 3. Bhashini's actual pipeline requires a two-step call:
//      a) POST to the "pipeline config" endpoint to get task-specific service IDs
//      b) POST to the "compute" endpoint with those service IDs to do the actual
//         translation
//    Their service IDs change per language pair, so step (a) should be cached
//    in production (this file re-fetches it per call for MVP simplicity — a
//    small in-memory cache would be a good next optimization once this is
//    getting real traffic, since the pipeline config rarely changes for a
//    given language pair).
//
// Until BHASHINI_USER_ID / BHASHINI_API_KEY are set, every function below
// returns the original text untouched — the app works end-to-end without
// credentials, it just shows English everywhere.
//
// IMPORTANT: this file is SERVER-ONLY (it reads BHASHINI_API_KEY from
// process.env with no NEXT_PUBLIC_ prefix). Only import it from Server
// Components, Route Handlers, or scripts — never from a "use client" file.
// Client code should call POST /api/translate instead, which wraps this.

import { Lang } from "@/lib/i18n/languages";

const BHASHINI_PIPELINE_URL =
  "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";

// Kept for any external code still importing this name.
export type SupportedLang = Lang;

interface TranslateOptions {
  text: string;
  sourceLang: Lang;
  targetLang: Lang;
}

interface BatchTranslateOptions {
  texts: string[];
  sourceLang: Lang;
  targetLang: Lang;
}

interface PipelineConfig {
  serviceId: string;
  callbackUrl: string;
  inferenceApiKey: { name: string; value: string };
}

async function getPipelineConfig(
  sourceLang: Lang,
  targetLang: Lang,
  userId: string,
  apiKey: string
): Promise<PipelineConfig> {
  const pipelineRes = await fetch(BHASHINI_PIPELINE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      userID: userId,
      ulcaApiKey: apiKey,
    },
    body: JSON.stringify({
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: { sourceLanguage: sourceLang, targetLanguage: targetLang },
          },
        },
      ],
      pipelineRequestConfig: { pipelineId: "64392f96daac500b55c543cd" },
    }),
  });

  if (!pipelineRes.ok) throw new Error("pipeline config fetch failed");
  const pipelineData = await pipelineRes.json();

  const serviceId = pipelineData?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;
  const callbackUrl = pipelineData?.pipelineInferenceAPIEndPoint?.callbackUrl;
  const inferenceApiKey = pipelineData?.pipelineInferenceAPIEndPoint?.inferenceApiKey;

  if (!serviceId || !callbackUrl || !inferenceApiKey) {
    throw new Error("incomplete pipeline config response");
  }

  return { serviceId, callbackUrl, inferenceApiKey };
}

/**
 * Translate a batch of strings in ONE Bhashini API call (one pipeline-config
 * fetch + one compute call, regardless of how many strings are passed).
 * Always use this over calling translateText() in a loop — Bhashini's
 * compute endpoint natively accepts an array of inputs, so batching is both
 * faster and cheaper on API quota.
 *
 * Order is preserved: result[i] is the translation of texts[i]. On any
 * failure (missing credentials, network error, malformed response), the
 * original array is returned unchanged so callers never crash waiting on
 * translation.
 */
export async function translateBatch({
  texts,
  sourceLang,
  targetLang,
}: BatchTranslateOptions): Promise<string[]> {
  if (sourceLang === targetLang || texts.length === 0) return texts;

  const apiKey = process.env.BHASHINI_API_KEY;
  const userId = process.env.BHASHINI_USER_ID;

  if (!apiKey || !userId) {
    console.warn("[bhashini] credentials not set, returning original text");
    return texts;
  }

  try {
    const { serviceId, callbackUrl, inferenceApiKey } = await getPipelineConfig(
      sourceLang,
      targetLang,
      userId,
      apiKey
    );

    const computeRes = await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [inferenceApiKey.name]: inferenceApiKey.value,
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: "translation",
            config: {
              language: { sourceLanguage: sourceLang, targetLanguage: targetLang },
              serviceId,
            },
          },
        ],
        inputData: { input: texts.map((source) => ({ source })) },
      }),
    });

    if (!computeRes.ok) throw new Error("translation compute call failed");
    const computeData = await computeRes.json();

    const output = computeData?.pipelineResponse?.[0]?.output;
    if (!Array.isArray(output) || output.length !== texts.length) {
      throw new Error("translation output shape mismatch");
    }

    return output.map((o: any, i: number) => (typeof o?.target === "string" ? o.target : texts[i]));
  } catch (err) {
    console.error("[bhashini] batch translation failed, falling back to original text", err);
    return texts;
  }
}

/** Translate a single string. Thin wrapper over translateBatch() — prefer
 * translateBatch() directly when translating more than one string at once
 * (e.g. every field of a report) so it's a single API call, not several. */
export async function translateText({ text, sourceLang, targetLang }: TranslateOptions): Promise<string> {
  const [result] = await translateBatch({ texts: [text], sourceLang, targetLang });
  return result;
}
