import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FREE_PLAN,
  PLAN_LIST,
  PRO_PLAN,
  isPaidPlan,
  isPlanId,
  resolvePlan,
} from "../shared/config/plans";
import { isValidUrl } from "../lib/utils";

describe("plan configuration", () => {
  it("matches the agreed MVP shape", () => {
    assert.equal(FREE_PLAN.price, 0);
    assert.equal(FREE_PLAN.auditLimit, 1);
    assert.equal(FREE_PLAN.modelTier, "free");
    assert.equal(FREE_PLAN.billingInterval, null);

    assert.equal(PRO_PLAN.price, 19);
    assert.equal(PRO_PLAN.auditLimit, 30);
    assert.equal(PRO_PLAN.modelTier, "premium");
    assert.equal(PRO_PLAN.billingInterval, "month");
  });

  it("keeps plan id and Gemini model tier as separate concepts", () => {
    // Persisted reports store planId; only Gemini model selection uses modelTier.
    assert.equal(FREE_PLAN.id, "free");
    assert.equal(FREE_PLAN.modelTier, "free");
    assert.equal(PRO_PLAN.id, "pro");
    assert.equal(PRO_PLAN.modelTier, "premium");
    assert.notEqual(PRO_PLAN.id, PRO_PLAN.modelTier);
  });

  it("offers exactly two plans and no Agency tier", () => {
    assert.equal(PLAN_LIST.length, 2);
    assert.deepEqual(PLAN_LIST.map((plan) => plan.id), ["free", "pro"]);
    assert.equal(isPlanId("agency"), false);
  });

  it("never advertises an allowance the product does not enforce", () => {
    const claims = PLAN_LIST.flatMap((plan) => plan.features).join(" ").toLowerCase();
    for (const forbidden of ["unlimited", "lifetime", "one-time", "white-label", "api access"]) {
      assert.equal(claims.includes(forbidden), false, `plan features must not claim "${forbidden}"`);
    }
  });
});

describe("resolvePlan", () => {
  it("resolves known plan ids", () => {
    assert.equal(resolvePlan("free").id, "free");
    assert.equal(resolvePlan("pro").id, "pro");
  });

  it("falls back to Free for anything unrecognised", () => {
    // users.package is an unconstrained text column, so entitlement must never
    // be granted by an unvalidated string. "agency" is a real legacy value.
    for (const value of ["agency", "PRO", "", null, undefined, "enterprise"]) {
      assert.equal(resolvePlan(value).id, "free");
    }
  });

  it("treats only Pro as paid", () => {
    assert.equal(isPaidPlan("pro"), true);
    assert.equal(isPaidPlan("free"), false);
  });
});

describe("isValidUrl", () => {
  it("accepts public-looking hosts and rejects bare names", () => {
    assert.equal(isValidUrl("example.com"), true);
    assert.equal(isValidUrl("https://example.com/pricing"), true);
    assert.equal(isValidUrl("localhost"), false);
    assert.equal(isValidUrl("not a url"), false);
  });
});
