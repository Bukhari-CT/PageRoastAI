import type { PlanId } from "@/shared/config/plans";

/**
 * The usage window a run counts against.
 *
 * `start`/`end` are null for a window that has no boundaries (Free is a
 * lifetime allowance). `end` is exclusive when present.
 */
export interface UsagePeriod {
  /** Deterministic key stored on every audit run: "lifetime" or "YYYY-MM". */
  key: string;
  start: Date | null;
  end: Date | null;
}

export const LIFETIME_PERIOD_KEY = "lifetime";

/**
 * Resolves the usage window for a plan.
 *
 * **This is the only place usage windows are computed.** Date arithmetic must
 * not be duplicated in components, server actions or repositories — Phase 3
 * replaces the Pro branch below with the real Lemon Squeezy billing period
 * (`subscription.currentPeriodStart` → `currentPeriodEnd`), and that change
 * should touch this function and nothing else.
 *
 *  - Free: a lifetime allowance, so there is no window and no reset.
 *  - Pro:  the current UTC calendar month. Deliberately UTC, never a localized
 *          date string, so the key a server computes never depends on the
 *          machine's timezone.
 */
export function resolveUsagePeriod(planId: PlanId, now: Date): UsagePeriod {
  if (planId === "pro") {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      start: new Date(Date.UTC(year, month, 1)),
      // Date.UTC rolls December over into the next January correctly.
      end: new Date(Date.UTC(year, month + 1, 1)),
    };
  }

  return { key: LIFETIME_PERIOD_KEY, start: null, end: null };
}
