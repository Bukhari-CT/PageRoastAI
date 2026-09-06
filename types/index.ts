// ─── App-Level Types ─────────────────────────────────────────────────────────

export type AppView =
  | "landing"
  | "login"
  | "signup"
  | "dashboard";

export type UserTab = "dashboard" | "roast" | "history" | "subscription" | "settings";
export type UserRole = "user" | "admin";
export type LandingView = "hero" | "loading" | "results";

// Plan identity lives in the canonical plan config so pricing, limits and
// model tiering can never drift apart. Re-exported here for convenience.
export type { PlanId, PlanConfig, ModelTier } from "@/shared/config/plans";

// ─── Domain Models ───────────────────────────────────────────────────────────

import type { PlanId } from "@/shared/config/plans";

export interface User {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  plan: PlanId;
  auditsUsed?: number;
}

/** A row in the audit history table, projected from a persisted report. */
export interface AuditRow {
  id: string;
  url: string;
  score: number;
  issues: number;
  planId: PlanId;
  createdAt: Date;
}

// ─── UI Data Structures ──────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}
