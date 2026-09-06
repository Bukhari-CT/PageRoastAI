import { injectable } from "tsyringe";
import { MoreThan, type EntityManager } from "typeorm";

import { getDataSource } from "@database/DBConnection";
import { AUDIT_RUN_STATUS, AuditRunSchema } from "@models/AuditRunSchema";
import { UserSchema } from "@models/UserSchema";
import type {
  AuditUsageCounts,
  IAuditRunRepository,
  ReservationOutcome,
  ReserveAuditInput,
} from "@domain/AuditRun/IAuditRunRepository";
import { PLANS } from "@/shared/config/plans";
import { resolveUsagePeriod } from "@application/Usage/UsagePeriod";
import { generateId } from "@application/Shared/SharedUtils";

/**
 * How long a claimed slot stays valid.
 *
 * Must comfortably exceed the worst-case pipeline (page fetch budget ~15s +
 * two Gemini attempts ~62s + database work) so a legitimate slow audit is never
 * released while still running, and must be short enough that a process which
 * crashes mid-audit does not lock the user out for long. Five minutes is ~3x
 * the worst case.
 */
export const RESERVATION_TTL_MS = 5 * 60 * 1000;

/** Only one audit may be in flight per user — see reserveAudit. */
const MAX_CONCURRENT_RESERVATIONS = 1;

@injectable()
export class AuditRunRepository implements IAuditRunRepository {
  /**
   * Claims a quota slot atomically.
   *
   * Counting completed runs and then calling Gemini is not sufficient: two
   * concurrent requests both pass the count and both spend money. So the whole
   * decision happens inside one short transaction that begins by taking a row
   * lock on the user (`SELECT ... FOR UPDATE`). Concurrent attempts by the same
   * user serialize on that lock and therefore observe each other's committed
   * inserts; different users never block each other.
   *
   * The transaction contains no network or model work — it opens, decides,
   * inserts and commits. Everything expensive happens after it closes.
   */
  async reserveAudit({ userId, planId, now }: ReserveAuditInput): Promise<ReservationOutcome> {
    const dataSource = await getDataSource();
    const plan = PLANS[planId];
    const period = resolveUsagePeriod(planId, now);

    return dataSource.transaction(async (manager) => {
      // Serialization point. Everything below runs one-at-a-time per user.
      await manager.findOne(UserSchema, {
        where: { id: userId },
        lock: { mode: "pessimistic_write" },
      });

      // A live reservation means an audit is already running for this user.
      // This caps concurrent model spend at one call per user and absorbs
      // accidental double-submits.
      const activeReservations = await manager.count(AuditRunSchema, {
        where: {
          userId,
          status: AUDIT_RUN_STATUS.RESERVED,
          reservedUntil: MoreThan(now),
        },
      });

      if (activeReservations >= MAX_CONCURRENT_RESERVATIONS) {
        return { outcome: "audit_in_progress" };
      }

      const used = await this.countCompleted(manager, userId, period.key);
      if (used >= plan.auditLimit) {
        return { outcome: "limit_reached", used, limit: plan.auditLimit };
      }

      const auditRunId = generateId();
      await manager.insert(AuditRunSchema, {
        id: auditRunId,
        userId,
        planId,
        periodKey: period.key,
        status: AUDIT_RUN_STATUS.RESERVED,
        reservedUntil: new Date(now.getTime() + RESERVATION_TTL_MS),
        reportId: null,
        completedAt: null,
      });

      return {
        outcome: "reserved",
        auditRunId,
        periodKey: period.key,
        // `used` excludes this reservation; it is what the user had consumed
        // before this attempt.
        used,
        limit: plan.auditLimit,
      };
    });
  }

  async markCompleted(auditRunId: string, reportId: string, now: Date): Promise<void> {
    const dataSource = await getDataSource();
    await dataSource.getRepository(AuditRunSchema).update(
      { id: auditRunId },
      { status: AUDIT_RUN_STATUS.COMPLETED, reportId, completedAt: now }
    );
  }

  /**
   * Releases a slot. The row is kept rather than deleted so a failed attempt
   * remains visible for debugging, but `failed` never counts toward quota.
   */
  async markFailed(auditRunId: string, now: Date): Promise<void> {
    const dataSource = await getDataSource();
    await dataSource.getRepository(AuditRunSchema).update(
      { id: auditRunId },
      { status: AUDIT_RUN_STATUS.FAILED, completedAt: now }
    );
  }

  async getUsageCounts(userId: string, periodKey: string, now: Date): Promise<AuditUsageCounts> {
    const dataSource = await getDataSource();
    const manager = dataSource.manager;

    const [completed, active] = await Promise.all([
      this.countCompleted(manager, userId, periodKey),
      manager.count(AuditRunSchema, {
        where: {
          userId,
          status: AUDIT_RUN_STATUS.RESERVED,
          reservedUntil: MoreThan(now),
        },
      }),
    ]);

    return { completed, hasActiveReservation: active > 0 };
  }

  /**
   * Only `completed` runs count. A `failed` run consumed no value, and an
   * expired `reserved` row is filtered out by the caller's `reservedUntil`
   * check, so a crashed process cannot permanently consume a slot.
   */
  private countCompleted(
    manager: EntityManager,
    userId: string,
    periodKey: string
  ): Promise<number> {
    return manager.count(AuditRunSchema, {
      where: { userId, periodKey, status: AUDIT_RUN_STATUS.COMPLETED },
    });
  }
}
