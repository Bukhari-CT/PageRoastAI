import 'server-only';
import { randomUUID } from 'crypto';

import type { RoastResult } from '@/schemas/roast';
import type { ModelTier } from '@/shared/config/plans';
import { reportRepository } from '@diContainer/Resolver';
import {
  canViewReport,
  toStoredReport,
  type StoredReport,
} from '@application/Report/ReportMapper';
import {
  DEFAULT_HISTORY_LIMIT,
} from '@repositories/ReportRepository';

export type { StoredReport };

export interface NewReport {
  url: string;
  tier: ModelTier;
  userId: string | null;
  result: RoastResult;
}

/**
 * Durable, MySQL-backed report persistence.
 *
 * This replaced a `globalThis` Map. That store was per-process, so on a
 * serverless target a report written while handling the audit was frequently
 * invisible to the instance that later served /report/[id], and every restart
 * or redeploy lost everything.
 *
 * The seam (saveReport / getReport / generateReportId) is unchanged in shape;
 * the operations are now asynchronous because they hit the database.
 */

export function generateReportId(): string {
  return randomUUID();
}

/**
 * Persists a validated report and returns the stored form.
 *
 * Throws if the write fails — callers must surface an error rather than hand
 * the user a report URL that resolves to nothing.
 */
export async function saveReport(report: NewReport): Promise<StoredReport> {
  const id = generateReportId();

  const row = await reportRepository.create({
    id,
    userId: report.userId,
    url: report.url,
    tier: report.tier,
    score: report.result.score,
    payload: report.result,
  });

  return {
    ...report.result,
    id,
    userId: report.userId,
    url: report.url,
    tier: report.tier,
    // `create` returns the saved entity; createdAt is filled by the database
    // default, which TypeORM may not echo back on insert.
    createdAt: row.createdAt ?? new Date(),
  };
}

/**
 * Loads a report by id without any access check.
 *
 * Prefer `getReportForViewer` in request paths — reports are private, and this
 * variant exists for callers that have already established authorization.
 */
export async function getReport(id: string): Promise<StoredReport | null> {
  const row = await reportRepository.fetch({ id });
  return toStoredReport(row);
}

/**
 * Loads a report only if the viewer is allowed to see it.
 *
 * Returns null both when the report does not exist and when it belongs to
 * someone else, so callers cannot leak the existence of another user's report.
 */
export async function getReportForViewer(
  id: string,
  viewer: { id: string; isAdmin?: boolean } | null | undefined
): Promise<StoredReport | null> {
  const row = await reportRepository.fetch({ id });
  if (!row) return null;
  if (!canViewReport(row, viewer)) return null;

  return toStoredReport(row);
}

/** Most recent reports for a user, newest first. */
export async function listReportsForUser(
  userId: string,
  limit: number = DEFAULT_HISTORY_LIMIT
): Promise<StoredReport[]> {
  const rows = await reportRepository.findByUserId(userId, { limit });

  return rows
    .map((row) => toStoredReport(row))
    .filter((report): report is StoredReport => report !== null);
}
