import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_CONNECTION_LIMIT,
  resolveConnectionLimit,
  resolveDriverExtra,
  resolveLogging,
  resolveSsl,
  resolveSynchronize,
  shouldWarnAboutIgnoredSynchronize,
} from "../src/Infrastructure/Database/DataSourceConfig";

describe("resolveSynchronize", () => {
  it("is false in production even when DB_SYNCHRONIZE=true", () => {
    // The safety property this whole guard exists for: production must never be
    // able to let TypeORM ALTER or DROP live columns.
    assert.equal(
      resolveSynchronize({ NODE_ENV: "production", DB_SYNCHRONIZE: "true" }),
      false
    );
  });

  it("is false in production regardless of casing or truthy-looking values", () => {
    for (const value of ["TRUE", "1", "yes", "on"]) {
      assert.equal(
        resolveSynchronize({ NODE_ENV: "production", DB_SYNCHRONIZE: value }),
        false
      );
    }
  });

  it("honours DB_SYNCHRONIZE=true outside production", () => {
    assert.equal(
      resolveSynchronize({ NODE_ENV: "development", DB_SYNCHRONIZE: "true" }),
      true
    );
  });

  it("defaults to false when unset", () => {
    assert.equal(resolveSynchronize({ NODE_ENV: "development" }), false);
    assert.equal(resolveSynchronize({}), false);
  });

  it("warns only when production was actually asked to synchronize", () => {
    assert.equal(
      shouldWarnAboutIgnoredSynchronize({ NODE_ENV: "production", DB_SYNCHRONIZE: "true" }),
      true
    );
    assert.equal(
      shouldWarnAboutIgnoredSynchronize({ NODE_ENV: "production", DB_SYNCHRONIZE: "false" }),
      false
    );
    assert.equal(
      shouldWarnAboutIgnoredSynchronize({ NODE_ENV: "development", DB_SYNCHRONIZE: "true" }),
      false
    );
  });
});

describe("resolveConnectionLimit", () => {
  it("uses the conservative default when unset", () => {
    assert.equal(resolveConnectionLimit({}), DEFAULT_CONNECTION_LIMIT);
  });

  it("accepts a valid positive integer", () => {
    assert.equal(resolveConnectionLimit({ DB_CONNECTION_LIMIT: "5" }), 5);
  });

  it("falls back on values that would break the pool", () => {
    for (const value of ["0", "-1", "abc", "2.5", ""]) {
      assert.equal(
        resolveConnectionLimit({ DB_CONNECTION_LIMIT: value }),
        DEFAULT_CONNECTION_LIMIT
      );
    }
  });
});

describe("resolveSsl", () => {
  it("is undefined by default so local development is unaffected", () => {
    assert.equal(resolveSsl({}), undefined);
    assert.equal(resolveSsl({ DB_SSL: "false" }), undefined);
  });

  it("enables TLS with certificate validation when opted in", () => {
    assert.deepEqual(resolveSsl({ DB_SSL: "true" }), { rejectUnauthorized: true });
  });
});

describe("resolveLogging and resolveDriverExtra", () => {
  it("only logs when explicitly enabled", () => {
    assert.equal(resolveLogging({ DB_LOGGING: "true" }), true);
    assert.equal(resolveLogging({}), false);
  });

  it("keeps maxIdle aligned with the connection limit", () => {
    const extra = resolveDriverExtra({ DB_CONNECTION_LIMIT: "4" });
    assert.equal(extra.maxIdle, 4);
    assert.equal(extra.waitForConnections, true);
    assert.ok(extra.connectTimeout > 0);
  });
});
