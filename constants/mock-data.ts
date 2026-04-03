import type { RoastLine, Strength, AuditRow, AdminUser, BillingRow, ElementGrade, AuditIssue, ActionFix, ScoreMetric } from "@/types";

// ─── Roast Content ───────────────────────────────────────────────────────────

export const ROAST_LINES: RoastLine[] = [
  {
    headline: "Your CTA is playing hide and seek.",
    detail: "It's below 840px on mobile. Your visitors scroll, get bored, and leave. The button might as well not exist.",
  },
  {
    headline: "You have the font hierarchy of a ransom note.",
    detail: "3 competing sizes in the first viewport. Users don't know if they should read the headline, the subtext, or cry.",
  },
  {
    headline: "Zero social proof. Lots of trust required.",
    detail: "You're asking strangers to give you money with no testimonials above the fold. That's bold. Not in a good way.",
  },
];

export const STRENGTHS: Strength[] = [
  {
    headline: "Clean visual weight on the logo.",
    detail: "Your logo doesn't fight the headline for attention. That's rarer than you think and immediately signals maturity.",
  },
  {
    headline: "Page load under 2 seconds.",
    detail: "You're in the top 20% of landing pages we've audited. Fast pages convert better — you've already won this one.",
  },
  {
    headline: "Mobile viewport is set correctly.",
    detail: "The meta viewport tag is present and correct. Many founders forget this. Your page doesn't fall apart on iPhone.",
  },
];

// ─── Code Snippet ────────────────────────────────────────────────────────────

export const CODE_SNIPPET = `<section className="flex flex-col items-start gap-4 px-6 py-12">
  <h1 className="text-5xl font-bold leading-tight">Your Value Prop</h1>
  <p className="text-lg text-zinc-400 max-w-xl">One clear benefit.</p>
  <button className="bg-indigo-600 text-white px-8 py-3 
    font-semibold rounded-lg">
    Start Free Trial →
  </button>
</section>`;

// ─── AI Rewritten Copy ───────────────────────────────────────────────────────

export const AI_REWRITTEN_HERO_COPY = `Turn visitors into customers in 14 days — or your money back.
No fluff. No vague promises. Just the exact fixes your page needs.`;

// ─── Audit Table Data ────────────────────────────────────────────────────────

export const MOCK_AUDIT_HISTORY: AuditRow[] = [
  { url: "getshipfast.co", score: 71, issues: "2", date: "Jan 28 2025" },
  { url: "launchfast.com", score: 43, issues: "5", date: "Jan 25 2025" },
  { url: "shipnow.io", score: 58, issues: "3", date: "Jan 22 2025" },
  { url: "buildfaster.dev", score: 29, issues: "7", date: "Jan 19 2025" },
  { url: "nextjsstarter.com", score: 82, issues: "1", date: "Jan 15 2025" },
];

// ─── Critical Issues (for results) ──────────────────────────────────────────

export const CRITICAL_ISSUES_LIST = [
  "Hero CTA is below the fold on mobile — bleeding 60% of conversions.",
  "3 competing font sizes in first viewport — no visual hierarchy.",
  "Zero social proof above the fold — trust must be earned immediately.",
];

// ─── Score Breakdown Metrics ─────────────────────────────────────────────────

export const SCORE_BREAKDOWN_METRICS: ScoreMetric[] = [
  { label: "Visual Hierarchy", score: 38, color: "bg-red-500" },
  { label: "CTA Effectiveness", score: 51, color: "bg-yellow-500" },
  { label: "Copy Clarity", score: 67, color: "bg-yellow-500" },
  { label: "Mobile Layout", score: 29, color: "bg-red-500" },
];

// ─── Element Grades ──────────────────────────────────────────────────────────

export const ELEMENT_GRADES: ElementGrade[] = [
  { label: "Copy Clarity", score: 52 },
  { label: "CTA Visibility", score: 38 },
  { label: "Headline Impact", score: 71 },
  { label: "Visual Design", score: 67 },
];

// ─── Audit Issues (modal) ────────────────────────────────────────────────────

export const AUDIT_ISSUES: AuditIssue[] = [
  { severity: "CRITICAL", title: "No above-fold CTA", desc: "Primary action button appears 840px below viewport top on mobile.", color: "bg-red-500/20 text-red-400" },
  { severity: "CRITICAL", title: "Headline lacks specificity", desc: "Current headline scores 3/10 on clarity. Add a quantified outcome.", color: "bg-red-500/20 text-red-400" },
  { severity: "WARNING", title: "4 font weights in hero section", desc: "Exceeds 2-weight limit. Creates visual noise and weak hierarchy.", color: "bg-yellow-500/20 text-yellow-400" },
];

// ─── Action Fixes ────────────────────────────────────────────────────────────

export const ACTION_FIXES: ActionFix[] = [
  {
    priority: "CRITICAL",
    title: "Move CTA above the fold",
    copy: "Start for free. See results in 14 days.",
    code: `<button className="bg-indigo-600 text-white px-6 py-3\n  font-semibold rounded-lg mt-0">\n  Start Free →\n</button>`,
  },
  {
    priority: "CRITICAL",
    title: "Rewrite the hero headline",
    copy: "Cut acquisition cost by 40% — or we'll tell you why not.",
    code: `<h1 className="text-5xl font-bold leading-tight max-w-2xl">\n  Cut acquisition cost by 40% —\n  or we'll tell you why not.\n</h1>`,
  },
  {
    priority: "HIGH",
    title: "Add social proof above the fold",
    copy: "",
    code: `<div className="flex items-center gap-3 mt-4">\n  <div className="flex -space-x-2">\n    {[1,2,3].map(i => (\n      <div key={i} className="w-8 h-8 rounded-full bg-indigo-600" />\n    ))}\n  </div>\n  <span className="text-sm">Trusted by 1,200+ founders</span>\n</div>`,
  },
];

// ─── Report Issues (for view-report) ─────────────────────────────────────────

export const REPORT_CRITICAL_ISSUES = [
  { title: "CTA below fold", desc: "Button is 840px down on mobile" },
  { title: "Font hierarchy chaos", desc: "3 competing sizes in hero" },
  { title: "No social proof", desc: "Zero testimonials above fold" },
];

// ─── Admin Data ──────────────────────────────────────────────────────────────

export const ADMIN_USERS: AdminUser[] = [
  { name: "Alex Kim", email: "alex@example.com", plan: "Free", audits: "2", joined: "Jan 28", status: "Active" },
  { name: "Priya K.", email: "priya@flowbase.io", plan: "Pro", audits: "8", joined: "Jan 27", status: "Active" },
  { name: "Dan R.", email: "dan@shipfast.io", plan: "Agency", audits: "31", joined: "Jan 26", status: "Active" },
  { name: "Marcus T.", email: "marcus@launch.co", plan: "Free", audits: "1", joined: "Jan 25", status: "Active" },
  { name: "Sara W.", email: "sara@webflow.io", plan: "Pro", audits: "5", joined: "Jan 24", status: "Suspended" },
  { name: "James L.", email: "james@framer.com", plan: "Free", audits: "0", joined: "Jan 23", status: "Active" },
];

export const ADMIN_USERS_FULL: AdminUser[] = [
  ...ADMIN_USERS,
  { name: "Nina Z.", email: "nina@startup.io", plan: "Free", audits: "3", joined: "Jan 22", status: "Active" },
  { name: "Omar K.", email: "omar@growth.co", plan: "Pro", audits: "12", joined: "Jan 21", status: "Active" },
  { name: "Eve L.", email: "eve@design.io", plan: "Agency", audits: "45", joined: "Jan 20", status: "Active" },
  { name: "Louis C.", email: "louis@web.co", plan: "Free", audits: "1", joined: "Jan 19", status: "Suspended" },
];

export const MOCK_BILLING_HISTORY: BillingRow[] = [
  { id: "PRO-2025-001", date: "Jan 1 2025", amount: "$19.00", status: "Paid" },
  { id: "PRO-2024-012", date: "Dec 1 2024", amount: "$19.00", status: "Paid" },
  { id: "PRO-2024-011", date: "Nov 1 2024", amount: "$19.00", status: "Paid" },
];

// ─── Checkout Features ───────────────────────────────────────────────────────

export const CHECKOUT_FEATURES = [
  "Full UX/UI audit report",
  "Rewritten hero copy",
  "Copy-paste React + Tailwind fixes",
  "Permanent report access",
];

export const PAYMENT_INCLUDES = [
  "Full UX/UI audit report",
  "Rewritten hero copy",
  "Copy-paste React + Tailwind fixes",
];
