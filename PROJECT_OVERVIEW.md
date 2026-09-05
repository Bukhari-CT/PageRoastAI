# PageRoastAI — Project Overview & Business Evaluation

## 1. What It Does

PageRoastAI is an AI tool that "roasts" a landing page or website for conversion and UX flaws. A user submits a URL, the app scrapes the page's text content, sends it to Google Gemini with a CRO (conversion rate optimization) auditor prompt, and returns a structured report.

**Report contents:**
- Overall score (0–100)
- Strengths (1–6 bullet points)
- Critical issues, tagged by severity (CRITICAL / WARNING / HIGH)
- "Roast lines" — punchy, callout-style critiques
- A rewritten hero copy suggestion
- Element-by-element grades (3–6 page elements scored individually)
- Prioritized action fixes (CRITICAL / HIGH / MEDIUM), each with suggested copy and a code snippet

## 2. How It Works (User Flow)

1. Guest lands on the homepage and enters a URL.
2. App fetches the page text (`PageFetcher`) and generates a preview at `/results`.
3. The full report lives at `/report/[id]` — score ring, stat breakdown, sections, and action items.
4. Report generation is a **single Gemini API call** that produces both preview and full-report data in one shot (to minimize LLM cost).
5. **Model tier is gated by plan:** paid users (Pro/Agency) get a stronger Gemini model (`GEMINI_PREMIUM_MODEL`); free users get a cheaper one (`GEMINI_FREE_MODEL`).

**Auth:** `better-auth` library — email/password with bcrypt, required email verification, account lockout after 5 failed login attempts, Google OAuth, and an admin role flag with a separate `/admin` panel.

**Tech stack:** Next.js 16, React 19, Tailwind CSS 4, TypeORM + MySQL, nodemailer (SMTP) for email, PDF export for white-labeled reports. Code is organized as a layered/DDD-style architecture (`Domain` / `Application` / `Infrastructure`).

## 3. Business Model (As Designed)

Three tiers (marketed with flavor names on the landing page):

| Plan | Price | Positioning | Features |
|---|---|---|---|
| **Free** | $0 | "The Reality Check" | 3 audits/month, basic report |
| **Pro** | $19 | "The Actionable Fix" | Unlimited audits, full UX/UI audit, rewritten copy, copy-paste fixes |
| **Agency** | $49 | "The Agency Engine" | Everything in Pro + unlimited seats, white-label reports, API access |

The checkout UI frames payment as a **one-time charge** ("Pay $19 Now"), while other parts of the code refer to it as a "subscription." The pricing model itself is internally inconsistent and needs to be resolved as a business decision (one-time purchase vs. recurring subscription have very different unit economics and retention implications).

## 4. Critical Finding: The Business Isn't Actually Running Yet

This is the most important input for evaluating viability — **payment is not functional today**:

- Stripe's SDK client exists in the codebase but is **never called anywhere**. Checkout and the payment dialog are client-side forms with regex-validated fake card fields — no Stripe.js/Elements integration, no server-side charge, no webhook handling (despite a webhook secret environment variable being defined).
- The "3 audits/month" free-tier limit is UI copy only — there is no usage-tracking or rate-limiting code enforcing it server-side.
- The admin dashboard's subscriber counts (Free 842 / Pro 156 / Agency 23) are hardcoded mock data, not real database queries.
- The repo also carries a stale, conflicting artifact: a Postgres/Prisma schema still sits in the tree even though the app has migrated to TypeORM + MySQL — a sign of an unfinished refactor, not a business-model issue, but relevant context for judging engineering maturity/readiness.

## 5. Evaluation — Will It Work As a Business?

### The core idea is sound
"Roast my landing page" / AI critique tools are a proven micro-SaaS category with real market precedent (viral roast tools, marketing/CRO audit products). A single-input, instant-gratification, shareable output (a score + roast) is a strong acquisition loop — people share harsh or funny feedback about their own site. Low COGS per report (one LLM call) supports a cheap price point.

### Strengths
- Clear, narrow value proposition — easy to explain in one sentence, easy to demo.
- Freemium funnel with a visible score/preview creates a natural upsell path to the full report.
- $19 one-time or Pro-tier pricing is an impulse-purchase price point — low friction *if* payment actually worked.
- The Agency tier (white-label + API access) is a legitimate expansion path into an existing market: agencies reselling audits to their own clients.

### Risks and open questions to resolve before calling this a business

1. **No payments, no revenue.** This is priority #1 — nothing else matters until checkout actually charges a card and records a paid state server-side.
2. **Report persistence is unclear.** Reports appear to live in a `ReportStore` that may not be durably database-backed. If reports aren't reliably retrievable/shareable long-term, the shareability growth loop breaks.
3. **No enforcement of free-tier limits.** Free users could currently get unlimited premium-quality output, which both kills the upgrade incentive and exposes the business to unbounded LLM API cost.
4. **Single LLM dependency (Gemini only).** No fallback if Gemini pricing or availability changes. Unused Anthropic/OpenAI API keys in the environment config suggest multi-model support was planned but abandoned.
5. **Differentiation is weak on the surface.** "AI website critique" isn't novel — you'll compete with existing roast/audit tools and with general-purpose AI (a user can just paste their page into ChatGPT or Claude directly). The edge needs to come from UX polish, speed, shareability, or agency-specific features. The Agency tier (white-label, API) is likely the most defensible part of the offering — more so than the $19 consumer tier.
6. **Audit depth/accuracy is text-only.** The tool audits scraped page *text*, not a screenshot — meaning it cannot evaluate visual design, layout, imagery, or color, all of which matter heavily for landing page conversion. This limits how strong a "full UX audit" claim can credibly be. Adding a screenshot + vision-capable model pass would substantially strengthen the product's credibility.
7. **Unit economics are unverified.** There's no visible cost tracking per report or per plan. At $19 one-time for "unlimited audits," a heavy user could generate enough Gemini API cost to exceed the revenue from their purchase, since there's no rate limiting in place.

## 6. Bottom Line

The product concept is viable and monetizable at this price point **if execution catches up** to the pitch. Two items are blocking any real test of market demand or revenue:

1. Make checkout functional (real Stripe integration, server-side charge verification, webhook handling).
2. Enforce free-tier usage limits server-side (to protect margins and preserve the upgrade incentive).

Beyond that, resolve the one-time-vs-subscription pricing inconsistency, decide whether to invest in visual (screenshot-based) auditing to differentiate from "just ask ChatGPT," and add real usage/cost tracking so you can validate unit economics once payments go live.

---
*Generated from a review of the PageRoastAI codebase as of 2026-09-04.*
