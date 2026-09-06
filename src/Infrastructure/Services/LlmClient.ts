import "server-only";
import { env } from "@/shared/config/env";
import type { ModelTier } from "@/shared/config/plans";
import {
  generateRoastResult,
  type RoastGenerationResult,
} from "./Llm/RoastGenerator";

// Model tiering is a property of the plan, so the type is owned by the
// canonical plan config and re-exported here for existing consumers.
export type { ModelTier };

export type { RoastGenerationResult };

export function modelForTier(tier: ModelTier): string {
  return tier === "premium" ? env.GEMINI_PREMIUM_MODEL : env.GEMINI_FREE_MODEL;
}

/**
 * Thin environment-reading wrapper around the roast generator.
 *
 * The retry, parsing and validation logic deliberately lives in
 * `Llm/RoastGenerator.ts`, which reads no environment and takes an injectable
 * transport — that is what makes the retry policy testable without network
 * access or a populated `.env`.
 */
export async function generateRoast(
  prompt: string,
  tier: ModelTier
): Promise<RoastGenerationResult> {
  if (!env.GEMINI_API_KEY) {
    // Surfaced as an analysis failure rather than thrown: a missing key is an
    // operator problem, and the caller still needs to release the quota slot.
    console.error("[llm] GEMINI_API_KEY is not configured");
    return { ok: false, reason: "analysis_failed", attempts: 0 };
  }

  return generateRoastResult({
    apiKey: env.GEMINI_API_KEY,
    model: modelForTier(tier),
    prompt,
  });
}
