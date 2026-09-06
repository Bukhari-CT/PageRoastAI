import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, it } from "node:test";

import { getDataSource } from "../../src/Infrastructure/Database/DBConnection";
import { UserSchema } from "../../src/Infrastructure/Database/Models/UserSchema";
import {
  AUDIT_RUN_STATUS,
  AuditRunSchema,
  type AuditRunStatus,
} from "../../src/Infrastructure/Database/Models/AuditRunSchema";
import {
  AuditRunRepository,
  RESERVATION_TTL_MS,
} from "../../src/Infrastructure/Database/Repositories/AuditRunRepository";
import { resolveUsagePeriod } from "../../src/Application/Usage/UsagePeriod";
import { PLANS } from "../../shared/config/plans";

/**
 * These exercise the quota ledger against a real MySQL instance, because the
 * property under test — that two concurrent requests cannot both claim the last
 * slot — only exists at the database level. A mocked repository would prove
 * nothing.
 *
 * Run with `npm run test:integration`. Kept out of `npm test` so the unit suite
 * stays fast and dependency-free.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function assertLocalDatabase() {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set; run via npm run test:integration");

  const host = new URL(raw).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error("refusing to run integration tests against a non-local database");
  }
}

const repository = new AuditRunRepository();
let userId: string;

async function countRuns(status?: AuditRunStatus): Promise<number> {
  const dataSource = await getDataSource();
  return dataSource.getRepository(AuditRunSchema).count({
    where: status ? { userId, status } : { userId },
  });
}

/** Marks the given number of runs completed, simulating prior usage. */
async function seedCompletedRuns(planId: "free" | "pro", count: number) {
  const dataSource = await getDataSource();
  const period = resolveUsagePeriod(planId, new Date());
  const rows = Array.from({ length: count }, () => ({
    id: randomUUID(),
    userId,
    planId,
    periodKey: period.key,
    status: AUDIT_RUN_STATUS.COMPLETED,
    reservedUntil: new Date(Date.now() - 1000),
    reportId: null,
    completedAt: new Date(),
  }));
  if (rows.length) await dataSource.getRepository(AuditRunSchema).insert(rows);
}

before(async () => {
  assertLocalDatabase();
  const dataSource = await getDataSource();

  userId = randomUUID();
  await dataSource.getRepository(UserSchema).insert({
    id: userId,
    name: "Quota Test",
    firstName: "Quota",
    lastName: "Test",
    email: `quota-${userId}@test.invalid`,
    emailVerified: true,
    image: null,
    isAdmin: false,
    package: null,
  });
});

after(async () => {
  const dataSource = await getDataSource();
  // Removing the user cascades its audit runs away.
  await dataSource.getRepository(UserSchema).delete({ id: userId });
  await dataSource.destroy();
});

beforeEach(async () => {
  const dataSource = await getDataSource();
  await dataSource.getRepository(AuditRunSchema).delete({ userId });
});

describe("quota reservation — concurrency", () => {
  it("lets exactly one of many simultaneous Free attempts through", async () => {
    const now = new Date();

    // Genuinely parallel: every promise is created before any is awaited, so
    // the attempts overlap inside the database rather than running in sequence.
    const outcomes = await Promise.all(
      Array.from({ length: 8 }, () =>
        repository.reserveAudit({ userId, planId: "free", now })
      )
    );

    const reserved = outcomes.filter((o) => o.outcome === "reserved");
    assert.equal(reserved.length, 1, "exactly one attempt may claim the slot");

    for (const outcome of outcomes.filter((o) => o.outcome !== "reserved")) {
      assert.ok(
        outcome.outcome === "audit_in_progress" || outcome.outcome === "limit_reached",
        `unexpected outcome: ${outcome.outcome}`
      );
    }

    assert.equal(await countRuns(), 1, "only one ledger row may exist");
  });

  it("holds the line at the Pro boundary under concurrency", async () => {
    // One slot left out of 30.
    await seedCompletedRuns("pro", PLANS.pro.auditLimit - 1);
    const now = new Date();

    const outcomes = await Promise.all(
      Array.from({ length: 6 }, () =>
        repository.reserveAudit({ userId, planId: "pro", now })
      )
    );

    assert.equal(outcomes.filter((o) => o.outcome === "reserved").length, 1);
    assert.equal(await countRuns(AUDIT_RUN_STATUS.RESERVED), 1);
  });

  it("refuses every attempt once the Pro limit is already spent", async () => {
    await seedCompletedRuns("pro", PLANS.pro.auditLimit);

    const outcome = await repository.reserveAudit({
      userId,
      planId: "pro",
      now: new Date(),
    });

    assert.equal(outcome.outcome, "limit_reached");
    assert.equal(await countRuns(AUDIT_RUN_STATUS.RESERVED), 0);
  });
});

describe("quota reservation — limits", () => {
  it("blocks a Free user's second audit once the first completed", async () => {
    const first = await repository.reserveAudit({ userId, planId: "free", now: new Date() });
    assert.equal(first.outcome, "reserved");

    await repository.markCompleted(
      (first as { auditRunId: string }).auditRunId,
      // No report row needed: the FK is nullable and this asserts quota, not linkage.
      null as unknown as string,
      new Date()
    );

    const second = await repository.reserveAudit({ userId, planId: "free", now: new Date() });
    assert.equal(second.outcome, "limit_reached");
    assert.equal((second as { used: number }).used, 1);
    assert.equal((second as { limit: number }).limit, 1);
  });

  it("reports usage that counts only completed runs", async () => {
    await seedCompletedRuns("free", 1);

    const counts = await repository.getUsageCounts(
      userId,
      resolveUsagePeriod("free", new Date()).key,
      new Date()
    );

    assert.equal(counts.completed, 1);
    assert.equal(counts.hasActiveReservation, false);
  });
});

describe("quota reservation — failed runs release quota", () => {
  it("does not consume the allowance when an audit fails", async () => {
    const reservation = await repository.reserveAudit({
      userId,
      planId: "free",
      now: new Date(),
    });
    assert.equal(reservation.outcome, "reserved");

    await repository.markFailed((reservation as { auditRunId: string }).auditRunId, new Date());

    const counts = await repository.getUsageCounts(
      userId,
      resolveUsagePeriod("free", new Date()).key,
      new Date()
    );
    assert.equal(counts.completed, 0, "a failed run must not count as used");
    assert.equal(counts.hasActiveReservation, false, "and must not hold the slot");

    // The user can immediately try again.
    const retry = await repository.reserveAudit({ userId, planId: "free", now: new Date() });
    assert.equal(retry.outcome, "reserved");

    // The failed row is retained for debugging rather than deleted.
    assert.equal(await countRuns(AUDIT_RUN_STATUS.FAILED), 1);
  });
});

describe("quota reservation — stale reservations", () => {
  it("does not let an expired reservation block the user forever", async () => {
    const dataSource = await getDataSource();

    // A process that crashed after reserving: still `reserved`, but expired.
    await dataSource.getRepository(AuditRunSchema).insert({
      id: randomUUID(),
      userId,
      planId: "free",
      periodKey: resolveUsagePeriod("free", new Date()).key,
      status: AUDIT_RUN_STATUS.RESERVED,
      reservedUntil: new Date(Date.now() - RESERVATION_TTL_MS - 1000),
      reportId: null,
      completedAt: null,
    });

    const outcome = await repository.reserveAudit({
      userId,
      planId: "free",
      now: new Date(),
    });

    assert.equal(outcome.outcome, "reserved", "an expired reservation must not hold capacity");
  });

  it("still blocks while a reservation is live", async () => {
    const first = await repository.reserveAudit({ userId, planId: "free", now: new Date() });
    assert.equal(first.outcome, "reserved");

    const second = await repository.reserveAudit({ userId, planId: "free", now: new Date() });
    assert.equal(second.outcome, "audit_in_progress");
  });

  it("counts a live reservation as active usage", async () => {
    await repository.reserveAudit({ userId, planId: "free", now: new Date() });

    const counts = await repository.getUsageCounts(
      userId,
      resolveUsagePeriod("free", new Date()).key,
      new Date()
    );

    assert.equal(counts.completed, 0);
    assert.equal(counts.hasActiveReservation, true);
  });
});
