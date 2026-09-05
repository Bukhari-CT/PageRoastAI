import {
  SCORE_THRESHOLD_GOOD,
  SCORE_THRESHOLD_MEDIUM,
  GRADE_THRESHOLD_EXCEPTIONAL,
  GRADE_THRESHOLD_GOOD,
  GRADE_THRESHOLD_NEEDS_WORK,
} from "@/constants";

// ─── Score Helpers ───────────────────────────────────────────────────────────

export function getScoreColorClass(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return "bg-green-500/20 text-green-400";
  if (score >= SCORE_THRESHOLD_MEDIUM) return "bg-yellow-500/20 text-yellow-400";
  return "bg-red-500/20 text-red-400";
}

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return "#22c55e";
  if (score >= SCORE_THRESHOLD_MEDIUM) return "#eab308";
  return "#ef4444";
}

export function getScoreBgColor(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return "rgba(34,197,94,0.1)";
  if (score >= SCORE_THRESHOLD_MEDIUM) return "rgba(234,179,8,0.1)";
  return "rgba(239,68,68,0.1)";
}

export function getScoreBorderColor(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return "rgba(34,197,94,0.2)";
  if (score >= SCORE_THRESHOLD_MEDIUM) return "rgba(234,179,8,0.2)";
  return "rgba(239,68,68,0.2)";
}

export function getGradeLabel(score: number): string {
  if (score >= GRADE_THRESHOLD_EXCEPTIONAL) return "Exceptional";
  if (score >= GRADE_THRESHOLD_GOOD) return "Good";
  if (score >= GRADE_THRESHOLD_NEEDS_WORK) return "Needs Work";
  return "Unsatisfactory";
}

export function getGradeColor(score: number): string {
  // Returned as plain hex (not var(--token)) so callers can safely append an
  // alpha suffix, e.g. `${getGradeColor(score)}15` for a tinted background.
  if (score >= GRADE_THRESHOLD_EXCEPTIONAL) return "#22C55E";
  if (score >= GRADE_THRESHOLD_GOOD) return "#4F46E5";
  if (score >= GRADE_THRESHOLD_NEEDS_WORK) return "#EAB308";
  return "#EF4444";
}

// ─── Plan Badge Helpers ──────────────────────────────────────────────────────

export function getPlanBadgeClass(plan: string): string {
  return plan.toLowerCase() === "pro"
    ? "bg-indigo-600/20 text-indigo-400"
    : "bg-muted text-muted-foreground";
}

// ─── SVG Score Ring ──────────────────────────────────────────────────────────

export function getScoreOffset(score: number, circumference: number): number {
  return circumference - (circumference * score) / 100;
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

/**
 * Formats a persisted timestamp for display.
 *
 * Pinned to en-US and UTC so a server-rendered date and its client hydration
 * always agree — a locale- or timezone-dependent format produces a hydration
 * mismatch whenever the two differ.
 */
export function formatReportDate(date: Date | string): string {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "Unknown date";

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
