export type GeminiErrorKind = "transient" | "permanent";

/**
 * A Gemini call failure classified by whether retrying could plausibly help.
 *
 * `transient` — rate limits, upstream 5xx, network blips, empty/truncated
 *               candidates. Worth exactly one more attempt.
 * `permanent` — bad request, auth failure, safety block. Retrying just burns
 *               the duration budget and, for 4xx, quota.
 */
export class GeminiError extends Error {
  constructor(
    readonly kind: GeminiErrorKind,
    message: string,
    readonly status?: number,
    readonly retryAfterMs?: number
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/** Statuses where the same request may succeed shortly afterwards. */
const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

export interface GeminiCallOptions {
  apiKey: string;
  model: string;
  prompt: string;
  maxOutputTokens: number;
  timeoutMs: number;
  /** Injectable for tests; defaults to global fetch. */
  fetchImpl?: typeof fetch;
  baseUrl?: string;
}

/** Reads `Retry-After`, which may be seconds or an HTTP date. */
export function parseRetryAfter(header: string | null, now: number = Date.now()): number | undefined {
  if (!header) return undefined;

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;

  const date = Date.parse(header);
  if (Number.isNaN(date)) return undefined;

  return Math.max(date - now, 0);
}

/**
 * One Gemini `generateContent` call. Returns the raw JSON text the model
 * produced; classification of failures is the caller's retry input.
 */
export async function requestGeminiJson(options: GeminiCallOptions): Promise<string> {
  const {
    apiKey,
    model,
    prompt,
    maxOutputTokens,
    timeoutMs,
    fetchImpl = fetch,
    baseUrl = GEMINI_BASE_URL,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          // Bounds the cost and latency of any single call. See RoastGenerator
          // for how this number was chosen against the report schema.
          maxOutputTokens,
        },
      }),
      signal: controller.signal,
    });
  } catch (error: unknown) {
    const aborted = error instanceof Error && error.name === "AbortError";
    throw new GeminiError(
      "transient",
      aborted ? "Gemini request timed out" : "Failed to reach the Gemini API"
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const kind: GeminiErrorKind = TRANSIENT_STATUSES.has(response.status)
      ? "transient"
      : "permanent";

    throw new GeminiError(
      kind,
      // Provider bodies can echo request content, so only the status is kept.
      `Gemini API returned ${response.status}`,
      response.status,
      parseRetryAfter(response.headers?.get?.("retry-after") ?? null)
    );
  }

  let data: GeminiResponse;
  try {
    data = (await response.json()) as GeminiResponse;
  } catch {
    throw new GeminiError("transient", "Gemini response was not valid JSON");
  }

  if (data.promptFeedback?.blockReason) {
    // A safety block is a property of the input; the same input will block again.
    throw new GeminiError("permanent", "Gemini blocked the request");
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    // Includes MAX_TOKENS truncation, which a retry can plausibly clear.
    throw new GeminiError(
      "transient",
      `Gemini returned no content (finishReason: ${candidate?.finishReason ?? "unknown"})`
    );
  }

  return text;
}
