import 'server-only';
import { env } from '@/shared/config/env';
import type { ModelTier } from '@/shared/config/plans';

// Model tiering is a property of the plan, so the type is owned by the
// canonical plan config and re-exported here for existing consumers.
export type { ModelTier };

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function modelForTier(tier: ModelTier): string {
  return tier === "premium" ? env.GEMINI_PREMIUM_MODEL : env.GEMINI_FREE_MODEL;
}

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

/**
 * Calls the Gemini generateContent API and returns the raw JSON text the
 * model produced (requested via responseMimeType: "application/json").
 * Throws a descriptive error on any failure so callers can surface a clean
 * message instead of an unhandled exception.
 */
export async function generateRoastJson(prompt: string, tier: ModelTier): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Add it to your environment variables to use AI roast generation.");
  }

  const model = modelForTier(tier);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let res: Response;
  try {
    res = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Gemini request timed out (model: ${model}).`);
    }
    throw new Error(`Failed to reach Gemini API: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API returned ${res.status} for model ${model}: ${body.slice(0, 500)}`);
  }

  const data: GeminiResponse = await res.json();

  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(`Gemini returned no content (finishReason: ${candidate?.finishReason ?? "unknown"}).`);
  }

  return text;
}
