export * from "./loading";
export * from "./mock-data";
export * from "./plans";
export * from "./navigation";

// ─── UI Configuration ────────────────────────────────────────────────────────

export const DEMO_AUDIT_SCORE = 42;
export const DEMO_QUICK_SCORE = 67;
export const SCORE_RING_RADIUS = 50;
export const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * SCORE_RING_RADIUS; // ~314

// ─── Score Thresholds ────────────────────────────────────────────────────────

export const SCORE_THRESHOLD_GOOD = 70;
export const SCORE_THRESHOLD_MEDIUM = 50;
export const GRADE_THRESHOLD_EXCEPTIONAL = 85;
export const GRADE_THRESHOLD_GOOD = 65;
export const GRADE_THRESHOLD_NEEDS_WORK = 45;

// ─── Validation ──────────────────────────────────────────────────────────────

export const MIN_PASSWORD_LENGTH = 6;
export const MIN_SIGNUP_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 2;
export const CARD_NUMBER_LENGTH = 16;

// ─── Regex Patterns ──────────────────────────────────────────────────────────

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CARD_REGEX = /^\d{16}$/;
export const EXPIRY_REGEX = /^\d{2}\/\d{2}$/;
export const CVC_REGEX = /^\d{3,4}$/;

// ─── Timing ──────────────────────────────────────────────────────────────────

export const COPY_FEEDBACK_DURATION_MS = 2000;
export const PAYMENT_SUCCESS_DURATION_MS = 3000;
export const WAITLIST_SUCCESS_DURATION_MS = 3000;
export const FAKE_LOADING_DURATION_MS = 3000;
