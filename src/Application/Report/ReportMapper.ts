import { roastResultSchema, type RoastResult } from "@/schemas/roast";
import type { ModelTier } from "@/shared/config/plans";

/**
 * The report shape the UI renders.
 *
 * `createdAt` is a real Date — formatting is the UI's job. The previous
 * in-memory store persisted a pre-formatted `date` string ("Sep 5, 2026"),
 * which is unusable for sorting or period queries.
 */
export interface StoredReport extends RoastResult {
  id: string;
  userId: string | null;
  url: string;
  tier: ModelTier;
  createdAt: Date;
}

/** A persisted row, before we have decided to trust any of it. */
export interface ReportRowLike {
  id: string;
  userId: string | null;
  url: string;
  tier: string;
  score: number;
  payload: unknown;
  createdAt: Date;
}

export function isModelTier(value: unknown): value is ModelTier {
  return value === "free" || value === "premium";
}

/**
 * Rows are written only after `roastResultSchema` has validated them, but a
 * later schema change would leave older rows that no longer match. Rather than
 * building a versioning system now, a row whose payload fails validation is
 * treated as unreadable and surfaces as "report not found" — the same
 * experience as a missing report, and never a half-rendered one.
 *
 * Returns null instead of throwing so callers handle it as an ordinary miss.
 */
export function toStoredReport(row: ReportRowLike | null | undefined): StoredReport | null {
  if (!row) return null;

  // MySQL JSON columns normally come back parsed, but a driver or column-type
  // change could hand us the raw string.
  let rawPayload: unknown = row.payload;
  if (typeof rawPayload === "string") {
    try {
      rawPayload = JSON.parse(rawPayload);
    } catch {
      return null;
    }
  }

  const parsed = roastResultSchema.safeParse(rawPayload);
  if (!parsed.success) return null;

  if (!isModelTier(row.tier)) return null;

  return {
    ...parsed.data,
    id: row.id,
    userId: row.userId ?? null,
    url: row.url,
    tier: row.tier,
    createdAt: row.createdAt,
  };
}

/**
 * True when `viewerId` may read this report.
 *
 * Legacy anonymous rows (userId null) are readable by nobody — they predate
 * mandatory authentication and have no owner to check against, so the safe
 * default is to withhold them rather than make them world-readable.
 */
export function canViewReport(
  report: { userId: string | null },
  viewer: { id: string; isAdmin?: boolean } | null | undefined
): boolean {
  if (!viewer) return false;
  if (viewer.isAdmin) return true;
  return report.userId !== null && report.userId === viewer.id;
}
