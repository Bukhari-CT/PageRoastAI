import { EntitySchema } from "typeorm";
import type { UserRow } from "./UserSchema";
import type { RoastResult } from "@/schemas/roast";
import type { PlanId } from "@/shared/config/plans";

/**
 * Persistence row shape for `reports` — a stored audit.
 *
 * `payload` holds the complete Zod-validated RoastResult as JSON (the canonical
 * report body); `score` is lifted into its own column so history listings can
 * read and sort without parsing JSON per row.
 *
 * See UserSchema for why this is an EntitySchema rather than a decorator class.
 */
export interface ReportRow {
  id: string;
  /**
   * Nullable only for audits created before authentication became mandatory:
   * the landing page still allows anonymous audits, and Phase 2 will require a
   * session. Such rows have no owner and are readable by nobody.
   */
  userId: string | null;
  /** Normalized absolute URL. 2048 fits the practical browser/CDN URL ceiling. */
  url: string;
  /**
   * The product plan the audit ran under: "free" | "pro".
   *
   * Deliberately the plan id and not the Gemini model tier ("free" | "premium").
   * The model tier is an implementation detail of how a plan is fulfilled and is
   * derivable via PLANS[planId].modelTier.
   */
  planId: PlanId;
  score: number;
  payload: RoastResult;
  createdAt: Date;
  updatedAt: Date;
  user?: UserRow | null;
}

export const ReportSchema = new EntitySchema<ReportRow>({
  name: "Report",
  tableName: "reports",
  columns: {
    id: { type: "varchar", length: 36, primary: true },
    userId: { type: "varchar", length: 36, nullable: true },
    url: { type: "varchar", length: 2048 },
    planId: { type: "varchar", length: 16 },
    score: { type: "int" },
    payload: { type: "json" },
    createdAt: {
      type: "datetime",
      precision: 3,
      createDate: true,
      default: () => "CURRENT_TIMESTAMP(3)",
    },
    updatedAt: {
      type: "datetime",
      precision: 3,
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP(3)",
      onUpdate: "CURRENT_TIMESTAMP(3)",
    },
  },
  // Covers both access patterns: a user's history newest-first, and the
  // count-per-period query Phase 2 needs for quota enforcement.
  indices: [{ columns: ["userId", "createdAt"] }],
  relations: {
    // Reports are personal audit history with no value once the account is
    // gone, so deleting a user deletes their reports. SET NULL would leave
    // orphaned rows nobody can reach that still contain the user's audited
    // URLs — worse for privacy, no benefit for the MVP.
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      nullable: true,
    },
  },
});
