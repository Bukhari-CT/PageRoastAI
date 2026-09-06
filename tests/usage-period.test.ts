import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LIFETIME_PERIOD_KEY,
  resolveUsagePeriod,
} from "../src/Application/Usage/UsagePeriod";

describe("usage period", () => {
  it("gives Free a lifetime window with no reset", () => {
    const period = resolveUsagePeriod("free", new Date("2026-09-06T12:00:00Z"));

    assert.equal(period.key, LIFETIME_PERIOD_KEY);
    assert.equal(period.start, null);
    // No end means no reset date — the UI must not invent one.
    assert.equal(period.end, null);
  });

  it("gives Pro the current UTC calendar month", () => {
    const period = resolveUsagePeriod("pro", new Date("2026-09-06T12:00:00Z"));

    assert.equal(period.key, "2026-09");
    assert.equal(period.start?.toISOString(), "2026-09-01T00:00:00.000Z");
    assert.equal(period.end?.toISOString(), "2026-10-01T00:00:00.000Z");
  });

  it("zero-pads single-digit months so keys sort correctly", () => {
    assert.equal(resolveUsagePeriod("pro", new Date("2026-01-15T00:00:00Z")).key, "2026-01");
    assert.equal(resolveUsagePeriod("pro", new Date("2026-12-15T00:00:00Z")).key, "2026-12");
  });

  it("rolls December over into the next January", () => {
    const period = resolveUsagePeriod("pro", new Date("2026-12-31T23:59:59Z"));
    assert.equal(period.key, "2026-12");
    assert.equal(period.end?.toISOString(), "2027-01-01T00:00:00.000Z");
  });

  it("is computed in UTC, not local time", () => {
    // 23:30 on the 31st UTC is already the next month in some local zones. The
    // key must not depend on where the server happens to run.
    const period = resolveUsagePeriod("pro", new Date("2026-09-30T23:30:00Z"));
    assert.equal(period.key, "2026-09");
  });

  it("puts an instant exactly on the boundary in the new period", () => {
    assert.equal(resolveUsagePeriod("pro", new Date("2026-10-01T00:00:00.000Z")).key, "2026-10");
  });
});
