import type { PlanId } from "@/shared/config/plans";

/**
 * Outcome of attempting to claim a quota slot.
 *
 * `reserved` is the only outcome that permits network or model spend.
 */
export type ReservationOutcome =
  | { outcome: "reserved"; auditRunId: string; periodKey: string; used: number; limit: number }
  | { outcome: "limit_reached"; used: number; limit: number }
  | { outcome: "audit_in_progress" };

export interface ReserveAuditInput {
  userId: string;
  planId: PlanId;
  now: Date;
}

export interface AuditUsageCounts {
  completed: number;
  hasActiveReservation: boolean;
}

/**
 * The quota ledger.
 *
 * Deliberately narrow: this is not an analytics surface. It exists to make
 * quota claims concurrency-safe, to cap model spend, and to report honest usage.
 */
export interface IAuditRunRepository {
  /**
   * Atomically decides whether the user has capacity and, if so, claims one
   * slot. Must serialize concurrent attempts by the same user.
   */
  reserveAudit(input: ReserveAuditInput): Promise<ReservationOutcome>;

  /** Marks a reservation completed and links the report it produced. */
  markCompleted(auditRunId: string, reportId: string, now: Date): Promise<void>;

  /** Releases a reservation so the attempt does not consume quota. */
  markFailed(auditRunId: string, now: Date): Promise<void>;

  /** Completed runs in the window, plus whether a live reservation is held. */
  getUsageCounts(userId: string, periodKey: string, now: Date): Promise<AuditUsageCounts>;
}
