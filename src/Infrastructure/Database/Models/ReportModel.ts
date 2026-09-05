import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import type { UserModel } from "./UserModel";
import type { RoastResult } from "@/schemas/roast";
import type { ModelTier } from "@/shared/config/plans";

/**
 * A persisted audit.
 *
 * `payload` holds the complete Zod-validated RoastResult as JSON — the
 * canonical report body. `score` is lifted into its own column so dashboard
 * listings can sort and display without parsing JSON for every row.
 */
@Entity("reports")
// Covers the two access patterns we have: a user's history, newest first, and
// the count-per-period query Phase 2 will need for quota enforcement.
@Index(["userId", "createdAt"])
export class ReportModel {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id!: string;

  /**
   * Nullable only for reports created before authentication became mandatory:
   * the landing page still allows anonymous audits, and Phase 2 will require a
   * session before an audit can run. Application code always sets this when a
   * session exists — see app/actions/roast.actions.ts.
   */
  @Column({ type: "varchar", length: 36, nullable: true })
  userId!: string | null;

  /** Normalized absolute URL. 2048 fits the practical browser/CDN URL ceiling. */
  @Column({ type: "varchar", length: 2048 })
  url!: string;

  /** Model entitlement used for this audit: "free" | "premium". */
  @Column({ type: "varchar", length: 16 })
  tier!: ModelTier;

  @Column({ type: "int" })
  score!: number;

  @Column({ type: "json" })
  payload!: RoastResult;

  @CreateDateColumn({
    type: "datetime",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP(3)",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "datetime",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP(3)",
    onUpdate: "CURRENT_TIMESTAMP(3)",
  })
  updatedAt!: Date;

  // Reports are personal audit history with no value once the account is gone,
  // so deleting a user deletes their reports. SET NULL would leave orphaned
  // rows that nobody can reach through the product but that still contain the
  // user's audited URLs — worse for privacy, no benefit for the MVP.
  @ManyToOne("UserModel", {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "userId" })
  user!: UserModel | null;
}
