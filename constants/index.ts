export * from "./loading";
export * from "./navigation";

// ─── Score Ring Geometry ─────────────────────────────────────────────────────

export const SCORE_RING_RADIUS = 50;
export const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * SCORE_RING_RADIUS; // ~314

// ─── Score Thresholds ────────────────────────────────────────────────────────

export const SCORE_THRESHOLD_GOOD = 70;
export const SCORE_THRESHOLD_MEDIUM = 50;
export const GRADE_THRESHOLD_EXCEPTIONAL = 85;
export const GRADE_THRESHOLD_GOOD = 65;
export const GRADE_THRESHOLD_NEEDS_WORK = 45;

// ─── Timing ──────────────────────────────────────────────────────────────────

export const COPY_FEEDBACK_DURATION_MS = 2000;
