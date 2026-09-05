import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canViewReport,
  isModelTier,
  toStoredReport,
  type ReportRowLike,
} from "../src/Application/Report/ReportMapper";

const validPayload = {
  score: 42,
  strengths: [{ headline: "Fast load", detail: "Under two seconds." }],
  criticalIssues: [
    { title: "CTA below fold", desc: "Primary action is not visible.", severity: "CRITICAL" },
  ],
  roastLines: [{ headline: "Your CTA is hiding.", detail: "Nobody scrolls that far." }],
  rewrittenHeroCopy: "Turn visitors into customers.",
  elementGrades: [
    { label: "Hero Section", score: 30 },
    { label: "CTA Button", score: 45 },
    { label: "Copy Clarity", score: 60 },
  ],
  actionFixes: [
    { priority: "CRITICAL", title: "Move the CTA up", copy: "Start free", code: "<button />" },
  ],
};

function row(overrides: Partial<ReportRowLike> = {}): ReportRowLike {
  return {
    id: "report-1",
    userId: "user-a",
    url: "https://example.com/",
    tier: "premium",
    score: 42,
    payload: validPayload,
    createdAt: new Date("2026-09-06T10:00:00.000Z"),
    ...overrides,
  };
}

describe("toStoredReport", () => {
  it("maps a valid row into the report shape the UI renders", () => {
    const report = toStoredReport(row());

    assert.ok(report);
    assert.equal(report.id, "report-1");
    assert.equal(report.userId, "user-a");
    assert.equal(report.url, "https://example.com/");
    assert.equal(report.tier, "premium");
    assert.equal(report.score, 42);
    assert.equal(report.rewrittenHeroCopy, "Turn visitors into customers.");
    assert.equal(report.criticalIssues.length, 1);
    // A real Date, not a pre-formatted string — the UI does the formatting.
    assert.ok(report.createdAt instanceof Date);
  });

  it("parses a payload that comes back as a JSON string", () => {
    const report = toStoredReport(row({ payload: JSON.stringify(validPayload) }));
    assert.ok(report);
    assert.equal(report.score, 42);
  });

  it("returns null for a payload that no longer matches the schema", () => {
    assert.equal(toStoredReport(row({ payload: { score: 42 } })), null);
    assert.equal(toStoredReport(row({ payload: "not json at all" })), null);
    assert.equal(toStoredReport(row({ payload: null })), null);
  });

  it("returns null for an unrecognised tier rather than trusting the string", () => {
    assert.equal(toStoredReport(row({ tier: "agency" })), null);
    assert.equal(toStoredReport(row({ tier: "" })), null);
  });

  it("returns null for a missing row", () => {
    assert.equal(toStoredReport(null), null);
    assert.equal(toStoredReport(undefined), null);
  });

  it("normalises a missing owner to null", () => {
    const report = toStoredReport(row({ userId: null }));
    assert.ok(report);
    assert.equal(report.userId, null);
  });
});

describe("isModelTier", () => {
  it("accepts only the two real model tiers", () => {
    assert.equal(isModelTier("free"), true);
    assert.equal(isModelTier("premium"), true);
    assert.equal(isModelTier("pro"), false);
    assert.equal(isModelTier("agency"), false);
    assert.equal(isModelTier(undefined), false);
  });
});

describe("canViewReport", () => {
  it("lets the owner read their own report", () => {
    assert.equal(canViewReport({ userId: "user-a" }, { id: "user-a" }), true);
  });

  it("refuses another user's report", () => {
    assert.equal(canViewReport({ userId: "user-a" }, { id: "user-b" }), false);
  });

  it("refuses anonymous viewers", () => {
    assert.equal(canViewReport({ userId: "user-a" }, null), false);
    assert.equal(canViewReport({ userId: "user-a" }, undefined), false);
  });

  it("refuses legacy ownerless reports for everyone", () => {
    assert.equal(canViewReport({ userId: null }, { id: "user-a" }), false);
    assert.equal(canViewReport({ userId: null }, null), false);
  });

  it("allows an admin to read any owned report", () => {
    assert.equal(canViewReport({ userId: "user-a" }, { id: "admin", isAdmin: true }), true);
  });
});
