import "server-only";

import { PLANS, type PlanId } from "@/shared/config/plans";
import type { AuditUsage } from "./AuditUsageTypes";
import { auditRunRepository } from "@diContainer/Resolver";
import { resolveUsagePeriod } from "./UsagePeriod";

export type { AuditUsage };

/**
 * Resolves real, database-backed usage for a user.
 *
 * `used` counts only completed runs in the current window: failed attempts and
 * expired reservations are excluded, so a user is never charged for an audit
 * that produced nothing.
 */
export async function getAuditUsage(
  userId: string,
  planId: PlanId,
  now: Date = new Date()
): Promise<AuditUsage> {
  const plan = PLANS[planId];
  const period = resolveUsagePeriod(planId, now);
  const counts = await auditRunRepository.getUsageCounts(userId, period.key, now);

  return {
    planId,
    limit: plan.auditLimit,
    used: counts.completed,
    remaining: Math.max(plan.auditLimit - counts.completed, 0),
    periodKey: period.key,
    // ISO strings so the value is trivially serializable to the client.
    periodStart: period.start?.toISOString() ?? null,
    periodEnd: period.end?.toISOString() ?? null,
    hasActiveReservation: counts.hasActiveReservation,
  };
}
