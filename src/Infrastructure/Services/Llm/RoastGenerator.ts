import { roastResultSchema, type RoastResult } from "@/schemas/roast";
import {
  GeminiError,
  requestGeminiJson,
  type GeminiCallOptions,
} from "./GeminiTransport";

/**
 * Output ceiling for one generation.
 *
 * Sized against the report schema rather than guessed: at its declared maxima
 * (6 strengths, 6 issues, 6 roast lines, a 1000-char hero rewrite, 6 element
 * grades and 4 fixes with 1000-char snippets) a fully-populated report is about
 * 22k characters, roughly 6.2k tokens. A real report measured 2.3k characters.
 * 8192 leaves headroom above the worst legitimate report while still capping a
 * runaway generation — and truncation is caught as invalid JSON and retried.
 */
export const MAX_OUTPUT_TOKENS = 8192;

/** One initial attempt plus at most one retry. Never unbounded. */
export const MAX_ATTEMPTS = 2;

export const ATTEMPT_TIMEOUT_MS = 30_000;

/** Floor for a retry delay when the provider gives no Retry-After. */
export const RETRY_BACKOFF_MS = 750;

/**
 * Ceiling on any honoured Retry-After. Two attempts plus this delay must stay
 * inside the audit's duration budget, so a provider asking for 60s is treated
 * as "not now" rather than blocking the function.
 */
export const MAX_RETRY_DELAY_MS = 5_000;

export type RoastGenerationFailure =
  /** Model produced nothing usable, or failed in a way retrying did not fix. */
  | "analysis_failed"
  /** Safety filter rejected the input. */
  | "blocked";

export type RoastGenerationResult =
  | { ok: true; result: RoastResult; attempts: number }
  | { ok: false; reason: RoastGenerationFailure; attempts: number };

export interface GenerateRoastOptions
  extends Omit<GeminiCallOptions, "maxOutputTokens" | "timeoutMs"> {
  maxOutputTokens?: number;
  timeoutMs?: number;
  /** Injectable so tests stay deterministic and instant. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Generates and validates one roast report.
 *
 * Owns the whole "call the model and get something trustworthy back" concern —
 * request, retry policy, JSON parse and schema validation — so the server action
 * stays a short orchestration rather than a procedural blob.
 *
 * Retries exactly once, and only where a retry can plausibly help: a transient
 * transport failure, malformed JSON, or output that does not satisfy the schema.
 * Both malformed cases were observed in practice, not hypothesised. A permanent
 * failure (4xx, safety block) returns immediately rather than spending the
 * budget twice.
 *
 * Unvalidated model output is never returned: the only success path runs through
 * `roastResultSchema`.
 */
export async function generateRoastResult(
  options: GenerateRoastOptions
): Promise<RoastGenerationResult> {
  const {
    maxOutputTokens = MAX_OUTPUT_TOKENS,
    timeoutMs = ATTEMPT_TIMEOUT_MS,
    sleep = defaultSleep,
    ...call
  } = options;

  let attempts = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    attempts = attempt;
    const isLastAttempt = attempt === MAX_ATTEMPTS;

    let raw: string;
    try {
      raw = await requestGeminiJson({ ...call, maxOutputTokens, timeoutMs });
    } catch (error: unknown) {
      if (error instanceof GeminiError) {
        if (error.kind === "permanent") {
          return {
            ok: false,
            reason: error.message.includes("blocked") ? "blocked" : "analysis_failed",
            attempts,
          };
        }

        if (isLastAttempt) return { ok: false, reason: "analysis_failed", attempts };

        await sleep(retryDelayFor(error));
        continue;
      }

      return { ok: false, reason: "analysis_failed", attempts };
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      if (isLastAttempt) return { ok: false, reason: "analysis_failed", attempts };
      await sleep(RETRY_BACKOFF_MS);
      continue;
    }

    const parsed = roastResultSchema.safeParse(parsedJson);
    if (parsed.success) {
      return { ok: true, result: parsed.data, attempts };
    }

    if (isLastAttempt) return { ok: false, reason: "analysis_failed", attempts };
    await sleep(RETRY_BACKOFF_MS);
  }

  return { ok: false, reason: "analysis_failed", attempts };
}

function retryDelayFor(error: GeminiError): number {
  if (error.retryAfterMs === undefined) return RETRY_BACKOFF_MS;
  return Math.min(Math.max(error.retryAfterMs, RETRY_BACKOFF_MS), MAX_RETRY_DELAY_MS);
}
