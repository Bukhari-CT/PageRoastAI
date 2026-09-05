"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { normalizeAuditUrl } from "@/lib/utils";
import { fetchPageText } from "@services/PageFetcher";
import { buildRoastPrompt } from "@services/LlmPrompts";
import { generateRoastJson, type ModelTier } from "@services/LlmClient";
import { saveReport, type StoredReport } from "@services/ReportStore";
import { roastResultSchema } from "@/schemas/roast";
import { resolvePlan } from "@/shared/config/plans";

export type RoastActionResult = StoredReport;

/** Raised when the audit succeeded but could not be persisted. */
class ReportPersistenceError extends Error {}

export async function roastUrlAction(
  rawUrl: string
): Promise<{ data: RoastActionResult; error: null } | { data: null; error: string }> {
  if (!rawUrl.trim()) {
    return { data: null, error: "Please enter a URL to audit." };
  }

  // Single canonical form, stored exactly as fetched, so history doesn't
  // accumulate three spellings of the same page.
  const normalizedUrl = normalizeAuditUrl(rawUrl);
  if (!normalizedUrl) {
    return { data: null, error: "Enter a valid URL (e.g. https://example.com)" };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const sessionUser = session?.user as
      | { id?: string; package?: string | null }
      | undefined;

    const plan = resolvePlan(sessionUser?.package);
    const tier: ModelTier = plan.modelTier;

    // Anonymous audits still work — Phase 2 makes authentication mandatory.
    // Until then an unauthenticated audit is stored with a null owner and is
    // therefore readable by nobody, which is the safe default.
    const userId = sessionUser?.id ?? null;

    const { title, text } = await fetchPageText(normalizedUrl);
    const prompt = buildRoastPrompt({ url: normalizedUrl, pageTitle: title, pageText: text });
    const rawJson = await generateRoastJson(prompt, tier);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawJson);
    } catch {
      throw new Error("Gemini returned invalid JSON.");
    }

    const parsed = roastResultSchema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new Error(`Gemini response did not match the expected shape: ${parsed.error.message}`);
    }

    let record: StoredReport;
    try {
      record = await saveReport({
        url: normalizedUrl,
        tier,
        userId,
        result: parsed.data,
      });
    } catch (persistError: unknown) {
      // Wrapped so the generic handler below cannot report a database failure
      // as a model failure. A failed write must never return a report id that
      // resolves to nothing.
      const detail =
        persistError instanceof Error ? persistError.message : String(persistError);
      throw new ReportPersistenceError(detail);
    }

    return { data: record, error: null };
  } catch (error: unknown) {
    if (error instanceof ReportPersistenceError) {
      // Identifiers and the audited URL only — no credentials, tokens, SQL or
      // report content.
      console.error("[roast] Failed to persist report", {
        url: normalizedUrl,
        message: error.message,
      });
      return {
        data: null,
        error: "We couldn't save your audit. Please try again in a moment.",
      };
    }

    console.error("[roast] Error generating roast:", error);
    const message = error instanceof Error ? error.message : "Something went wrong.";
    // Surface fetch/model failures with a clean, specific-enough message; keep it short for the UI.
    return {
      data: null,
      error: message.includes("Timed out") || message.includes("Could not reach") || message.includes("status")
        ? "Couldn't load that page — check the URL and try again."
        : "Something went wrong generating your roast. Please try again.",
    };
  }
}
