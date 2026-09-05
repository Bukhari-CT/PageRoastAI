You previously performed the read-only repository audit for PageRoastAI.

We are now beginning implementation.

This is PHASE 0 ONLY.

Do NOT implement payments, subscriptions, database report persistence, usage tracking, screenshot auditing, or deployment yet.

The objective of this phase is to turn the current repository into a clean, safe baseline before functional MVP work begins.

# FINAL MVP PRODUCT DECISIONS

These decisions are now FINAL for the MVP and should replace contradictory existing assumptions.

## Plans

There will initially be ONLY TWO user-facing plans:

### FREE

- Price: $0
- Requires an account
- 1 audit total
- Uses the configured free Gemini model
- Receives a limited/basic report

### PRO

- Price: $19/month
- Recurring monthly subscription
- 30 audits per billing period initially
- Uses the configured premium Gemini model
- Receives the complete report
- Subscription provider will later be Lemon Squeezy

There is NO Agency plan in the MVP.

Do NOT implement Lemon Squeezy during this phase.

Do NOT implement the 30-audit enforcement during this phase.

We are only establishing these definitions as the product's single source of truth.

## Deferred features

These are NOT part of the MVP:

- Agency plan
- team seats
- API access
- PDF export
- white labeling
- screenshot/vision auditing
- multiple LLM providers
- Anthropic
- OpenAI
- advanced admin analytics
- fake MRR/subscriber statistics
- public report sharing
- complex billing history

Screenshot/vision auditing will likely be the first major feature after launch, but do not implement it now.

## Reports

For MVP:

- reports will eventually belong to authenticated users
- reports will eventually be persisted in MySQL
- reports should initially be PRIVATE to their owner
- sharing/public reports will be added later

Do NOT implement report persistence in this phase.

# SAFETY RULES

Before modifying anything:

1. Inspect `git status`.
2. Inspect the exact pending changes.
3. Make sure `.env` and all secret-containing files remain ignored.
4. NEVER print secret values.
5. NEVER commit `.env`.
6. NEVER run database migrations.
7. NEVER run schema synchronization against a production database.
8. Do not modify production data.
9. Do not create a deployment.
10. Do not make architectural rewrites outside the scope below.

Preserve the existing working Better Auth + TypeORM implementation.

The audit found authentication is one of the strongest parts of this codebase. Do not rewrite authentication unless specifically required by this phase.

# TASK 1 — CLEAN THE STALE REPOSITORY STRUCTURE

Review the pending deletions/additions identified by the audit.

The repository currently appears to contain or track stale implementations such as:

- `prisma/`
- `lib/prisma.ts`
- old duplicated Stripe files
- old duplicated LLM files
- old duplicated email files
- old duplicated PDF files

while the active architecture has moved into:

- `src/Domain`
- `src/Application`
- `src/Infrastructure`

Confirm each stale file is genuinely unused before removing it.

Remove stale/duplicate files ONLY after confirming no live imports depend on them.

The final codebase must have one obvious active implementation for each subsystem.

Do not delete anything merely because the audit called it stale; verify first.

# TASK 2 — REMOVE FAKE CARD COLLECTION

The audit found two fake payment interfaces that collect card information directly into React state without making any payment:

- `components/features/checkout/checkout-page.tsx`
- `components/features/dashboard/payment-dialog.tsx`

This is unacceptable for the MVP.

Remove all UI that asks the user to enter:

- card number
- CVC
- expiration date

Do not replace this with Lemon Squeezy yet.

Where a pricing CTA currently launches fake checkout, temporarily make it route through a safe placeholder upgrade flow such as:

- a disabled button with "Payments coming soon" during development

OR

- a clearly non-payment placeholder route/component

Prefer the smallest change that avoids breaking application navigation.

There must be ZERO client-side card-number collection after this phase.

Remove unused Stripe-related implementation if and only if nothing uses it:

- `stripe` npm dependency
- Stripe client file(s)
- Stripe env-schema entries
- Stripe-related `.env.example` entries

Never print existing Stripe values.

# TASK 3 — REMOVE PUBLIC DEMO CREDENTIALS

The audit identified visible login buttons that populate hardcoded:

- demo credentials
- admin credentials
- paid/unlimited credentials

Remove these from all public authentication UI.

There should be no publicly visible usernames/passwords in the application.

Inspect `bin/SeedAdmin.ts`.

Modify the seeding approach so that production cannot accidentally create:

- demo accounts
- known-password user accounts
- known-password paid accounts

The production seed functionality, if retained, should ONLY support deliberately creating an admin from explicit environment variables.

Do not expose those values.

If separating this into a dedicated admin seed script produces a cleaner solution, do that.

# TASK 4 — CONSOLIDATE PRODUCT PLAN DEFINITIONS

The audit found plan/pricing definitions in multiple places with contradictory values.

Create ONE server-safe canonical plan configuration.

Recommended location may be:

`shared/config/plans.ts`

or another existing convention that better fits the project.

The exact structure is your choice, but it must represent:

FREE:

- id: `free`
- name: `Free`
- price: 0
- billing: none
- auditLimit: 1
- modelTier: free

PRO:

- id: `pro`
- name: `Pro`
- price: 19
- currency: USD
- billingInterval: month
- auditLimit: 30
- modelTier: premium

Do NOT include Agency in the canonical MVP plans.

Do not add Lemon Squeezy product or variant IDs yet.

Future Lemon Squeezy identifiers will come from environment configuration rather than being hardcoded into components.

Update UI components that reference contradictory prices/plans to read from the canonical configuration wherever practical.

There must not be separate contradictory:

- landing plan definitions
- admin plan definitions
- checkout plan definitions
- hardcoded `$19`
- hardcoded `$49`
- `/one-time`
- lifetime access
- "unlimited audits"

Remove all claims that Pro is:

- one-time
- lifetime
- unlimited

The user-facing pricing should clearly say:

$19/month

and:

30 full audits per month

Do NOT over-design the pricing section.

Keep the existing visual style wherever possible.

# TASK 5 — REMOVE AGENCY PROMISES FROM THE MVP

Remove/hide Agency from user-facing:

- pricing cards
- upgrade dialogs
- subscription UI
- checkout UI
- landing-page feature comparisons

Also remove/hide claims for:

- unlimited seats
- API access
- white-label PDFs
- white-label reports

Do not delete reusable underlying visual components unnecessarily.

Just ensure we are not advertising features that do not exist.

# TASK 6 — REMOVE MOCK PRODUCT DATA FROM CUSTOMER-FACING FLOWS

Inspect:

- `constants/mock-data.ts`
- `/results`
- dashboard audit history
- fake billing history
- fake user stats
- fake subscription usage
- fake MRR/revenue/subscriber numbers

Remove customer-facing mock data that could make the product appear functional when it is not.

Do NOT replace these with database functionality yet.

Use honest empty states instead.

Examples:

"No audits yet."

"Your audit history will appear here."

"Billing will become available after payments are enabled."

Do not show invented:

- audit counts
- MRR
- subscribers
- scores
- payment histories
- renewal dates

If `/results` exists only to render fake data and is not part of the real roast flow, remove the route or convert it to the smallest truthful redirect/empty-state appropriate to the existing application.

# TASK 7 — DISABLE MOCK ADMIN SURFACES

Preserve:

- `isAdmin`
- admin authentication
- admin authorization/gating

But hide/remove mock dashboard tabs whose contents are fabricated.

The admin route should either:

A. show a very small truthful admin shell, such as:

"Admin dashboard functionality will be added after MVP."

or

B. expose only real information that already comes from the database.

Do NOT build real admin analytics now.

No fake:

- MRR
- subscriber counts
- activity feed
- health percentages
- editable fake plans

should remain.

# TASK 8 — REMOVE NON-FUNCTIONAL PDF CLAIMS

The PDF implementation currently returns mock content and the report button does nothing.

Remove/hide:

- the non-functional Download PDF button
- fake PDF generation implementation if unused
- MVP pricing references to PDF export

Do NOT implement PDF generation.

# TASK 9 — GOOGLE OAUTH

Google OAuth is currently partially configured but credentials may not exist.

For Phase 0:

- if valid credentials are not available through configured environment variables, DO NOT break the app
- keep the actual server integration if it is correctly implemented
- hide the Google sign-in/signup button when the required configuration is unavailable
- do not invent credentials

Email/password auth remains the required working MVP authentication method.

# TASK 10 — AUTH RATE LIMIT / BROKEN LOCKOUT

Inspect the Better Auth version and its installed capabilities.

The existing account-lockout hook reads counters that nothing increments.

Do NOT leave security theatre.

Choose the smallest robust solution:

Preferred:

- enable Better Auth's supported rate-limiting mechanism for authentication requests if compatible with the installed version
- remove the dead custom lockout logic if it is then redundant

Otherwise:

- implement the existing lockout correctly only if doing so is small and safe

Do not perform a major auth rewrite.

Explain which approach you chose.

# TASK 11 — ENVIRONMENT CONFIG CLEANUP

Review `shared/config/env.ts`.

Remove stale environment declarations for systems no longer used, including after verifying no imports:

- Stripe
- Anthropic
- OpenAI

Move seed-only variables such as:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

out of application boot-time validation if the running app doesn't require them.

Do not weaken validation for genuinely required runtime variables.

Ensure `GEMINI_API_KEY` has appropriate runtime validation without causing unrelated static pages to fail unnecessarily at build time.

Do NOT print environment values.

Update `.env.example` with NAMES and safe explanatory placeholders only.

# TASK 12 — BUILD QUALITY

The audit found:

- TypeScript currently passes
- production build currently passes
- ESLint is not installed/configured
- `next.config.mjs` has `ignoreBuildErrors: true`

Fix this baseline.

Add an appropriate ESLint setup compatible with this Next.js/TypeScript version.

Do not introduce a large opinionated lint rule set.

The objective is catching genuine errors, not reformatting the entire repository.

Remove `ignoreBuildErrors: true`.

Do not silence new errors with broad:

- `any`
- `@ts-ignore`
- eslint-disable across files

Fix problems properly when reasonably scoped.

# TASK 13 — APP METADATA

If `package.json` still says:

`"name": "my-project"`

change it to an appropriate package-safe PageRoastAI name such as:

`pageroastai`

Do not change versions arbitrarily.

If the Node runtime requirement can be determined safely from Next.js and the deployment target, add an appropriate `engines.node` declaration compatible with Vercel and the project.

Do not upgrade framework/library major versions during this phase.

# TASK 14 — DO NOT IMPLEMENT THESE YET

Explicitly do NOT implement:

- ReportModel
- report migrations
- persistent reports
- usage counters
- free-audit enforcement
- Lemon Squeezy
- subscription models
- webhooks
- checkout API
- screenshots
- Browserless
- Resend/Postmark
- Vercel deployment
- custom domains

Those will be separate phases.

# VALIDATION

After completing changes, run:

1. `npm install` only if dependency changes require it.
2. TypeScript typecheck.
3. ESLint.
4. Production build.
5. `git diff --check`.

Also search the repository for remaining references to:

- Stripe
- card number
- CVC
- `4242`
- lifetime access
- one-time purchase
- Agency
- unlimited audits
- fake MRR
- demo admin credentials
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Some occurrences may legitimately remain in historical comments/docs; report them rather than deleting blindly.

Do not run database migrations.

Do not deploy.

Do not automatically commit unless I explicitly ask you to commit.

# EXPECTED FINAL RESPONSE

When finished, return:

# Phase 0 — Completion Report

## 1. Summary

What changed.

## 2. Files Changed

For each important file:

- path
- change
- reason

## 3. Files Deleted

List them and explain why they were safe to remove.

## 4. Product Configuration

Show the final canonical FREE and PRO configuration.

## 5. Authentication Changes

Explain demo credential removal, Google OAuth handling, and rate limiting/lockout decision.

## 6. Environment Changes

Environment variable NAMES added/removed/changed.
Never values.

## 7. Mock Features Removed

List all misleading/mock customer and admin surfaces removed or disabled.

## 8. Dependency Changes

Added/removed packages and why.

## 9. Validation Results

Report exact pass/fail results for:

- TypeScript
- ESLint
- production build
- git diff --check

## 10. Remaining Issues

Anything discovered that should affect later phases.

## 11. Git Status

Show modified/deleted/untracked file paths only.
Never secret contents.

## 12. Recommendation for Phase 1

Do not implement Phase 1.
Briefly describe what should happen next.

Stop after the report.
