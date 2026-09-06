import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateRoastResult } from "../src/Infrastructure/Services/Llm/RoastGenerator";
import { parseRetryAfter } from "../src/Infrastructure/Services/Llm/GeminiTransport";

const validReport = {
  score: 42,
  strengths: [{ headline: "Fast load", detail: "Under two seconds." }],
  criticalIssues: [
    { title: "CTA below fold", desc: "Primary action is not visible.", severity: "CRITICAL" },
  ],
  roastLines: [{ headline: "Your CTA is hiding.", detail: "Nobody scrolls that far." }],
  rewrittenHeroCopy: "Turn visitors into customers.",
  elementGrades: [
    { label: "Hero Section", score: 30 },
    { label: "CTA Button", score: 45 },
    { label: "Copy Clarity", score: 60 },
  ],
  actionFixes: [
    { priority: "CRITICAL", title: "Move the CTA up", copy: "Start free", code: "<button />" },
  ],
};

/** A Gemini success envelope wrapping arbitrary candidate text. */
function ok(text: string): Response {
  return new Response(
    JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

function httpError(status: number, headers: Record<string, string> = {}): Response {
  return new Response("upstream detail that must not leak", { status, headers });
}

/**
 * Builds an injectable fetch that replays a scripted sequence, and records how
 * many calls were made so retry counts can be asserted exactly.
 */
function scriptedFetch(responses: Array<() => Response>) {
  const calls: string[] = [];
  const impl = (async (input: string | URL | Request) => {
    calls.push(String(input));
    const next = responses[calls.length - 1];
    if (!next) throw new Error(`unexpected extra call #${calls.length}`);
    return next();
  }) as unknown as typeof fetch;

  return { impl, calls };
}

const baseOptions = {
  apiKey: "test-key",
  model: "test-model",
  prompt: "audit this",
  // Instant, deterministic backoff: the retry policy is under test, not timing.
  sleep: async () => {},
};

describe("Gemini retry policy", () => {
  it("retries once after a 429 and succeeds", async () => {
    const { impl, calls } = scriptedFetch([
      () => httpError(429),
      () => ok(JSON.stringify(validReport)),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });

    assert.equal(result.ok, true);
    assert.equal(result.attempts, 2);
    assert.equal(calls.length, 2);
  });

  it("retries once after a 503 and succeeds", async () => {
    const { impl, calls } = scriptedFetch([
      () => httpError(503),
      () => ok(JSON.stringify(validReport)),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, true);
    assert.equal(calls.length, 2);
  });

  it("retries malformed JSON and succeeds — the failure seen in practice", async () => {
    const { impl, calls } = scriptedFetch([
      () => ok("Sure! Here is your report: {not json"),
      () => ok(JSON.stringify(validReport)),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, true);
    assert.equal(result.attempts, 2);
    assert.equal(calls.length, 2);
  });

  it("retries schema-invalid output and succeeds", async () => {
    const { impl } = scriptedFetch([
      // Well-formed JSON, wrong shape.
      () => ok(JSON.stringify({ score: 42 })),
      () => ok(JSON.stringify(validReport)),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, true);
  });

  it("gives up after two malformed responses rather than looping", async () => {
    const { impl, calls } = scriptedFetch([
      () => ok("{still not json"),
      () => ok("{still not json"),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });

    assert.equal(result.ok, false);
    assert.equal((result as { reason: string }).reason, "analysis_failed");
    assert.equal(calls.length, 2, "must stop at MAX_ATTEMPTS");
  });

  it("gives up after two schema-invalid responses", async () => {
    const { impl, calls } = scriptedFetch([
      () => ok(JSON.stringify({ score: 200 })),
      () => ok(JSON.stringify({ nope: true })),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, false);
    assert.equal(calls.length, 2);
  });

  it("does not retry a permanent 4xx", async () => {
    const { impl, calls } = scriptedFetch([() => httpError(400)]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });

    assert.equal(result.ok, false);
    assert.equal(calls.length, 1, "a permanent error must not burn a second attempt");
    assert.equal(result.attempts, 1);
  });

  it("does not retry an auth failure", async () => {
    const { impl, calls } = scriptedFetch([() => httpError(403)]);
    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, false);
    assert.equal(calls.length, 1);
  });

  it("treats a safety block as permanent", async () => {
    const { impl, calls } = scriptedFetch([
      () =>
        new Response(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, false);
    assert.equal((result as { reason: string }).reason, "blocked");
    assert.equal(calls.length, 1);
  });

  it("retries a truncated (empty-candidate) response", async () => {
    const { impl, calls } = scriptedFetch([
      () =>
        new Response(JSON.stringify({ candidates: [{ finishReason: "MAX_TOKENS" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      () => ok(JSON.stringify(validReport)),
    ]);

    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, true);
    assert.equal(calls.length, 2);
  });

  it("never returns unvalidated model output", async () => {
    const { impl } = scriptedFetch([
      () => ok(JSON.stringify({ ...validReport, score: 9999 })),
      () => ok(JSON.stringify({ ...validReport, score: 9999 })),
    ]);

    // Out-of-range score fails the schema, so nothing is returned at all.
    const result = await generateRoastResult({ ...baseOptions, fetchImpl: impl });
    assert.equal(result.ok, false);
  });

  it("sends a bounded maxOutputTokens", async () => {
    let sentBody: Record<string, unknown> = {};
    const impl = (async (_input: unknown, init: RequestInit) => {
      sentBody = JSON.parse(String(init.body));
      return ok(JSON.stringify(validReport));
    }) as unknown as typeof fetch;

    await generateRoastResult({ ...baseOptions, fetchImpl: impl });

    const config = sentBody.generationConfig as { maxOutputTokens?: number };
    assert.equal(typeof config.maxOutputTokens, "number");
    assert.ok(config.maxOutputTokens! > 0);
  });
});

describe("Retry-After parsing", () => {
  it("reads a delay in seconds", () => {
    assert.equal(parseRetryAfter("2"), 2000);
    assert.equal(parseRetryAfter("0"), 0);
  });

  it("reads an HTTP date", () => {
    const now = Date.parse("2026-09-06T00:00:00Z");
    assert.equal(parseRetryAfter("Sun, 06 Sep 2026 00:00:03 GMT", now), 3000);
  });

  it("ignores nonsense and a missing header", () => {
    assert.equal(parseRetryAfter(null), undefined);
    assert.equal(parseRetryAfter("soon"), undefined);
  });
});
