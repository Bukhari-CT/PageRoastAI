You are acting as a senior software architect performing a READ-ONLY technical audit of this repository.

IMPORTANT:

- Do NOT modify any files.
- Do NOT create migrations.
- Do NOT install packages.
- Do NOT run destructive commands.
- Do NOT refactor anything.
- Do NOT implement features.
- You may inspect files, search the repository, inspect package configuration, schemas, routes, services, components, environment-variable references, and git state.
- You may run safe/read-only diagnostic commands if necessary.
- NEVER print secret values, API keys, passwords, tokens, database credentials, OAuth secrets, SMTP passwords, webhook secrets, or the contents of `.env` files.
- Environment variables should be reported by NAME ONLY, never by value.
- Do not assume README documentation is correct. Verify claims against the actual implementation.

I need a complete technical snapshot of this application so another engineer can turn it into a production-ready MVP and deploy it to Vercel with real paid subscriptions.

# PRODUCT CONTEXT

The project is called PageRoastAI.

Its intended product is an AI landing-page conversion/CRO auditor.

Expected user flow:

1. Visitor enters a website URL.
2. Application fetches/scrapes the website.
3. Gemini analyzes the page.
4. User receives a preview/report.
5. Free users have limited audits.
6. Paid customers receive deeper/full audits.
7. Reports should have permanent/shareable URLs.
8. Eventually reports may support PDF export and agency white-labeling.

Current known/expected technologies may include:

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeORM
- MySQL
- better-auth
- Google OAuth
- bcrypt/password authentication
- email verification
- Nodemailer/SMTP
- Google Gemini
- Stripe-related code
- PDF generation
- layered architecture such as:
  - Domain
  - Application
  - Infrastructure

Do NOT trust this list blindly. Verify what the repository actually uses.

The immediate business goal is to reduce this application into a launchable MVP with:

- working authentication
- URL auditing
- real database persistence
- server-side free usage limits
- paid subscription/payment support
- reliable paid-state verification
- secure webhooks
- permanent reports
- Vercel deployment
- production environment configuration

The founder is based in Pakistan, so we may replace Stripe with a Merchant of Record such as Lemon Squeezy or Paddle. Do NOT implement that yet. Your job right now is only to identify what currently exists and what would need to change.

# AUDIT THE ENTIRE REPOSITORY

Inspect enough of the repository to answer all of the following.

## 1. Executive Summary

Give me:

- What PageRoastAI currently does
- What is genuinely functional
- What is partially implemented
- What is mocked/fake
- What is completely missing
- Approximate production readiness:
  - Prototype
  - Early MVP
  - MVP
  - Production-ready

- The top 10 blockers to launching and charging customers

Be skeptical. Base this on actual code.

---

# 2. Repository Structure

Show the important repository structure.

Do NOT dump node_modules or irrelevant generated files.

Show important directories/files such as:

- src/
- app/
- pages/
- components/
- domain/
- application/
- infrastructure/
- database/
- entities/
- repositories/
- auth/
- api routes/
- services/
- payment/
- Gemini/AI integration
- report generation
- URL fetching/scraping
- PDF generation
- admin
- middleware
- migrations
- configuration
- package.json
- Next.js configuration
- TypeScript configuration
- Vercel configuration if present

Explain the architectural pattern actually being used.

Also identify architectural inconsistencies and abandoned/stale code.

---

# 3. package.json / Dependencies

Report:

- package manager being used
- Node version requirements if specified
- Next.js version
- React version
- TypeScript version
- TypeORM version
- database drivers
- auth libraries
- Gemini libraries
- Stripe/payment libraries
- scraping/browser automation libraries
- PDF libraries
- email libraries
- validation libraries
- important server-side libraries

Identify:

- unused-looking major dependencies
- duplicate solutions
- stale dependencies
- libraries that may cause problems on Vercel

Do NOT change anything.

---

# 4. Authentication

Fully trace authentication.

Report:

- authentication library actually used
- email/password flow
- password hashing
- registration
- login
- logout
- email verification
- password reset if present
- Google OAuth if present
- sessions
- cookies
- role handling
- admin role
- route protection
- account lockout/rate limiting
- database tables/entities used by auth
- security-sensitive issues

For every major feature mark:

FUNCTIONAL / PARTIAL / MOCK / MISSING

Identify exact important files.

Do NOT reveal secrets.

---

# 5. Database

Determine the REAL database architecture.

Report:

- MySQL/Postgres/etc.
- TypeORM/Prisma/etc.
- entity definitions
- repositories
- migrations
- initialization/configuration
- connection lifecycle
- pooling
- SSL options
- production configuration
- development configuration

List the important database entities/tables and their important fields.

Especially find anything related to:

- users
- accounts
- sessions
- reports
- audits
- subscriptions
- payments
- usage
- plans
- roles
- email verification

Determine whether report data is actually persisted.

Look specifically for:

- ReportStore
- in-memory stores
- global variables
- filesystem persistence
- local JSON persistence
- caches

Explain what would happen after a Vercel serverless function restarts.

Also identify any stale Prisma/Postgres schema or migration artifacts that conflict with the actual database.

---

# 6. AI / Gemini Integration

Trace the complete AI audit pipeline.

Report:

- where Gemini client is configured
- Gemini SDK used
- models configured
- free model
- premium model
- exact environment variable NAMES
- where prompts live
- how prompts are constructed
- how webpage data reaches Gemini
- number of Gemini calls per audit
- expected structured response format
- JSON parsing/validation
- error handling
- retries
- timeout handling
- token/cost protections
- prompt injection protections if any
- maximum webpage/input size
- premium/free model selection logic

Explain the complete request path:

URL submitted
→ page fetched
→ page processed
→ Gemini called
→ response parsed
→ preview generated
→ report generated
→ report stored/retrieved

Mention exact important files/functions/classes.

---

# 7. URL Fetching / Scraping

Inspect PageFetcher or equivalent.

Report:

- how URLs are validated
- how webpages are fetched
- redirects
- timeout
- user agent
- response size limits
- HTML parsing
- text extraction
- script/style removal
- SSRF protection
- localhost/private network protection
- protocol restrictions
- maximum response size
- malformed-page handling

VERY IMPORTANT:

Assess whether the current fetcher creates SSRF/security risk.

Also determine whether it works correctly inside Vercel serverless functions.

---

# 8. Screenshot / Visual Analysis Capability

Determine whether the app currently captures screenshots.

Search for:

- Playwright
- Puppeteer
- Chromium
- browserless
- screenshot APIs
- screenshot services
- Gemini vision/multimodal input

Report:

- CURRENT screenshot support
- desktop screenshot support
- mobile screenshot support
- visual Gemini analysis
- whether current reports are text-only

If screenshots are not supported, say so explicitly.

Assess what would be required to add screenshot-based auditing while remaining compatible with Vercel.

Do NOT implement it.

---

# 9. Reports

Trace report generation and viewing.

Report:

- report schema/type
- score fields
- strengths
- issues
- severity
- roast lines
- hero rewrite
- element grades
- action fixes
- code snippets
- preview vs full report
- `/results`
- `/report/[id]`
- report IDs
- ownership
- authorization
- report sharing
- persistence
- permanent URLs
- guest reports
- authenticated reports

Determine:

- Can a report survive a redeployment?
- Can anyone guess/access someone else's private report?
- Are report IDs secure?
- Are reports associated with users?
- Are reports durable?

Mark each major piece:

FUNCTIONAL / PARTIAL / MOCK / MISSING

---

# 10. Free Tier / Usage Limits

Find ALL code related to:

- free audits
- monthly limits
- usage counters
- rate limiting
- plan limits
- credits
- audit quota

Determine whether the advertised free limit is actually enforced SERVER-SIDE.

Explain how someone could currently bypass it, if applicable.

Report what database/domain objects currently exist for usage tracking.

---

# 11. Payments and Subscription System

This section is CRITICAL.

Search the entire repository for:

- Stripe
- checkout
- payment
- subscription
- billing
- pricing
- webhook
- customer ID
- subscription ID
- payment intent
- checkout session
- card
- plan
- Pro
- Agency

Explain EXACTLY what exists.

Determine whether:

- Stripe SDK is installed
- Stripe server client is configured
- Stripe client is actually called
- Stripe.js is used
- Elements is used
- Checkout Sessions are used
- PaymentIntents are used
- subscription APIs are used
- webhook routes exist
- webhook signatures are verified
- paid status is persisted
- subscription status is persisted
- cancellation is supported
- failed payments are handled
- renewals are handled
- the frontend displays fake card inputs
- checkout is only simulated

List the important files.

Mark each feature:

FUNCTIONAL / PARTIAL / MOCK / MISSING

Also report every place where pricing is defined.

Identify inconsistencies between:

- one-time payment
- monthly subscription
- lifetime access
- unlimited audits
- credits
- Pro
- Agency

Do NOT implement payment yet.

---

# 12. Pricing / Plan Logic

Find the actual definitions and UI copy for:

FREE
PRO
AGENCY

Report:

- prices
- benefits
- limits
- model selection
- UI descriptions
- server-side behavior
- hardcoded values
- database-backed values

Determine whether the application has a single source of truth for pricing/plans.

Identify mismatches.

---

# 13. Admin Panel

Inspect `/admin`.

Report:

- admin authentication
- admin authorization
- user management
- reports
- subscribers
- revenue
- dashboard numbers
- whether analytics are database-backed
- hardcoded/mock statistics
- dangerous admin functionality

Mark:

FUNCTIONAL / PARTIAL / MOCK / MISSING

---

# 14. Email

Trace email infrastructure.

Report:

- Nodemailer
- SMTP
- verification emails
- reset emails
- transactional emails
- templates
- environment variables by NAME
- error handling
- local vs production differences

Assess Vercel compatibility.

---

# 15. PDF Export

Trace PDF generation.

Report:

- library used
- server/client generation
- white labeling
- fonts/assets
- filesystem assumptions
- whether it works in Vercel serverless
- whether temporary files are written
- production risks

Mark its state.

---

# 16. Security Review

Perform a practical MVP security review.

Specifically check:

- secret exposure
- authorization
- authentication
- session security
- CSRF
- XSS
- SSRF
- SQL injection
- URL fetching
- rate limiting
- brute force
- email verification
- webhook verification
- IDOR/report access
- admin authorization
- unsafe HTML rendering
- prompt injection
- unbounded AI usage
- API abuse
- fake client-side access controls

Rank findings:

CRITICAL
HIGH
MEDIUM
LOW

Do not provide theoretical issues unless they reasonably apply to this repository.

---

# 17. Vercel Compatibility Audit

This section is also CRITICAL.

Evaluate whether this application can run on Vercel today.

Inspect for:

- Next.js compatibility
- Node runtime requirements
- Edge runtime usage
- filesystem writes
- in-memory persistence
- database connection pooling
- serverless connection issues
- long-running Gemini calls
- scraping timeouts
- screenshot/browser requirements
- PDF generation
- SMTP
- environment variables
- middleware
- upload limits
- function duration
- static/dynamic rendering issues
- build-time database access
- native packages
- binaries
- scheduled jobs

Give:

VERCEL READY: YES / PARTIALLY / NO

Then list every blocker.

---

# 18. Build / Runtime Status

Inspect scripts.

If safe, run appropriate NON-DESTRUCTIVE diagnostics such as:

- type checking
- linting
- production build

Only if they don't alter production data.

Report:

- build succeeds/fails
- TypeScript errors
- lint errors
- runtime configuration errors
- missing environment variables by NAME
- broken imports
- warnings

Do not attempt to fix them.

---

# 19. Environment Variables

Produce a complete table of environment variable NAMES referenced by the application.

NEVER print values.

For each variable tell me:

- purpose
- required locally?
- required in production?
- required at build time?
- required at runtime?
- client-exposed (`NEXT_PUBLIC_*`)?
- sensitive?

Group them by:

Database
Auth
Google OAuth
Gemini
Email
Payments
Application
Other

Also identify variables that appear stale or unused.

---

# 20. Current MVP Readiness Matrix

Produce a table like:

| Capability         | Status | Production Ready? | Main Problem |
| ------------------ | ------ | ----------------- | ------------ |
| Homepage           |        |                   |              |
| URL submission     |        |                   |              |
| Page fetching      |        |                   |              |
| Gemini audit       |        |                   |              |
| Report parsing     |        |                   |              |
| Report persistence |        |                   |              |
| Authentication     |        |                   |              |
| Email verification |        |                   |              |
| Google OAuth       |        |                   |              |
| Free audit limit   |        |                   |              |
| Payments           |        |                   |              |
| Subscription state |        |                   |              |
| Webhooks           |        |                   |              |
| Admin              |        |                   |              |
| PDF                |        |                   |              |
| Vercel deployment  |        |                   |              |

Use:

FUNCTIONAL
PARTIAL
MOCK
MISSING
BROKEN

---

# 21. Recommend the MINIMUM MVP

Based strictly on what already exists, recommend the smallest viable version that can be launched and charged for.

The desired MVP is approximately:

FREE:

- 1 free/basic audit
- server-side enforced

PAID:

- recurring paid plan OR credit system
- exact choice will be decided later
- stronger Gemini model
- full report
- persistent reports

CORE:

- URL auditing
- authentication where necessary
- report persistence
- usage enforcement
- real payment verification
- webhook handling
- production database
- Vercel deployment

For every current feature, classify it:

KEEP FOR MVP
FIX FOR MVP
REMOVE/DISABLE FOR MVP
POSTPONE

Do this for:

- admin dashboard
- Google OAuth
- email/password auth
- PDF
- white labeling
- Agency tier
- API access
- screenshot auditing
- roast sharing
- multiple AI models
- complex analytics
- password reset
- email verification

The goal is NOT maximum features.

The goal is:

"Launch quickly, securely accept money, deliver real value, and validate whether strangers will pay."

---

# 22. Suggested Implementation Order

Do NOT implement anything.

Give me a dependency-aware implementation sequence.

Example categories:

Phase 0 — clean/understand
Phase 1 — database/report persistence
Phase 2 — usage enforcement
Phase 3 — payments
Phase 4 — report/paywall behavior
Phase 5 — Vercel compatibility
Phase 6 — production deployment
Phase 7 — post-launch features

For each phase list:

- objective
- files/modules likely affected
- dependencies
- major risks
- how we know the phase is complete

---

# 23. Files Another Engineer Needs to Review

At the end, give me a list of the MOST IMPORTANT files another engineer should inspect before making changes.

Use this format:

### File

`path/to/file`

Purpose:
...

Why it matters:
...

Important functions/classes:
...

Do this for approximately the 15–30 most important files.

---

# 24. Git / Repository State

Report:

- current branch
- whether working tree has uncommitted changes
- major untracked files
- relevant ignored environment/config files
- whether there are obvious secrets accidentally committed

DO NOT print any discovered secret.

If a secret appears committed, write:

"Potential secret detected in <file path> — value intentionally omitted."

---

# FINAL OUTPUT FORMAT

Your response must be one self-contained technical report.

Start with:

# PageRoastAI — Current Repository Technical Audit

Then use these sections:

1. Executive Summary
2. Current Architecture
3. Repository Map
4. Dependency Audit
5. Authentication
6. Database & Persistence
7. AI/Gemini Pipeline
8. URL Fetching & Security
9. Screenshot/Visual Auditing
10. Reports
11. Usage Limits
12. Payments & Billing
13. Pricing/Plans
14. Admin
15. Email
16. PDF
17. Security Findings
18. Vercel Compatibility
19. Build Status
20. Environment Variables
21. MVP Readiness Matrix
22. MVP Scope Recommendation
23. Implementation Order
24. Critical Files
25. Git/Repository State
26. Final Launch Blockers

For technical claims, reference actual file paths and function/class names whenever possible.

Do not give generic Next.js advice.

I want findings based on THIS repository.
