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
import { isValidUrl, normalizeAuditUrl } from "../lib/utils";

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

describe("normalizeAuditUrl", () => {
  it("collapses equivalent spellings of the same page to one form", () => {
    const expected = "https://example.com/";
    assert.equal(normalizeAuditUrl("example.com"), expected);
    assert.equal(normalizeAuditUrl("https://example.com"), expected);
    assert.equal(normalizeAuditUrl("https://example.com/"), expected);
    assert.equal(normalizeAuditUrl("  https://EXAMPLE.com/  "), expected);
    assert.equal(normalizeAuditUrl("https://example.com:443/"), expected);
  });

  it("preserves parts that change which page is fetched", () => {
    assert.equal(normalizeAuditUrl("http://example.com/"), "http://example.com/");
    assert.equal(normalizeAuditUrl("https://example.com/pricing"), "https://example.com/pricing");
    assert.equal(
      normalizeAuditUrl("https://example.com/p?ref=x#top"),
      "https://example.com/p?ref=x#top"
    );
    assert.equal(normalizeAuditUrl("https://example.com:8080/"), "https://example.com:8080/");
  });

  it("rejects input that is not a usable public URL", () => {
    for (const value of ["", "   ", "not a url", "localhost", "ftp://example.com"]) {
      assert.equal(normalizeAuditUrl(value), null);
    }
  });

  it("agrees with isValidUrl on acceptance", () => {
    assert.equal(isValidUrl("example.com"), true);
    assert.ok(normalizeAuditUrl("example.com"));
    assert.equal(isValidUrl("localhost"), false);
    assert.equal(normalizeAuditUrl("localhost"), null);
  });
});
