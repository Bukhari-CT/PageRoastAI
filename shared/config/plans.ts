/**
 * Canonical plan definitions — the single source of truth for pricing,
 * limits and model tiering across server and client.
 *
 * Nothing here reads `process.env`, so this module is safe to import from
 * client components as well as server actions.
 *
 * MVP scope: two plans only. There is deliberately no Agency tier, no
 * one-time/lifetime purchase, and no "unlimited" allowance — every claim in
 * this file must be something the product actually delivers.
 *
 * Payment-provider identifiers (Lemon Squeezy product/variant ids) are NOT
 * hardcoded here; when payments land they will come from environment
 * configuration and be resolved against `PlanId`.
 */

export type PlanId = "free" | "pro";

/** Which Gemini model tier a plan is entitled to. */
export type ModelTier = "free" | "premium";

export type BillingInterval = "month";

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** Price in whole units of `currency`. */
  price: number;
  currency: "USD";
  /** `null` means the plan is not billed at all. */
  billingInterval: BillingInterval | null;
  /** Audits allowed per billing period. Free is a one-off total allowance. */
  auditLimit: number;
  modelTier: ModelTier;
  /** Short positioning line used on the landing page. */
  tagline: string;
  /** User-facing feature list. Only claims the product actually delivers. */
  features: string[];
}

export const FREE_PLAN: PlanConfig = {
  id: "free",
  name: "Free",
  price: 0,
  currency: "USD",
  billingInterval: null,
  auditLimit: 1,
  modelTier: "free",
  tagline: "See where your page is losing people.",
  features: [
    "1 audit",
    "Conversion score",
    "Roast summary and top issues",
  ],
};

export const PRO_PLAN: PlanConfig = {
  id: "pro",
  name: "Pro",
  price: 19,
  currency: "USD",
  billingInterval: "month",
  auditLimit: 30,
  modelTier: "premium",
  tagline: "The full audit, every month.",
  features: [
    "30 full audits per month",
    "Complete report with element grades",
    "Rewritten hero copy",
    "Copy-paste code fixes",
    "Stronger AI model",
  ],
};

export const PLANS: Record<PlanId, PlanConfig> = {
  free: FREE_PLAN,
  pro: PRO_PLAN,
};

/** Ordered for display: cheapest first. */
export const PLAN_LIST: PlanConfig[] = [FREE_PLAN, PRO_PLAN];

export const PAID_PLAN_IDS: readonly PlanId[] = ["pro"];

export function isPlanId(value: unknown): value is PlanId {
  return value === "free" || value === "pro";
}

export function isPaidPlan(planId: PlanId): boolean {
  return PAID_PLAN_IDS.includes(planId);
}

/**
 * Resolves the free-text `users.package` column to a known plan.
 * Anything unrecognised (null, legacy "agency", a typo) falls back to Free —
 * entitlements must never be granted by an unvalidated string.
 */
export function resolvePlan(planPackage: string | null | undefined): PlanConfig {
  return isPlanId(planPackage) ? PLANS[planPackage] : FREE_PLAN;
}

/** e.g. "$0" for Free, "$19/month" for Pro. */
export function formatPlanPrice(plan: PlanConfig): string {
  const amount = `$${plan.price}`;
  return plan.billingInterval ? `${amount}/${plan.billingInterval}` : amount;
}

/** e.g. "1 audit", "30 audits per month". */
export function formatPlanAllowance(plan: PlanConfig): string {
  const audits = `${plan.auditLimit} ${plan.auditLimit === 1 ? "audit" : "audits"}`;
  return plan.billingInterval ? `${audits} per ${plan.billingInterval}` : audits;
}
