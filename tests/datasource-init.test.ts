import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DataSource } from "typeorm";

import { ensureDataSourceInitialized } from "../src/Infrastructure/Database/DBConnection";

/**
 * A stand-in for a TypeORM DataSource that counts initialize() calls.
 *
 * Only the two members `ensureDataSourceInitialized` touches are implemented,
 * so the cast is narrow and does not pretend to be a real DataSource.
 */
function makeFakeDataSource(options: { failFirst?: boolean } = {}) {
  let calls = 0;
  let failed = false;

  const fake = {
    isInitialized: false,
    async initialize() {
      calls += 1;
      // Simulate the async gap in which a concurrent caller would otherwise
      // observe isInitialized === false and start a second initialization.
      await new Promise((resolve) => setTimeout(resolve, 10));

      if (options.failFirst && !failed) {
        failed = true;
        throw new Error("connection refused");
      }

      fake.isInitialized = true;
      return fake;
    },
  };

  return { fake: fake as unknown as DataSource, calls: () => calls };
}

describe("ensureDataSourceInitialized", () => {
  it("initializes once when many callers race during a cold start", async () => {
    const { fake, calls } = makeFakeDataSource();

    const results = await Promise.all([
      ensureDataSourceInitialized(fake),
      ensureDataSourceInitialized(fake),
      ensureDataSourceInitialized(fake),
      ensureDataSourceInitialized(fake),
    ]);

    // One pool, not four.
    assert.equal(calls(), 1);
    for (const result of results) {
      assert.equal(result, fake);
    }
  });

  it("returns the warm instance without re-initializing", async () => {
    const { fake, calls } = makeFakeDataSource();

    await ensureDataSourceInitialized(fake);
    await ensureDataSourceInitialized(fake);
    await ensureDataSourceInitialized(fake);

    assert.equal(calls(), 1);
  });

  it("allows a retry after a failed initialization instead of caching the failure", async () => {
    const { fake, calls } = makeFakeDataSource({ failFirst: true });

    await assert.rejects(() => ensureDataSourceInitialized(fake), /connection refused/);

    // A transient database outage must not poison the instance for its lifetime.
    const recovered = await ensureDataSourceInitialized(fake);
    assert.equal(recovered, fake);
    assert.equal(calls(), 2);
  });

  it("tracks each DataSource separately", async () => {
    const first = makeFakeDataSource();
    const second = makeFakeDataSource();

    await Promise.all([
      ensureDataSourceInitialized(first.fake),
      ensureDataSourceInitialized(second.fake),
    ]);

    assert.equal(first.calls(), 1);
    assert.equal(second.calls(), 1);
  });
});
