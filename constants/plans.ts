import type { PlanConfig } from "@/types";

// ─── Subscription Plans (Dashboard View) ─────────────────────────────────────

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["3 audits/month", "Basic reports", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    features: ["Unlimited audits", "Full UX/UI audit", "Rewritten copy", "Copy-paste fixes"],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$49",
    features: ["Everything in Pro", "Unlimited team seats", "White-label reports", "API access"],
  },
];

// ─── Landing Page Pricing ────────────────────────────────────────────────────

export const LANDING_PRICING_PLANS = [
  {
    name: "The Reality Check",
    price: "$0",
    features: ["3-point roast summary", "Conversion score", "1 fix preview"],
    buttonLabel: "Get Started",
    buttonStyle: "outline" as const,
    recommended: false,
  },
  {
    name: "The Actionable Fix",
    price: "$19",
    features: ["Full UX/UI audit", "Rewritten hero copy", "Copy-paste code fixes"],
    buttonLabel: "Fix My Page",
    buttonStyle: "primary" as const,
    recommended: true,
  },
  {
    name: "The Agency Engine",
    price: "$49",
    features: ["Unlimited audits", "White-label PDF reports", "API access"],
    buttonLabel: "Go Pro",
    buttonStyle: "outline" as const,
    recommended: false,
  },
] as const;

// ─── Admin Plans (with subscriber counts) ────────────────────────────────────

export const ADMIN_PLAN_CONFIGS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    subscribers: "842 users",
    features: ["3 audits/month", "Basic reports", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    subscribers: "156 users",
    features: ["Unlimited audits", "Full audit report", "Rewritten copy", "Copy-paste fixes"],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$49",
    subscribers: "23 users",
    features: ["Everything in Pro", "Unlimited team seats", "White-label reports", "API access"],
  },
];

export const FREE_AUDIT_LIMIT = 3;
export const FREE_AUDITS_USED = 2;
