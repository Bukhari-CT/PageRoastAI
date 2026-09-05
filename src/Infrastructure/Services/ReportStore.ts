import 'server-only';
import type { RoastResult } from '@/schemas/roast';
import type { ModelTier } from './LlmClient';

export interface StoredReport extends RoastResult {
  id: string;
  url: string;
  date: string;
  tier: ModelTier;
}

const MAX_REPORTS = 500;

declare global {
  var __reportStore: Map<string, StoredReport> | undefined;
}

// Guarded on globalThis so the store survives Turbopack/webpack module
// re-execution during dev hot-reloads (same pattern as the DI container).
const store: Map<string, StoredReport> = globalThis.__reportStore ?? new Map();
globalThis.__reportStore = store;

/**
 * In-memory report cache — no DB entity exists yet for persisted audits.
 * Ephemeral (cleared on server restart) and capped, which is fine for now:
 * this backs the "view full report" flow right after a roast, not
 * long-term history.
 */
export function saveReport(report: StoredReport): void {
  store.set(report.id, report);
  if (store.size > MAX_REPORTS) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
}

export function getReport(id: string): StoredReport | undefined {
  return store.get(id);
}

export function generateReportId(): string {
  return crypto.randomUUID();
}
