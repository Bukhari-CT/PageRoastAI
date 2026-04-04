// ─── App-Level Types ─────────────────────────────────────────────────────────

export type AppView =
  | "landing"
  | "login"
  | "signup"
  | "results"
  | "dashboard"
  | "view-report"
  | "checkout";

export type UserTab = "dashboard" | "roast" | "history" | "subscription";
export type AdminTab = "dashboard" | "users" | "plans" | "settings";
export type UserRole = "user" | "admin";
export type PlanId = "free" | "pro" | "agency";
export type LandingView = "hero" | "loading" | "results";

// ─── Domain Models ───────────────────────────────────────────────────────────

export interface User {
  name: string;
  email: string;
  role: UserRole;
  plan: PlanId;
  auditsUsed?: number;
}

export interface AuditRow {
  url: string;
  score: number;
  issues: string;
  date: string;
}

export interface ActiveReport {
  url: string;
  date: string;
  score: number;
  issues: number;
}

export interface RoastLine {
  headline: string;
  detail: string;
}

export interface Strength {
  headline: string;
  detail: string;
}

// ─── UI Data Structures ──────────────────────────────────────────────────────

export interface StatCard {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  trend: string;
  color: string;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: string;
  features: string[];
  buttonLabel?: string;
  buttonStyle?: string;
  recommended?: boolean;
  subscribers?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface ScoreMetric {
  label: string;
  score: number;
  color: string;
}

export interface AuditIssue {
  severity: "CRITICAL" | "WARNING" | "HIGH";
  title: string;
  desc: string;
  color: string;
}

export interface ActionFix {
  priority: string;
  title: string;
  copy: string;
  code: string;
}

export interface ElementGrade {
  label: string;
  score: number;
}

export interface AdminUser {
  name: string;
  email: string;
  plan: string;
  audits: string;
  joined: string;
  status: string;
}

export interface BillingRow {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export interface PaymentFormData {
  name: string;
  card: string;
  expiry: string;
  cvc: string;
}

export interface FormErrors {
  [key: string]: string;
}
