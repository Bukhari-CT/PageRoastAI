"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isValidUrl } from "@/lib/utils";
import { fetchPageText } from "@services/PageFetcher";
import { buildRoastPrompt } from "@services/LlmPrompts";
import { generateRoastJson, type ModelTier } from "@services/LlmClient";
import { saveReport, generateReportId, type StoredReport } from "@services/ReportStore";
import { roastResultSchema } from "@/schemas/roast";
import { resolvePlan } from "@/shared/config/plans";

export type RoastActionResult = StoredReport;

export async function roastUrlAction(
  rawUrl: string
): Promise<{ data: RoastActionResult; error: null } | { data: null; error: string }> {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return { data: null, error: "Please enter a URL to audit." };
  }
  if (!isValidUrl(trimmed)) {
    return { data: null, error: "Enter a valid URL (e.g. https://example.com)" };
  }

  const normalizedUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const plan = resolvePlan((session?.user as { package?: string | null } | undefined)?.package);
    const tier: ModelTier = plan.modelTier;

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

    const record: StoredReport = {
      ...parsed.data,
      id: generateReportId(),
      url: normalizedUrl,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tier,
    };
    saveReport(record);

    return { data: record, error: null };
  } catch (error: unknown) {
    console.error("Error generating roast:", error);
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
