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
  if (score >= GRADE_THRESHOLD_EXCEPTIONAL) return "var(--success)";
  if (score >= GRADE_THRESHOLD_GOOD) return "var(--accent)";
  if (score >= GRADE_THRESHOLD_NEEDS_WORK) return "var(--warning)";
  return "var(--danger)";
}

// ─── Plan Badge Helpers ──────────────────────────────────────────────────────

export function getPlanBadgeClass(plan: string): string {
  switch (plan.toLowerCase()) {
    case "agency":
      return "bg-violet-600/20 text-violet-400";
    case "pro":
      return "bg-indigo-600/20 text-indigo-400";
    default:
      return "bg-zinc-800 text-zinc-400";
  }
}

export function getStatusBadgeClass(status: string): string {
  return status === "Active"
    ? "bg-green-500/20 text-green-400 border-green-500/20"
    : "bg-red-500/20 text-red-400 border-red-500/20";
}

// ─── SVG Score Ring ──────────────────────────────────────────────────────────

export function getScoreOffset(score: number, circumference: number): number {
  return circumference - (circumference * score) / 100;
}
