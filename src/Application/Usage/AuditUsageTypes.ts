import type { PlanId } from "@/shared/config/plans";

/**
 * Everything the product needs to say about a user's audit allowance.
 *
 * Declared apart from the service so client components can type against it —
 * `AuditUsageService` imports "server-only" and must never reach the browser.
 * This is the single source of usage truth; components render it and never
 * derive counts of their own.
 */
export interface AuditUsage {
  planId: PlanId;
  limit: number;
  used: number;
  remaining: number;
  periodKey: string;
  /** Null for a lifetime allowance (Free). */
  periodStart: string | null;
  /** Exclusive end of the window — when the allowance next resets. */
  periodEnd: string | null;
  /** True while an audit is already running for this user. */
  hasActiveReservation: boolean;
}
