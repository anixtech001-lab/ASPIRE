// Bhashini integration — National Language Translation Mission API.
//
// SETUP NEEDED (Ansh, do this before Day-2 polish):
// 1. Register at https://bhashini.gov.in/ubhasini/en/signup and get a User ID + Ulca API Key.
// 2. Add to .env.local:
//      BHASHINI_USER_ID=your_user_id
//      BHASHINI_API_KEY=your_ulca_api_key
// 3. Bhashini's actual pipeline requires a two-step call:
//      a) POST to the "pipeline config" endpoint to get task-specific service IDs
//      b) POST to the "compute" endpoint with those service IDs to do the actual
//         translation / ASR / TTS
//    Their service IDs change per language pair, so step (a) should be cached,
//    not called on every request.
//
// For the hackathon demo, this file ships with a STUBBED fallback so the app
// works end-to-end even before Bhashini credentials are wired in — it returns
// the original text untouched, so the rest of the UI never breaks waiting on
// a live translation call.

const BHASHINI_PIPELINE_URL =
  "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";
const BHASHINI_COMPUTE_URL =
  "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

export type SupportedLang = "hi" | "ta" | "mr" | "bn" | "te" | "en";

interface TranslateOptions {
  text: string;
  sourceLang: SupportedLang;
  targetLang: SupportedLang;
}

export async function translateText({
  text,
  sourceLang,
  targetLang,
}: TranslateOptions): Promise<string> {
  if (sourceLang === targetLang) return text;

  const apiKey = process.env.BHASHINI_API_KEY;
  const userId = process.env.BHASHINI_USER_ID;

  if (!apiKey || !userId) {
    // No credentials configured yet — safe no-op fallback for demo continuity.
    console.warn("[bhashini] credentials not set, returning original text");
    return text;
  }

  try {
    // Step 1: fetch pipeline config for this language pair (should be cached in
    // production — done live here for MVP simplicity).
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

    const serviceId =
      pipelineData?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;
    const callbackUrl = pipelineData?.pipelineInferenceAPIEndPoint?.callbackUrl;
    const inferenceApiKey =
      pipelineData?.pipelineInferenceAPIEndPoint?.inferenceApiKey;

    if (!serviceId || !callbackUrl || !inferenceApiKey) {
      throw new Error("incomplete pipeline config response");
    }

    // Step 2: actual translation call
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
        inputData: { input: [{ source: text }] },
      }),
    });

    if (!computeRes.ok) throw new Error("translation compute call failed");
    const computeData = await computeRes.json();

    return (
      computeData?.pipelineResponse?.[0]?.output?.[0]?.target ?? text
    );
  } catch (err) {
    console.error("[bhashini] translation failed, falling back to original text", err);
    return text;
  }
}

// Static UI label dictionary — used for the language toggle without needing a
// live API call for every button/label in the app (fast, works offline).
export const UI_LABELS: Record<SupportedLang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    businessAdvisor: "Business Advisor",
    financialPlanner: "Financial Planner",
    schemesSupport: "Schemes & Support",
    marketInsights: "Market Insights",
    myReports: "My Reports",
    savedIdeas: "Saved Ideas",
    getBusinessAdvice: "Get Business Advice",
    nextStep: "Next Step",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    businessAdvisor: "व्यवसाय सलाहकार",
    financialPlanner: "वित्तीय योजनाकार",
    schemesSupport: "योजनाएं और सहायता",
    marketInsights: "बाज़ार जानकारी",
    myReports: "मेरी रिपोर्ट",
    savedIdeas: "सहेजे गए विचार",
    getBusinessAdvice: "व्यवसाय सलाह लें",
    nextStep: "अगला चरण",
  },
  ta: {}, mr: {}, bn: {}, te: {}, // fill in as needed before demo
};
