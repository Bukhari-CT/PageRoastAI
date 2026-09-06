import { EntitySchema } from "typeorm";
import type { UserRow } from "./UserSchema";
import type { ReportRow } from "./ReportSchema";
import type { PlanId } from "@/shared/config/plans";

/**
 * Lifecycle of one audit attempt.
 *
 * `reserved`  — a quota slot is claimed; expensive work may proceed.
 * `completed` — a report was persisted; this run consumes quota permanently.
 * `failed`    — the attempt did not produce a report; it must NOT consume quota.
 */
export type AuditRunStatus = "reserved" | "completed" | "failed";

export const AUDIT_RUN_STATUS: Record<Uppercase<AuditRunStatus>, AuditRunStatus> = {
  RESERVED: "reserved",
  COMPLETED: "completed",
  FAILED: "failed",
};

/**
 * Persistence row shape for `audit_runs` — the quota reservation ledger.
 *
 * This exists so quota can be claimed *atomically before* any network or model
 * spend. Counting reports and then calling Gemini is not sufficient: two
 * concurrent requests both pass the count and both spend money.
 *
 * It is deliberately not an analytics table. Its three jobs are
 * concurrency-safe quota claims, cost protection, and honest usage display.
 */
export interface AuditRunRow {
  id: string;
  userId: string;
  /** Plan at the time of the run; historical runs stay meaningful after upgrades. */
  planId: PlanId;
  /**
   * Deterministic UTC usage window this run belongs to — "lifetime" for Free,
   * "YYYY-MM" for Pro. Computed by the usage-period helper, never inline.
   */
  periodKey: string;
  status: AuditRunStatus;
  /**
   * A `reserved` row stops counting against quota after this instant, so a
   * process that crashes mid-audit cannot block the user forever.
   */
  reservedUntil: Date;
  reportId: string | null;
  createdAt: Date;
  completedAt: Date | null;
  user?: UserRow;
  report?: ReportRow | null;
}

export const AuditRunSchema = new EntitySchema<AuditRunRow>({
  name: "AuditRun",
  tableName: "audit_runs",
  columns: {
    id: { type: "varchar", length: 36, primary: true },
    userId: { type: "varchar", length: 36 },
    planId: { type: "varchar", length: 16 },
    periodKey: { type: "varchar", length: 32 },
    status: { type: "varchar", length: 16 },
    reservedUntil: { type: "datetime", precision: 3 },
    reportId: { type: "varchar", length: 36, nullable: true },
    createdAt: {
      type: "datetime",
      precision: 3,
      createDate: true,
      default: () => "CURRENT_TIMESTAMP(3)",
    },
    completedAt: { type: "datetime", precision: 3, nullable: true },
  },
  indices: [
    // Serves the two quota reads: completed-in-period, and active reservations.
    { columns: ["userId", "status", "periodKey"] },
  ],
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // A completed run points at the report it produced. SET NULL rather than
    // CASCADE so removing a report never silently erases the usage it consumed.
    report: {
      type: "many-to-one",
      target: "Report",
      joinColumn: { name: "reportId" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
      nullable: true,
    },
  },
});
