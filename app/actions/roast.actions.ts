"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { fetchPageText, PageFetchError } from "@services/PageFetcher";
import { evaluateUrlPolicy } from "@services/Url/UrlPolicy";
import { buildRoastPrompt } from "@services/LlmPrompts";
import { generateRoast } from "@services/LlmClient";
import { saveReport, type StoredReport } from "@services/ReportStore";
import { auditRunRepository } from "@diContainer/Resolver";
import { getAuditUsage } from "@application/Usage/AuditUsageService";
import { resolvePlan, type PlanId } from "@/shared/config/plans";

export interface RoastUsageSummary {
  used: number;
  limit: number;
  remaining: number;
  planId: PlanId;
}

/**
 * Discriminated outcome of an audit attempt.
 *
 * Every rejection has its own case so the UI can say something true and
 * specific. No variant carries a resolved IP, SQL text, provider body or API
 * key — failures are categorised server-side and only the category crosses the
 * boundary.
 */
export type RoastActionResult =
  | { status: "success"; report: StoredReport; usage: RoastUsageSummary }
  | { status: "auth_required" }
  | { status: "invalid_url" }
  | { status: "unsupported_url" }
  | { status: "limit_reached"; usage: RoastUsageSummary }
  | { status: "audit_in_progress" }
  | { status: "page_unreachable" }
  | { status: "unsupported_content" }
  | { status: "analysis_failed" }
  | { status: "persistence_failed" };

/** Structured, low-cardinality logging. Never tokens, cookies or page content. */
function logAuditFailure(context: {
  stage: string;
  auditRunId?: string;
  userRef?: string;
  detail?: string;
  startedAt: number;
}) {
  console.error("[audit] failed", {
    stage: context.stage,
    auditRunId: context.auditRunId,
    // Abbreviated: enough to correlate with a row, not enough to identify.
    user: context.userRef,
    detail: context.detail,
    durationMs: Date.now() - context.startedAt,
  });
}

/**
 * Runs one audit.
 *
 * Order is deliberate and the cheap checks come first:
 *
 *  1. Authenticate. An anonymous caller is rejected here — before any DNS
 *     query, page fetch, model call, quota claim or database write.
 *  2. Validate the URL locally. A typo must not burn a quota slot, and this
 *     costs nothing, so it happens before the reservation.
 *  3. Resolve the plan from the database session only.
 *  4. Claim a quota slot atomically. Nothing expensive runs until this succeeds.
 *  5..8. Fetch (SSRF-guarded), prompt, generate (bounded retry), validate.
 *  9. Persist the report, then mark the run completed.
 *
 * Any failure after step 4 releases the slot, so a user is never charged for an
 * audit that produced nothing.
 */
export async function roastUrlAction(rawUrl: string): Promise<RoastActionResult> {
  const startedAt = Date.now();

  // 1. Authentication — enforced here, in the server action itself. Client UI
  //    is a convenience, never the gate.
  const session = await auth.api.getSession({ headers: await headers() });
  const sessionUser = session?.user as
    | { id?: string; package?: string | null }
    | undefined;

  if (!sessionUser?.id) {
    return { status: "auth_required" };
  }

  const userId = sessionUser.id;
  const userRef = userId.slice(0, 8);

  // 2. Cheap local URL validation before any quota is consumed.
  const policy = evaluateUrlPolicy(rawUrl);
  if (!policy.ok) {
    return { status: policy.reason === "invalid_url" ? "invalid_url" : "unsupported_url" };
  }
  const normalizedUrl = policy.url.toString();

  // 3. Plan comes from the authenticated user's stored package and the canonical
  //    plan config. Client state, request body and query string are never used.
  const plan = resolvePlan(sessionUser.package);

  // 4. Atomic quota claim.
  const reservation = await auditRunRepository.reserveAudit({
    userId,
    planId: plan.id,
    now: new Date(),
  });

  if (reservation.outcome === "audit_in_progress") {
    return { status: "audit_in_progress" };
  }

  if (reservation.outcome === "limit_reached") {
    return {
      status: "limit_reached",
      usage: {
        used: reservation.used,
        limit: reservation.limit,
        remaining: Math.max(reservation.limit - reservation.used, 0),
        planId: plan.id,
      },
    };
  }

  const { auditRunId } = reservation;

  const releaseSlot = async (stage: string, detail?: string) => {
    logAuditFailure({ stage, auditRunId, userRef, detail, startedAt });
    try {
      await auditRunRepository.markFailed(auditRunId, new Date());
    } catch {
      // The reservation expires on its own via reservedUntil, so a failed
      // release degrades to a short delay rather than a stuck user.
      console.error("[audit] could not release reservation", { auditRunId });
    }
  };

  try {
    // 5. SSRF-guarded fetch.
    let page: Awaited<ReturnType<typeof fetchPageText>>;
    try {
      page = await fetchPageText(normalizedUrl);
    } catch (error: unknown) {
      const code = error instanceof PageFetchError ? error.code : "page_unreachable";
      await releaseSlot("fetch", code);

      if (code === "unsupported_content") return { status: "unsupported_content" };
      if (code === "unsupported_url") return { status: "unsupported_url" };
      if (code === "invalid_url") return { status: "invalid_url" };
      return { status: "page_unreachable" };
    }

    // 6-8. Prompt, generate, validate. Retry and schema checking live inside
    //      the generator; unvalidated output can never reach us here.
    const prompt = buildRoastPrompt({
      url: normalizedUrl,
      pageTitle: page.title,
      pageText: page.text,
    });

    const generation = await generateRoast(prompt, plan.modelTier);
    if (!generation.ok) {
      await releaseSlot("generate", `${generation.reason} after ${generation.attempts} attempt(s)`);
      return { status: "analysis_failed" };
    }

    // 9. Persist, then mark the run completed. A failed write must never hand
    //    the user a report id that resolves to nothing.
    let report: StoredReport;
    try {
      report = await saveReport({
        url: normalizedUrl,
        planId: plan.id,
        userId,
        result: generation.result,
      });
    } catch (error: unknown) {
      await releaseSlot(
        "persist",
        error instanceof Error ? error.message.slice(0, 200) : "unknown"
      );
      return { status: "persistence_failed" };
    }

    await auditRunRepository.markCompleted(auditRunId, report.id, new Date());

    const usage = await getAuditUsage(userId, plan.id);
    return {
      status: "success",
      report,
      usage: {
        used: usage.used,
        limit: usage.limit,
        remaining: usage.remaining,
        planId: usage.planId,
      },
    };
  } catch (error: unknown) {
    await releaseSlot(
      "unexpected",
      error instanceof Error ? error.message.slice(0, 200) : "unknown"
    );
    return { status: "analysis_failed" };
  }
}
