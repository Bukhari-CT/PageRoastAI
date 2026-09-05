# PageRoastAI — Current Repository Technical Audit

> Read-only audit. No files were modified, no migrations created, no packages installed.
> Environment variables are reported **by name only** — no values, keys, or credentials appear in this document.
>
> **Audited:** 2026-09-06 · **Branch:** `master` · **Next.js:** 16.2.0 (Turbopack) · **Build:** passes

| | |
|---|---|
| **Readiness** | **Prototype** — one production-grade subsystem (auth); the rest is UI over mock data |
| **Can it charge money** | **No** — zero Stripe calls, zero webhooks, fake card form |
| **Report durability** | **In-memory** — lost on every serverless cold start |
| **Free-tier limit** | **Unenforced** — "3 audits/month" is a hardcoded UI string |

---

## 1. Executive Summary

### What PageRoastAI currently does

A visitor pastes a URL on the landing page. `roastUrlAction` (`app/actions/roast.actions.ts`) validates it, fetches the page over plain `fetch`, strips tags with regex, truncates to 6,000 characters, and sends one prompt to Google Gemini's REST `generateContent` endpoint. The JSON that comes back is validated with Zod (`schemas/roast.ts`) and stored in a `Map` on `globalThis`. The preview renders inline; the full report renders at `/report/[id]` by reading that same in-process Map.

Separately — and it is genuinely separate — there is a fully wired Better Auth installation on TypeORM + MySQL: signup, bcrypt password hashing, mandatory email verification over SMTP, password reset, Google OAuth, sessions, an `isAdmin` flag, and route protection in `middleware.ts`.

### Genuinely functional

- Email/password auth with real DB persistence, real bcrypt, real verification emails.
- The Gemini roast pipeline end-to-end, including schema validation and reasonable error messages.
- A custom Better Auth ↔ TypeORM adapter (`src/Infrastructure/Auth/TypeOrmAdapter.ts`) that works and is non-trivial.
- Middleware-based route protection with an admin check.
- The production build compiles (52s, 14 routes).

### Partially implemented

- **Account lockout.** `lib/auth.ts` reads `failedPasswordAttempts` / `lockedUntil` and returns HTTP 423 — but *nothing in the codebase ever increments or sets those columns*. The lock can never engage.
- **Google OAuth.** Provider configured, buttons present in both auth forms, but `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` default to empty strings in `shared/config/env.ts` and are absent from `.env`. The build logs *"Social provider google is missing clientId or clientSecret"* three times.
- **Admin.** Real authentication and a real authorization gate; every number and row behind it is mock data.
- **Report persistence.** Reports exist and have URLs — for the lifetime of one Node process.

### Mocked or fake

- **All payment.** `components/features/checkout/checkout-page.tsx` and `payment-dialog.tsx` collect a card number, expiry and CVC, regex-validate them client-side, and on submit call `setSuccess(true)` / `onUpdateUser({...user, plan: "pro"})`. No network request occurs.
- **PDF export.** `generatePDF()` returns `Buffer.from("Mock PDF content")`. The "Download PDF" button in `report-header.tsx` has no `onClick` at all.
- **Receipt email.** `sendReceiptEmail()` is a `console.log`.
- **The `/results` page** renders `GuestResults`, which is 100% constants from `constants/mock-data.ts` — "example.com", score 42, three canned roast lines. It is not connected to the roast pipeline.
- **Dashboard history, stats, billing history, admin users/plans/MRR** — all imported from `constants/mock-data.ts`. MRR "$4,180", "1,284 users", "842 Free users" are literals in `dashboard-shell.tsx` and `constants/plans.ts`.

### Completely missing

- Any database entity for reports, audits, usage, subscriptions, payments, or plans. The schema is four tables: users, sessions, accounts, verifications.
- Any API route other than `app/api/auth/[...all]/route.ts`. No webhook endpoint exists.
- Migrations. The app relies on `DB_SYNCHRONIZE=true` to create schema from entities.
- Rate limiting, usage counters, quota enforcement, cost controls.
- SSRF protection on the URL fetcher.
- Screenshots / any visual analysis.
- ESLint config — `npm run lint` exits 127, `eslint: not found`.
- Tests of any kind. No test runner, no test files.
- `vercel.json`, and any `maxDuration` / `runtime` export on the route that calls Gemini.

### Production readiness

**Prototype.** Not "Early MVP" — an MVP that charges money needs a payment path and a durable report, and neither exists in any form. The auth subsystem alone is at MVP quality and should be treated as the one asset worth building on.

### Top 10 blockers to launching and charging

1. **No payment integration whatsoever.** The Stripe SDK is installed and `getStripe()` is defined in `src/Infrastructure/Services/StripeClient.ts`, but grep across the repo shows it is imported by exactly nothing. Checkout is a form that sets React state.
2. **No webhook endpoint, therefore no verifiable paid state.** `STRIPE_WEBHOOK_SECRET` is defined in env and never read by any handler. `user.package` can only be set by the seed script or by hand in the DB.
3. **Reports are not persisted.** `ReportStore.ts` is a `globalThis` Map capped at 500 entries. On Vercel each cold start starts empty and each concurrent lambda has its own. Permanent/shareable report URLs — the growth loop — cannot work.
4. **Free tier is not enforced server-side.** `roastUrlAction` checks the plan only to pick a Gemini model. There is no counter, no limit check, and no auth requirement — an unauthenticated caller can invoke the server action in a loop.
5. **Unbounded, unauthenticated LLM spend.** Direct consequence of the above: one script pointed at the landing page is an uncapped Gemini bill.
6. **SSRF in the page fetcher.** `PageFetcher.ts` fetches any user-supplied URL with `redirect: "follow"` and no host/protocol/private-IP checks. On Vercel that reaches the platform's internal metadata surface and any private host reachable from the function.
7. **Hardcoded credentials on the public login page.** `components/features/auth/login-form.tsx` ships "Demo" buttons that fill in `admin@pageroast.ai` / the literal admin password from `.env.example`, plus a paid-tier test account. If the seed script is ever run against production, that is admin takeover from the login screen.
8. **`DB_SYNCHRONIZE` and no migrations.** Schema is generated from entities at connect time. Shipping that to production risks destructive ALTERs; turning it off leaves you with no way to create the schema at all.
9. **TypeORM connection lifecycle is not serverless-safe.** `globalThis.__dataSource` is only cached when `NODE_ENV !== "production"` (`DBConnection.ts`), so in production every lambda instance builds a new pool. MySQL connection exhaustion under any real concurrency.
10. **Pricing is contradictory and defined in four places.** The landing page says "Pay once, get lifetime access"; the dashboard calls the same plans a subscription that "Renews Sep 1, 2026"; admin shows "$19/mo". You cannot build billing until this is one decision.

---

## 2. Current Architecture

The repository is mid-refactor and the pattern is split cleanly down the middle:

- **Auth + persistence** follow a deliberate layered/DDD arrangement under `src/`: `Domain` (entities and repository interfaces), `Application` (services, DTOs, a `Result` type), `Infrastructure` (TypeORM models, repositories, DI container, external services). Dependency injection is tsyringe, registered in `src/Infrastructure/DIContainer/Container.ts` and resolved eagerly in `Resolver.ts`.
- **Everything else** — roasting, reports, payments, admin — is conventional Next.js App Router: server actions in `app/actions/` calling flat module functions in `src/Infrastructure/Services/`, with no domain entity, no repository, and no service class.

Bootstrapping happens in `instrumentation.ts`, which on the Node runtime initializes `AppDataSource` and imports the DI container. Entity resolution deliberately goes through string names (`src/Infrastructure/Auth/BetterAuthModelMap.ts`) rather than class references, because Next can evaluate a model file into more than one module instance across bundles — a well-reasoned workaround, and a signal of how much friction TypeORM adds here.

### Architectural inconsistencies

- **Two DB access paths.** Better Auth writes through `typeOrmAdapter`; app code reads through `BaseRepository`. Both touch the same `AppDataSource`, but neither knows about the other.
- **The layered structure covers only Account/Session/User/Verification.** The product's own domain — audits, reports, quotas, subscriptions — has no representation in `Domain/` at all.
- **`src/Application/Account/AccountDto.ts` declares an `interface` and a `class` of the same name** using declaration merging with `any`-typed constructor args. It compiles, but it is type-safety theatre.
- **Duplicate module trees.** HEAD still tracks `lib/stripe.ts`, `lib/llm/client.ts`, `lib/llm/prompts.ts`, `lib/pdf/export.ts`, `lib/email/`, `lib/prisma.ts` and the whole `prisma/` directory. They were moved to `src/Infrastructure/` and deleted in the working tree, but the deletion is *uncommitted*. `lib/stripe.ts` and `src/Infrastructure/Services/StripeClient.ts` are byte-identical.
- **Container-per-feature drift.** `containers/Settings/` and `components/Settings/` (capitalized) sit alongside `components/features/settings/` (lowercase) — two competing conventions for the same feature.
- **`lib/settingsApi.ts`** is a one-line pass-through to a server action, adding an indirection layer that does nothing.

### Stale / abandoned code

- The entire Prisma + PostgreSQL schema and its migration (see §25) — a different database engine from the one the app uses.
- `constants/mock-data.ts` (164 lines) and the mock halves of `constants/plans.ts` — still imported by six live components.
- `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` in env config, referenced nowhere.
- `components/features/landing/landing-navbar-wrapper.tsx` — a server component whose comment says it "could handle server-side session checks in the future"; today it returns the client navbar unchanged.
- `src/Infrastructure/Services/Email/ReceiptEmail.tsx` and `sendReceiptEmail` — scaffolding for a payment flow that does not exist.

---

## 3. Repository Map

The parts that matter. Generated files, shadcn primitives and `node_modules` omitted.

| Path | Contents / role |
|---|---|
| `app/page.tsx` | Landing shell → `LandingContainer`. |
| `app/actions/roast.actions.ts` | **The entire audit pipeline.** Untracked (new file). |
| `app/actions/settings.actions.ts` | `setPasswordAction` → `AccountService`. |
| `app/api/auth/[...all]/route.ts` | The only API route in the app. Better Auth catch-all. |
| `app/report/[id]/page.tsx` | Full report; reads the in-memory store synchronously. |
| `app/results/page.tsx` | Static guest results page — mock data only. |
| `app/dashboard/page.tsx` | Server session check; builds a `User` with `auditsUsed: 0` hardcoded. |
| `app/checkout/page.tsx` | Passes `reportId` (default `"demo-report"`) to the fake checkout. |
| `app/admin/page.tsx`, `app/admin/login/page.tsx` | Redirect to login; admin login form. |
| `app/auth/{verify-email,forgot-password,reset-password}/` | Better Auth client flows. Real. |
| `middleware.ts` | Public/protected/admin route gating via a fetch to `/api/auth/get-session`. |
| `instrumentation.ts` | Node-runtime DataSource init + DI container import. Untracked. |
| `src/Domain/{User,Session,Account,Verification}/` | Entities + repository interfaces. Auth-only. |
| `src/Application/Account/` | `AccountService.setPassword`, DTO. |
| `src/Application/Shared/` | `Result`, `AppError`, `DatabaseErrors`, `HttpConstants`, `generateId`. |
| `src/Infrastructure/Database/DBConnection.ts` | TypeORM `DataSource`. MySQL. `synchronize` from env. |
| `src/Infrastructure/Database/Models/` | 4 entities: User, Session, Account, Verification. |
| `src/Infrastructure/Database/Repositories/` | `BaseRepository` + 4 thin subclasses. |
| `src/Infrastructure/Auth/` | TypeORM adapter for Better Auth, model-name map, where-clause builder. |
| `src/Infrastructure/Services/LlmClient.ts` | Gemini REST call, 30s timeout. |
| `src/Infrastructure/Services/LlmPrompts.ts` | The single roast prompt. |
| `src/Infrastructure/Services/PageFetcher.ts` | URL fetch + regex text extraction. **No SSRF guard.** |
| `src/Infrastructure/Services/ReportStore.ts` | In-memory `Map` on `globalThis`. |
| `src/Infrastructure/Services/StripeClient.ts` | Configured, never imported. |
| `src/Infrastructure/Services/PdfExporter.ts` | 4-line stub returning a fake buffer. |
| `src/Infrastructure/Services/EmailService.ts` | Nodemailer SMTP + HTML wrapper + address masking. |
| `src/Infrastructure/DIContainer/` | tsyringe registration and eager resolution. |
| `lib/auth.ts` | Better Auth config: bcrypt, verification, reset, Google, lockout hook. |
| `shared/config/env.ts` | Zod env schema, parsed at import time. |
| `schemas/roast.ts` | Zod schema for the Gemini response. Untracked. |
| `constants/plans.ts`, `constants/mock-data.ts` | Pricing (3 copies) and all mock content. |
| `bin/SeedAdmin.ts` | Seeds admin + demo + unlimited accounts. Untracked. |
| `prisma/` (tracked in HEAD, deleted in worktree) | **Stale.** PostgreSQL schema + migration. |
| `next.config.mjs` | `ignoreBuildErrors: true`; `serverExternalPackages` for typeorm/tsyringe/mysql2. |
| `vercel.json` | Absent. |
| eslint config | Absent, despite a `lint` script. |

**Architectural pattern actually in use:** a layered/DDD island (auth only) embedded in an otherwise conventional Next.js App Router application.

---

## 4. Dependency Audit

Package name is still `"my-project"`. No `engines` field, no `packageManager` field.

| Concern | Package | Version | Notes |
|---|---|---|---|
| Package manager | npm | — | `package-lock.json` present; no pnpm/yarn lockfile. |
| Node | *unspecified* | — | No `engines`. `@types/node` ^22 implies Node 22. |
| Framework | `next` | 16.2.0 | Turbopack build. Middleware convention deprecated (see §19). |
| UI | `react` / `react-dom` | ^19 | — |
| Language | `typescript` | 5.7.3 | Strict on, decorators on — but build ignores errors. |
| ORM | `typeorm` | ^1.1.0 | Note: 1.x, not the long-familiar 0.3.x line. Pin it deliberately. |
| DB driver | `mysql2` | ^3.24.2 | MySQL only. No pg driver installed. |
| Auth | `better-auth` | ^1.6.5 | + `bcryptjs` ^3.0.3 for hashing. |
| DI | `tsyringe` + `reflect-metadata` | ^4.10.0 | Requires `emitDecoratorMetadata`; externalized in next.config. |
| AI | *none* | — | **No Gemini SDK.** Raw `fetch` to the v1beta REST endpoint. |
| Payments | `stripe` | ^22.6.0 | Server SDK installed; never imported outside its own client file. No `@stripe/stripe-js`, no Elements. |
| Scraping | *none* | — | No cheerio, jsdom, playwright, or puppeteer. Regex extraction only. |
| PDF | *none* | — | No pdf library of any kind. |
| Email | `nodemailer` | ^8.0.5 | SMTP. See §15 for the Vercel caveat. |
| Validation | `zod` | ^3.24.1 | Used for env, auth forms, and the LLM response. Good. |
| Forms | `react-hook-form` + `@hookform/resolvers` | ^7.54 / ^3.9 | Used on reset-password; most other forms use raw `useState`. |
| Styling | `tailwindcss` | ^4.2.0 | v4 via `@tailwindcss/postcss`. `autoprefixer` also present — redundant under v4. |
| Analytics | `@vercel/analytics` | 1.6.1 | Mounted in the root layout. |

### Unused / suspect

- **`stripe`** — dead weight until §12 is addressed; and if you move to Lemon Squeezy or Paddle it should be removed outright.
- **`@better-fetch/fetch`** — used in exactly one place, `middleware.ts`, for a call plain `fetch` would make.
- **`recharts` + `components/features/analytics/UsageBarChart.tsx`** — the chart component exists; nothing renders it.
- **~30 Radix packages** from the shadcn scaffold (carousel, menubar, context-menu, resizable, input-otp, drawer…) far exceed what four screens use.
- **`autoprefixer`** — superseded by Tailwind v4's pipeline.
- **Missing dev dependency:** `eslint` itself, plus any config. The `lint` script cannot run.

### Vercel-hostile dependencies

- **typeorm + tsyringe + reflect-metadata** — decorator metadata and dynamic entity loading are the two things bundlers handle worst. They are already in `serverExternalPackages`, which is the correct mitigation, but this stack is the main reason the app is fragile in a serverless target.
- **mysql2** — pooled TCP connections in a lambda; needs an explicit small pool or a proxy (see §18).
- **nodemailer** — long-lived SMTP handshakes inside a request; works, but slow and fragile (see §15).

---

## 5. Authentication

The strongest part of the codebase. Library: **better-auth ^1.6.5**, wired to TypeORM/MySQL through a hand-written adapter.

| Feature | Status | Implementation |
|---|---|---|
| Registration | **FUNCTIONAL** | `useSignup` → `authClient.signUp.email`; Zod-validated client-side (8+ chars, upper, digit, symbol) and by Better Auth server-side (min 8, max 128). |
| Password hashing | **FUNCTIONAL** | bcryptjs, cost 10, custom `hash`/`verify` in `lib/auth.ts`. Same cost in `AccountService` and the seed script. |
| Login | **FUNCTIONAL** | `useLogin` with `sanitizeCallbackUrl` guarding against open redirect. |
| Logout | **FUNCTIONAL** | `authClient.signOut()` + local cache clear. |
| Email verification | **FUNCTIONAL** | `sendOnSignUp: true`, `requireEmailVerification: true`, `autoSignInAfterVerification: true`. Resend flow at `/auth/verify-email`. |
| Password reset | **FUNCTIONAL** | `requestPasswordReset` → emailed link → `authClient.resetPassword`. Note: `resetToken`/`resetTokenExpiresAt` columns exist on `UserModel` but Better Auth uses the `verifications` table instead — the columns are dead. |
| Set / change password | **FUNCTIONAL** | `useSetPassword` branches: with a current password → `authClient.changePassword`; without (OAuth-only accounts) → `setPasswordAction` → `AccountService.setPassword`, which refuses if a credential password already exists. |
| Google OAuth | **PARTIAL** | Provider block + `mapProfileToUser` + buttons in both forms; credentials are empty. Build warns three times. |
| Sessions & cookies | **FUNCTIONAL** | Better Auth defaults (HTTP-only, SameSite=Lax, Secure in prod), persisted to `sessions` with `token` unique-indexed, plus IP and user-agent. |
| Role handling | **PARTIAL** | A single boolean `isAdmin` exposed as a Better Auth additional field. No role table, no permissions, no way to grant it except the seed script or direct SQL. |
| Route protection | **FUNCTIONAL** | `middleware.ts`: unauthenticated → `/login?callbackUrl=…`; non-admin on `/admin/*` → `/dashboard?error=unauthorized`. `app/dashboard/page.tsx` re-checks the session server-side. |
| Account lockout | **BROKEN** | The `before` hook reads `failedPasswordAttempts >= 5 && lockedUntil > now` and returns 423 — but no code path ever writes those columns. |
| Rate limiting | **MISSING** | Better Auth's built-in rate limiter is not enabled; no external limiter. |

**Tables used by auth:** `users`, `sessions`, `accounts`, `verifications` — mapped by name in `BetterAuthModelMap.ts`. The credential provider id is `"credential"`; `bin/SeedAdmin.ts` also cleans up rows from an older `"email-password"` provider id, so expect legacy rows in existing databases.

### Security-sensitive observations

- **BROKEN — Demo credential buttons on the public login page** (`login-form.tsx:46–53`), including an admin pair matching `.env.example`. Detailed as CRITICAL in §17.
- **MISSING — No brute-force defence.** Lockout is inert and there is no rate limit; bcrypt cost 10 is the only friction.
- **PARTIAL — The middleware makes an HTTP round-trip per request** to its own `/api/auth/get-session`. It runs on nearly every path (the matcher excludes only static assets), so every page view costs an extra function invocation — a latency and cost problem, not a correctness one.
- **PARTIAL — `trustedOrigins`** is set from `NEXT_PUBLIC_APP_URL` only; preview deployments on `*.vercel.app` will be rejected unless that variable is set per-environment.
- **FUNCTIONAL — Open-redirect protection** is correctly implemented in `sanitizeCallbackUrl` (`lib/utils.ts`), rejecting `//` and absolute URLs.

---

## 6. Database & Persistence

MySQL via TypeORM. Four tables, all of them auth. Nothing about the product is stored.

### Configuration and lifecycle

`src/Infrastructure/Database/DBConnection.ts` builds a `DataSource` from `DATABASE_URL` with `synchronize` and `logging` read directly from `process.env` (not through the Zod-validated `env` object). Initialization happens in `instrumentation.ts` on the Node runtime, and defensively again inside `getRepository()` in the Better Auth adapter.

> **The production caching bug.** `globalThis.__dataSource = AppDataSource` executes only `if (process.env.NODE_ENV !== "production")`. The dev-only guard is copied from the standard Prisma pattern, where it exists to prevent hot-reload leaks — but here it means production gets *no* cross-module reuse of the DataSource. Combined with no explicit pool sizing (`mysql2` defaults to 10 connections per pool), a burst of concurrent lambdas will exhaust `max_connections`.

There is no SSL block, no `extra: { connectionLimit }`, no connect timeout, and no distinction between development and production config beyond that one line. `DIRECT_URL` is used only by `bin/SeedAdmin.ts`, which builds its own DataSource to bypass poolers.

### Entities

| Table | Key fields |
|---|---|
| `users` | `id` varchar(36) PK · `email` unique · `name`, `firstName`, `lastName` · `emailVerified` · `image` · **`isAdmin`** · **`package`** (nullable text — the *only* paid-state field in the schema) · `failedPasswordAttempts` · `lockedUntil` · `resetToken` unique · `resetTokenExpiresAt` · timestamps |
| `sessions` | `id` PK · `userId` · `token` unique · `expiresAt` · `ipAddress` · `userAgent` · FK cascade |
| `accounts` | `id` PK · `userId` · `accountId` · `providerId` · unique(`providerId`,`accountId`) · OAuth tokens + expiries · `scope` · `idToken` · `password` (bcrypt hash for the `credential` provider) |
| `verifications` | `id` PK · `identifier` · `value` · `expiresAt` — backs both email verification and password reset |

**What does not exist:** no `reports`, `audits`, `usage`, `subscriptions`, `payments`, `plans`, `invoices`, or `roles` table. Paid state is a free-text `package` column with no constraint, no period end, no external customer/subscription id, and no history.

### Migrations

**MISSING.** There is no TypeORM migrations directory, no `migrations` array in the DataSource, and no migration script in `package.json`. Schema creation depends entirely on `DB_SYNCHRONIZE=true`, which is set in the local `.env` and documented in `.env.example` as "dev only, no migrations yet".

### Report persistence

**MOCK.** `src/Infrastructure/Services/ReportStore.ts` is a `Map<string, StoredReport>` held on `globalThis.__reportStore`, capped at 500 entries with FIFO eviction. Its own doc comment is candid: *"In-memory report cache — no DB entity exists yet for persisted audits. Ephemeral (cleared on server restart)."* IDs come from `crypto.randomUUID()`.

**What happens on Vercel:** each serverless instance has its own module scope. A report written by the lambda that handled the roast is invisible to the lambda that later serves `/report/[id]` — so a user who clicks "View Full Report" has a good chance of a 404 *immediately*, not just after a restart. After any redeploy, scale-to-zero, or instance recycle, every report is gone. `app/report/[id]/page.tsx` already renders a "reports aren't saved permanently yet" empty state, which is honest but is not a product.

No filesystem writes, no JSON persistence, no cache layer, and no other global stores exist — `globalThis` is used in exactly three places: the report store, the DataSource, and the DI-registration flag.

### Conflicting artifacts

HEAD still tracks `prisma/schema.prisma` declaring `provider = "postgresql"` with Prisma models mirroring the same four tables, plus `prisma/migrations/20260405080023_init/migration.sql` and `prisma/seed-admin.ts`. `prisma` and `@prisma/client` are *not* in `package.json`, so this is inert — but it is a live trap for anyone who reads the schema file and assumes Postgres. The working tree deletes it; the deletion is uncommitted.

---

## 7. AI / Gemini Pipeline

One model call per audit, no SDK, no retries, no cost ceiling.

**Client:** `src/Infrastructure/Services/LlmClient.ts` — `generateRoastJson(prompt, tier)`. No Gemini SDK: a raw `POST` to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with the key in an `X-goog-api-key` header and `generationConfig.responseMimeType: "application/json"`.

| Aspect | Current behaviour |
|---|---|
| Env var names | `GEMINI_API_KEY`, `GEMINI_FREE_MODEL` (default `gemini-flash-lite-latest`), `GEMINI_PREMIUM_MODEL` (default `gemini-3.6-flash`) |
| Tier selection | `modelForTier()`; in `roastUrlAction`, `PAID_PLANS = new Set(["pro","agency"])` matched against `session.user.package`. No session ⇒ free model. |
| Calls per audit | **One.** A single response supplies both preview fields and full-report fields — a deliberate cost decision documented in `schemas/roast.ts`. |
| Response validation | `JSON.parse` in a try/catch, then `roastResultSchema.safeParse`. Array lengths and string lengths are bounded so a malformed response cannot break the layout. This part is well done. |
| Error handling | Distinct messages for missing key, network failure, abort, non-2xx (first 500 chars of body), `promptFeedback.blockReason`, and empty candidates. The action then collapses them to two generic user-facing strings and logs the detail server-side. |
| Timeout | 30s via `AbortController`. |
| Retries | **None.** A single 429 or 503 fails the whole audit. |
| Token / cost protection | **None.** No `maxOutputTokens`, no per-user cap, no spend tracking, no caching of repeat URLs. |
| Prompt-injection protection | **None.** Scraped page text is interpolated straight into the prompt inside triple quotes — a page can simply instruct the model to return a score of 100. Output is at least schema-constrained, which limits the blast radius to content, not shape. |
| Max input size | 6,000 characters (`MAX_TEXT_LENGTH`), plus title and URL. |

### Request path, end to end

1. **Submit** — `HeroSection` or `RoastTab` validates with `isValidUrl`, then `LandingContainer.handleLandingRoast()` / `DashboardShell.handleRoastClick()` calls the server action.
2. **Server action** — `roastUrlAction` re-validates, prefixes `https://` if missing, reads the session for tier only.
3. **Fetch** — `fetchPageText(url)` returns `{ title, text }`.
4. **Prompt** — `buildRoastPrompt({url, pageTitle, pageText})` produces one string specifying the exact JSON shape.
5. **Model** — `generateRoastJson(prompt, tier)`.
6. **Parse** — `JSON.parse` → `roastResultSchema.safeParse`.
7. **Store** — `saveReport({...parsed.data, id: crypto.randomUUID(), url, date, tier})` into the in-memory Map.
8. **Preview** — the full record is returned to the client and rendered by `LandingResultsPreview` (landing) or inline in `RoastTab` (dashboard).
9. **Full report** — `router.push('/report/'+id)`; the RSC calls `getReport(id)` against the same Map. Cross-instance, this frequently misses.

> **Note the paywall inversion:** the single call already returns `elementGrades` and `actionFixes` — the "premium" content — and ships all of it to the client in the preview response. The lock icons in `results-preview.tsx` cover placeholder `div`s, not withheld data.

---

## 8. URL Fetching & Security

40 lines of regex and one `fetch`. It works on well-behaved pages and is the app's largest security hole.

| Control | Present | Detail |
|---|---|---|
| URL validation | Weak | `isValidUrl` (`lib/utils.ts`) only constructs a `URL` and checks `hostname.includes(".")`. `127.0.0.1`, `169.254.169.254`, `10.0.0.5`, and `internal.db.local` all pass. |
| Protocol restriction | **No** | The scheme is never inspected. A value starting with `http` is passed through verbatim — and anything else gets `https://` prefixed, which does neuter `file:` and `gopher:` by accident, not by design. |
| Private-network / localhost blocking | **No** | Nothing. No DNS resolution check, no IP-range deny list. |
| Redirect handling | **No** | `redirect: "follow"` with no hop limit and no re-validation of the destination — so even a hostname allow-list would be bypassable via a public URL that 302s to `169.254.169.254`. |
| Timeout | Yes | 10s `AbortController`. |
| User agent | Yes | Spoofed as Chrome 124 on Windows. |
| Response size limit | **No** | `await res.text()` reads the entire body into memory before truncation. A multi-gigabyte or infinite response is an OOM / bill event; the 6,000-char cap applies only *after* the whole body has been buffered. |
| Content-type check | Yes | Requires `text/html`; rejects everything else with a clear message. This is the one control that limits exfiltration usefulness. |
| HTML parsing | Regex | `<title>` extraction and tag stripping via regex; `<script>`, `<style>` and comments removed; six HTML entities decoded; whitespace collapsed. |
| Malformed pages | Tolerant | Degrades to empty text rather than throwing; the prompt explicitly tells the model to say so honestly. |
| JS-rendered pages | **No** | SPA landing pages (the product's core target — Framer, Webflow interactions, React marketing sites) frequently yield near-empty text, producing a confident audit of nothing. |

### SSRF assessment

**Yes — this is a real, exploitable SSRF, unauthenticated.** The server action is callable without a session, takes an attacker-controlled URL, and fetches it from inside your infrastructure. On Vercel the immediate targets are the platform's internal endpoints and anything else routable from the function; on a self-hosted or VPC deployment it is far worse. The `text/html` requirement and the fact that only extracted text reaches the response limit blind-scanning somewhat, but error messages differentiate connection-refused from timeout from wrong-content-type, which is enough for port and host enumeration.

**Minimum fix before launch:** allow only `http:`/`https:`, resolve DNS and reject private/loopback/link-local/CGNAT ranges before connecting, set `redirect: "manual"` and re-validate every hop, cap the body with a streaming reader (256 KB is ample for 6,000 characters of text), and require a session plus a quota check.

### Does it work on Vercel?

Mechanically yes — `fetch` with `AbortController` is fine on both runtimes and the whole fetcher is dependency-free. The constraint is duration: a 10s page fetch plus a 30s Gemini call is up to 40s inside one server action, against a 10s default on Hobby and 15s (configurable to 300s) on Pro Fluid functions. Without an explicit `maxDuration`, slow audits will be killed mid-flight.

---

## 9. Screenshot / Visual Auditing

Searched for playwright, puppeteer, chromium, browserless, screenshot services, and multimodal Gemini input.

**The application does not capture screenshots. There is no visual analysis of any kind.** No browser-automation package appears in `package.json`; the strings "playwright", "puppeteer", "chromium", "browserless" and "screenshot" appear nowhere in the source. The Gemini request body contains a single text part — no `inlineData`, no `fileData`, no vision input.

| Capability | Status |
|---|---|
| Desktop screenshot | **MISSING** |
| Mobile screenshot | **MISSING** |
| Visual / multimodal Gemini analysis | **MISSING** |
| Reports are text-only | **Confirmed** |

> **This matters commercially.** The prompt asks the model to grade "Hero Section", "Mobile Layout", "Visual Design" and "Trust Signals" from stripped text alone. The landing page promises "a brutally honest AI UX audit". Those grades are, structurally, guesses — and a customer who paid $19 can tell.

### What adding it would take on Vercel

- **Don't run Chromium in the function.** `@sparticuz/chromium` + `puppeteer-core` is possible but sits near the 250 MB unzipped bundle limit, adds seconds of cold start, and needs a long `maxDuration`.
- **Use a screenshot API** (ScreenshotOne, Urlbox, Browserless, ApiFlash, or a small Cloud Run / Fly service you own). One HTTP call, no bundle impact, and desktop + mobile viewports for free.
- **Then feed both images to Gemini** as `inlineData` parts alongside the existing text part, and extend `roastResultSchema` with the visual fields. The single-call design survives.
- **Store the images** in blob storage keyed by report id, so the persisted report can show them.
- Budget roughly: screenshot service cost per audit, plus a materially larger Gemini bill for image input. This is the strongest candidate for a genuine paid-tier differentiator — which is also the argument for gating it behind the paid plan from day one.

---

## 10. Reports

### Schema

`StoredReport extends RoastResult` with `id`, `url`, `date` (a pre-formatted `"Sep 5, 2026"` string, not a timestamp — a mistake worth fixing before it lands in a database), and `tier`.

`RoastResult` (`schemas/roast.ts`): `score` 0–100 · `strengths[1–6]` {headline, detail} · `criticalIssues[1–6]` {title, desc, severity: CRITICAL|WARNING|HIGH} · `roastLines[1–6]` · `rewrittenHeroCopy` · `elementGrades[3–6]` {label, score} · `actionFixes[1–4]` {priority, title, copy, code}.

| Piece | Status | Detail |
|---|---|---|
| Report generation | **FUNCTIONAL** | Real Gemini output, schema-validated. |
| `/report/[id]` | **PARTIAL** | Renders correctly when the id happens to be in this instance's memory; otherwise a "not found" page. |
| `/results` | **MOCK** | Statically prerendered `GuestResults` — hardcoded "example.com", score 42, canned roast lines and code snippet. Nothing routes to it from the roast flow. |
| Preview vs full report | **MOCK** | Both render from the same object the client already holds. The "Unlock Full Report" paywall covers empty placeholder divs. |
| Persistence | **MOCK** | In-memory Map, 500-entry cap. |
| Permanent URLs | **BROKEN** | The URL shape is permanent; the data behind it is not. |
| Ownership | **MISSING** | `StoredReport` has no `userId`. Reports belong to nobody. |
| Authorization | **MISSING** | `/report/[id]` is not in `PROTECTED_ROUTES` and the page performs no session check. Any report id is world-readable. |
| Sharing | **MISSING** | No share button, no share link, no OG image, no social preview. |
| Guest vs authenticated reports | **MISSING** | No distinction exists — the pipeline is identical and anonymous. |
| Audit history | **MOCK** | The History tab renders `MOCK_AUDIT_HISTORY`; "View report" pushes `/report/getshipfast-co`, which is always a 404. |

### Direct answers

- **Can a report survive a redeployment?** No. It frequently does not survive the next request.
- **Can anyone access someone else's report?** Yes, if they have the id — there is no owner and no check. Practically, ids are unguessable, so the exposure is via link-sharing rather than enumeration.
- **Are report IDs secure?** Yes — `crypto.randomUUID()` (v4, CSPRNG). Unguessable. Fine as a capability URL, not a substitute for authorization on private reports.
- **Are reports associated with users?** No.
- **Are reports durable?** No.

---

## 11. Usage Limits

Every reference to the free limit in the codebase, in full.

| Location | What it is |
|---|---|
| `constants/plans.ts:88–89` | `FREE_AUDIT_LIMIT = 3` and `FREE_AUDITS_USED = 2` — two module constants. The second is a fake "current usage". |
| `roast-tab.tsx:55–61` | Renders "2 of 3 free audits used" and a 66%-wide progress bar from those constants, identically for every user. |
| `app/dashboard/page.tsx:30` | `auditsUsed: 0, // In production, this would be fetched from DB` |
| `subscription-tab.tsx` | "2 of 3 audits used · Resets Sep 1, 2026" — a hardcoded string, and a hardcoded `width: "66%"` bar. |
| `roast.actions.ts` | Reads the session to choose a model tier. **No count, no limit, no gate.** |

**Enforced server-side? No — there is nothing to enforce.** No usage table, no counter column, no request log, no rate limiter, no domain object of any kind for quota. `UserModel` has no usage field.

### How it is bypassed today

There is no bypass to describe, because there is no barrier. `roastUrlAction` runs for unauthenticated callers; the landing page calls it with no account at all. Anyone can POST to the server action endpoint in a loop and receive unlimited free audits. A logged-in free user sees a progress bar that never moves and is never blocked.

The only plan-dependent behaviour in the entire pipeline is which Gemini model gets used — and since `package` is only settable from the seed script or SQL, even that is not reachable through the product.

> **Consequence for the MVP:** the free tier is simultaneously the whole product and an uncapped liability. Usage enforcement is not a "nice to have after payments" — it is the thing that makes payment meaningful, and it must land in the same phase.

---

## 12. Payments & Billing

> **Every Stripe reference in the repository, outside `package.json` and the lockfile, is inside `src/Infrastructure/Services/StripeClient.ts` and its uncommitted duplicate `lib/stripe.ts`.** Nothing imports either file. The payment system does not exist in any partial form — it is a UI simulation.

| Capability | Status | Evidence |
|---|---|---|
| Stripe SDK installed | **Yes** | `stripe ^22.6.0` in dependencies. |
| Stripe server client configured | **PARTIAL** | `getStripe()` — lazy singleton, `apiVersion: "2024-04-10" as any` (cast to bypass a type mismatch with SDK v22; likely a stale pin). |
| Stripe client actually called | **No** | Zero imports repo-wide. |
| Stripe.js / Elements | **MISSING** | `@stripe/stripe-js` and `@stripe/react-stripe-js` are not installed. |
| Checkout Sessions | **MISSING** | — |
| PaymentIntents | **MISSING** | — |
| Subscription APIs | **MISSING** | — |
| Webhook route | **MISSING** | The only route file in `app/` is the Better Auth catch-all. |
| Webhook signature verification | **MISSING** | `STRIPE_WEBHOOK_SECRET` is declared in `shared/config/env.ts` and `.env`, and read by nothing. |
| Paid status persisted | **PARTIAL** | Only `users.package`, writable solely by `bin/SeedAdmin.ts` or manual SQL. The UI's "upgrade" writes React state and `localStorage`, and is gone on refresh. |
| Subscription status persisted | **MISSING** | No status, period end, customer id, or subscription id anywhere in the schema. |
| Cancellation | **MISSING** | No UI, no endpoint. |
| Failed payments / dunning | **MISSING** | — |
| Renewals | **MISSING** | — |
| Fake card inputs in the frontend | **MOCK — two of them** | See below. |
| Checkout only simulated | **Confirmed** | See below. |

### The two fake payment surfaces

**`components/features/checkout/checkout-page.tsx`** — a full Stripe-lookalike checkout: contact email, card number auto-formatted in 4-digit groups, MM/YY, CVC, collapsible billing address, an order summary reading "The Actionable Fix · One-time purchase · Lifetime access · $19.00", and trust badges ("256-bit SSL encrypted", "No subscription. Pay once."). Validation is `CARD_REGEX = /^\d{16}$/` — not even a Luhn check. `handleSubmit()` is three lines: bail if invalid, `onUpdateUser({...user, plan: "pro"})`, `setSuccess(true)`. It then shows "Payment Successful!" and links to `/report/{reportId}`. No fetch, no action, no charge. It also falls back to a hardcoded `"Alex Kim" / alex@example.com` user when no prop is passed — which is the case for the real `/checkout` route.

**`components/features/dashboard/payment-dialog.tsx`** — the same idea in a modal, placeholder `4242 4242 4242 4242`, "Pay $19 Now →" calling `onSuccess(plan)`, which in `DashboardShell.handlePaymentSuccess` sets local state and shows a green "Payment successful! Plan upgraded." toast. Refreshing reverts everything.

### Where pricing is defined

| Source | Says |
|---|---|
| `constants/plans.ts` → `SUBSCRIPTION_PLANS` | Free $0 "3 audits/month" · Pro $19 "Unlimited audits" · Agency $49 |
| `constants/plans.ts` → `LANDING_PRICING_PLANS` | "The Reality Check" $0 · "The Actionable Fix" $19 · "The Agency Engine" $49 — different feature lists from the above |
| `constants/plans.ts` → `ADMIN_PLAN_CONFIGS` | Same prices plus invented subscriber counts (842 / 156 / 23) |
| `checkout-page.tsx` | `$19.00` written into the markup three times |
| `payment-dialog.tsx` | `selectedPlan === "pro" ? "19" : "49"` inline, twice |
| `report-view.tsx` | "Upgrade to Pro — $19" |
| `pricing-section.tsx` | Appends "/one-time" to every non-zero price |
| `admin-plans-tab.tsx` | Appends "/mo" to every price — from the same constants |

### Model contradictions to resolve before writing any billing code

- **One-time vs recurring.** Landing: "No subscription traps. Pay once, get lifetime access." Checkout: "One-time purchase · Lifetime access". Dashboard subscription tab: "Unlimited audits · Renews Sep 1, 2026". Admin: "$19*/mo*". Four surfaces, three different business models.
- **Unlimited vs metered.** Pro is sold as "Unlimited audits" for a possible one-time $19, while each audit carries a real Gemini cost and there is no rate limit. That is an unbounded liability per customer — the strongest argument for either a credit pack or a genuine monthly subscription with a fair-use cap.
- **Pro vs Agency overlap.** `SUBSCRIPTION_PLANS` gives Pro "Unlimited audits"; `LANDING_PRICING_PLANS` gives "Unlimited audits" to Agency instead and gives Pro only "Full UX/UI audit". The tiers do not agree on what you get.
- **Agency promises features that do not exist** — white-label PDF reports (PDF is a stub), API access (no API), team seats (no team model).

### Merchant-of-record note

Since the founder is in Pakistan and Stripe is not straightforwardly available there, the good news is that **there is no Stripe integration to unwind** — the cost of switching to Lemon Squeezy or Paddle is zero, because the payment layer is entirely unwritten. Both MoRs use the same shape this codebase needs anyway: a hosted checkout URL created server-side, a signed webhook that flips paid state, and a customer portal you link to instead of building cancellation UI. Deleting `stripe`, `StripeClient.ts`, the three `STRIPE_*` variables and both fake payment components is a clean, low-risk first step.

---

## 13. Pricing / Plans

| Tier | Price | Advertised | Actual server behaviour |
|---|---|---|---|
| **FREE** | $0 | 3 audits/month · basic report · 3-point roast summary · conversion score · 1 fix preview · email support | Unlimited audits, no account required, full report data returned. Uses `GEMINI_FREE_MODEL`. |
| **PRO** | $19 | Unlimited audits · full UX/UI audit · rewritten hero copy · copy-paste code fixes. "one-time" on the landing page, "renews" in the dashboard, "/mo" in admin. | Identical to free except `package === "pro"` selects `GEMINI_PREMIUM_MODEL` and hides the upgrade banner in `report-view.tsx`. Not purchasable. |
| **AGENCY** | $49 | Everything in Pro · unlimited team seats · white-label reports · API access · white-label PDF | Identical to Pro. Seats, white-label and API do not exist in any form. |

### Single source of truth?

**No.** `constants/plans.ts` is the closest thing, and it internally holds three divergent copies of the same three plans. Prices are additionally hardcoded in at least four components. Nothing is database-backed: there is no plan table, and `ADMIN_PLAN_CONFIGS.subscribers` ("842 users") is invented. The admin "Edit Plan" form (`admin-plans-tab.tsx`) lets you type a new price and click "Save Plan", whose handler is `() => { setEditingPlan(null); setEditForm(null); }` — it discards the edit.

### Mismatches to fix

- Free tier: "3 audits/month" (plans) vs "1 free audit" (the target MVP) vs unlimited (reality).
- Unlimited audits assigned to Pro in one constant and to Agency in another.
- `PlanId` is typed `"free" | "pro" | "agency"`, but `user.package` is a nullable free-text column with no constraint and no default — `(authUser.package as PlanId) || "free"` in `app/dashboard/page.tsx` is an unchecked cast.
- Model tiering uses `PAID_PLANS = new Set(["pro","agency"])` defined locally in `roast.actions.ts` — a fourth place plan identity is encoded.

---

## 14. Admin

| Area | Status | Detail |
|---|---|---|
| Admin authentication | **FUNCTIONAL** | `/admin` redirects to `/admin/login`, which is the normal Better Auth email login with amber styling. Same session system. |
| Admin authorization | **FUNCTIONAL** | `middleware.ts` redirects authenticated non-admins away from `/admin/*` (excluding `/admin/login`) based on `session.user.isAdmin`. The portal itself renders from `user.role === "admin"`, derived server-side in `app/dashboard/page.tsx`. |
| Dashboard numbers | **MOCK** | Total Users 1,284 · Audits Run 9,420 · MRR $4,180 · Avg Score 54 — literals in `dashboard-shell.tsx`. |
| Recent activity feed | **MOCK** | "Dan R. upgraded to Agency Plan · 2 mins ago" — an inline array in `admin-dashboard-tab.tsx`. |
| System health | **MOCK** | "AI Roaster — High Load, 85%" is a hardcoded number, not a probe. |
| User management | **MOCK** | Table renders `ADMIN_USERS_FULL` from mock data. Search box, Export CSV, Edit and Delete buttons have no handlers. Pagination is decorative. |
| Plans | **MOCK** | Editable form that discards its input on save. |
| Settings | **MOCK** | Maintenance mode and public-registration toggles live in `useState`; "Save" is a 1.5s `setTimeout`. Nothing is read by the app. |
| Revenue / subscribers | **MOCK** | All invented. |
| Database-backed analytics | **MISSING** | The admin surface issues no queries at all. |

**Dangerous functionality:** none, and for the unusual reason that no admin control is wired to anything — the Delete-user button cannot delete a user because it has no handler. The genuine risks are (a) the demo admin credential button on the public login page (§17), and (b) the fact that a future implementation would be building on a mock UI where destructive buttons already exist and look functional. If admin ships for MVP, wire the read-only views first and leave destructive actions unbuilt.

---

## 15. Email

**Nodemailer over SMTP**, configured once at module load in `src/Infrastructure/Services/EmailService.ts`. Env names: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — all required by the Zod schema, so the app cannot boot without them. `secure` is derived as `SMTP_PORT === 465`. Timeouts are explicit and sensible: 10s connection, 10s greeting, 15s socket.

| Email | Status | Trigger |
|---|---|---|
| Verification | **FUNCTIONAL** | `emailVerification.sendVerificationEmail` in `lib/auth.ts`; sent on signup and on manual resend. Throws if SMTP fails, so signup fails loudly. |
| Password reset | **FUNCTIONAL** | `emailAndPassword.sendResetPassword`; copy states a 1-hour expiry. |
| Receipt | **MOCK** | `sendReceiptEmail()` is a `console.log`; `Email/ReceiptEmail.tsx` is an unused template. |
| Any other transactional | **MISSING** | No welcome, no report-ready, no quota-warning, no dunning email. |

**Templates:** one `wrapEmailHtml()` layout with inline CSS and a PageRoastAI header; bodies are inline HTML strings in `lib/auth.ts`. No plain-text alternative part, which will hurt deliverability.

**Error handling:** good. `sendEmail` returns `{data, error}`, and recipient addresses are masked in logs (`maskEmail`) and stripped from SMTP error text — genuinely careful PII handling. In production the recipient is logged as `[redacted]`.

**Local vs production:** the only difference is that log redaction. Same transport, same config path.

**Vercel compatibility — workable, not ideal.** Outbound SMTP works from Vercel Node functions, but: the transporter is created at module scope and cannot pool usefully across invocations; each send pays a full TCP+TLS handshake inside the request; port 25 is blocked and some providers throttle serverless IP ranges; and because verification email failure *throws*, an SMTP hiccup turns into a failed signup rather than a retry. For an MVP that gates login behind email verification, an HTTP email API (Resend, Postmark, SES) is materially more reliable than SMTP-in-a-lambda — and it is a small, contained change behind the existing `sendEmail()` signature.

---

## 16. PDF Export

**MOCK.** The whole feature is four lines.

- **Library:** none installed.
- **Implementation:** `src/Infrastructure/Services/PdfExporter.ts` — `generatePDF(reportId)` logs and returns `Buffer.from("Mock PDF content")`.
- **Callers:** none. The "Download PDF" button in `components/features/report/report-header.tsx` has no `onClick` — it is a styled `<button>` that does nothing.
- **White labeling:** does not exist, despite being an advertised Agency feature.
- **Fonts / assets / filesystem:** none, therefore no temp-file or filesystem assumptions to worry about.
- **Vercel:** the stub runs fine because it does nothing. A real implementation would matter: a Chromium print-to-PDF is the same bundle/cold-start problem as §9, whereas a pure-JS generator (pdf-lib, @react-pdf/renderer) or a hosted HTML→PDF service is serverless-safe.

**Recommendation:** remove the button and the stub for MVP. A dead download button on a paid report is worse than no button. Browser print-to-PDF via a print stylesheet on `/report/[id]` is a genuine day-one alternative costing almost nothing.

---

## 17. Security Findings

Ranked, and limited to issues that actually apply to this code.

### CRITICAL — Admin credentials rendered on the public login page

`components/features/auth/login-form.tsx:46–53` defines `setDemoUser()` with literal credentials for three accounts — user, **admin**, and a paid "unlimited" account — filled in by visible buttons at `login-form.tsx:166–181`. The admin pair matches `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env.example`, and `bin/SeedAdmin.ts` creates exactly these accounts from the environment.

**Impact:** if the seed script is ever run against production with the example password, or if the operator reuses it, anyone visiting `/login` gets one-click admin. The demo block must not ship to production, and the seeded demo/unlimited accounts must not exist there.

### CRITICAL — Unauthenticated SSRF via the roast server action

`roastUrlAction` is callable without a session and passes an arbitrary user URL to `fetchPageText`, which follows redirects with no host, protocol, or private-IP validation (`src/Infrastructure/Services/PageFetcher.ts`). Cloud metadata endpoints and any host routable from the function are reachable. Distinct error strings for timeout / unreachable / wrong-content-type give an oracle for host and port enumeration.

**Fix before launch:** scheme allow-list, DNS resolution + private-range deny list, `redirect: "manual"` with per-hop re-validation, streamed body cap, and an auth/quota gate.

### CRITICAL — Unbounded AI cost: no auth, no quota, no rate limit

Any anonymous client can invoke the roast action repeatedly. Each call is one outbound page fetch plus one Gemini `generateContent`. There is no counter, no per-IP limit, no daily ceiling, and no `maxOutputTokens`. This is a direct financial-loss vector and, at volume, an availability one.

### HIGH — Client-side-only access control on paid features

Upgrades are performed by `onUpdateUser({...user, plan: "pro"})` plus `localStorage.setItem("pageroast_user", …)` in `dashboard-shell.tsx`. The paywalls in `results-preview.tsx` and `report-view.tsx` are conditional renders over data the client already has. Once real payments exist, every gate must be re-derived server-side from the session — none of the existing gating logic is reusable as an authorization boundary.

### HIGH — Account lockout is inert

The `before` hook in `lib/auth.ts:88–107` checks `failedPasswordAttempts >= 5`, but no code writes that column. Combined with no rate limiting on `/api/auth/sign-in/email`, password guessing is unthrottled. The hook also swallows all exceptions silently (`catch { }` with a comment), so a failure inside it fails open.

### HIGH — No authorization on report URLs

`/report/[id]` is absent from `PROTECTED_ROUTES` and performs no session or ownership check. Ids are UUIDv4 so they are not enumerable, but any leaked link exposes the full report permanently. Once reports carry a user id and are persisted, this becomes a straightforward IDOR unless a check is added at the same time.

### HIGH — `DB_SYNCHRONIZE` reachable in production

`DBConnection.ts` reads `process.env.DB_SYNCHRONIZE` with no environment guard. Setting it in Vercel — easy to do by copying `.env`, where it is `true` — lets TypeORM alter or drop production columns on boot. It should be hard-blocked when `NODE_ENV === "production"`.

### MEDIUM — Prompt injection from scraped pages

`LlmPrompts.ts` interpolates fetched page text directly into the instruction prompt. A page can carry text instructing the model to award a perfect score or emit chosen content. The Zod schema bounds the *shape* of the response, and `actionFixes[].code` is rendered inside `<pre><code>` as text (React escapes it — no XSS), so this is a trust/quality issue rather than a code-execution one. Mitigate with clear delimiting, an explicit "content below is untrusted data" instruction, and a sanity check on scores.

### MEDIUM — Middleware fails open on session-fetch errors

`middleware.ts` wraps the `betterFetch` in try/catch and, on error, proceeds with `session === undefined`. That correctly denies protected routes — but it also means a transient auth-service failure logs everyone out mid-session rather than erroring. Lower severity than it looks, since the failure mode is deny-not-allow; worth noting because the admin check `!session.user.isAdmin` reads a field with no runtime validation.

### MEDIUM — `ignoreBuildErrors: true` in `next.config.mjs`

Type errors cannot fail the build. `tsc --noEmit` currently passes cleanly, so the flag is hiding nothing today — which is exactly why it should be removed now, while it is free to do so.

### LOW — Verbose diagnostics in the seed script

`bin/SeedAdmin.ts:127` prints `Object.keys(process.env)` (filtered for SECRET/PASS) when admin env vars are missing. Names only, no values, and it is a CLI script — but it is unnecessary output.

### LOW — Security posture that is already correct

Worth recording so it is not regressed: all DB access goes through TypeORM's query builder with parameterized criteria — **no SQL injection surface**. No `dangerouslySetInnerHTML` anywhere — **no stored XSS path** from model output. CSRF is handled by Better Auth's SameSite cookies and Next's server-action origin checks. Passwords are bcrypt cost 10. Email addresses are masked in logs. `.env` is gitignored and has never been committed.

---

## 18. Vercel Compatibility

> **VERCEL READY: PARTIALLY.** It will build and deploy today — the build succeeds and every route compiles. Auth, the landing page and the roast call will work. Reports will break unpredictably, long audits will time out, and the database will exhaust connections under load.

| Concern | Verdict | Detail |
|---|---|---|
| Next.js compatibility | OK | 16.2.0 with Turbopack; App Router throughout; build clean. |
| Node runtime requirement | OK | `instrumentation.ts` correctly guards on `NEXT_RUNTIME === "nodejs"`. `serverExternalPackages` covers typeorm/tsyringe/reflect-metadata/mysql2. |
| Edge runtime | Watch | Middleware runs on the Edge by default and does an HTTP round-trip to `/api/auth/get-session` on nearly every request — one extra invocation per page view. It does not touch TypeORM, so it works; it is a cost and latency issue. |
| In-memory persistence | **Blocker** | `globalThis.__reportStore`. Not shared across instances, lost on every recycle. **The single biggest functional break.** |
| Filesystem writes | OK | None. The only `fs` use is `readFileSync` of `.env` inside the CLI seed script. |
| DB connection pooling | **Blocker** | Production skips the `globalThis` DataSource cache; no `connectionLimit`, no proxy. Use PlanetScale/Vitess-style HTTP access or a pooler, and cache the DataSource in *all* environments with a small pool. |
| Long Gemini calls | **Blocker** | Up to 10s fetch + 30s model = 40s in one server action. No `maxDuration` export anywhere. Hobby's 10s default kills most audits. |
| Scraping timeouts | Watch | Same budget problem; also no body-size cap, so a large page can blow memory. |
| Browser / screenshots | N/A | Not implemented — no Chromium to bundle. |
| PDF generation | N/A | Stub only. |
| SMTP | Watch | Works; handshake-per-request and provider throttling of serverless IPs make an HTTP email API preferable. |
| Environment variables | **Blocker** | `shared/config/env.ts` calls `envSchema.parse()` at import time and marks `DATABASE_URL`, `BETTER_AUTH_SECRET`, all five `SMTP_*`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` as required. Any one missing throws during the build's page-data collection, not at runtime. `ADMIN_*` being required by the app despite only being used by a CLI script is an unnecessary deployment constraint. |
| Middleware | Deprecated | Build warns: *"The 'middleware' file convention is deprecated. Please use 'proxy' instead."* Works for now. |
| Function duration config | **Missing** | No `vercel.json`, no `export const maxDuration`, no `export const runtime` on any route or action module. |
| Static/dynamic rendering | Watch | 14 routes: `/`, `/results`, `/login`, `/signup`, `/admin/login`, `/privacy` and the auth pages are static; `/dashboard`, `/checkout`, `/report/[id]` and the auth API are dynamic. `/results` being static is fine only because it is pure mock content. |
| Build-time DB access | OK | Confirmed: the build completes without a database connection attempt. `AppDataSource` is constructed but not initialized at build time. |
| Native packages / binaries | OK | `bcryptjs` is pure JS (not native `bcrypt`); `mysql2` is pure JS. Nothing needs compilation. |
| Scheduled jobs | None | No cron. Monthly quota resets, expired-session cleanup and expired-verification cleanup will all need one (Vercel Cron is fine). |
| Upload limits | N/A | No uploads. |

### Blocker list, ordered

1. In-memory `ReportStore` → move to the database.
2. DataSource not cached in production + no pool limit → connection exhaustion.
3. No `maxDuration` for a pipeline that can take 40s.
4. Import-time env validation making every variable a build-time requirement (including `ADMIN_*`, which the app never uses).
5. `DB_SYNCHRONIZE` honoured in production, with no migration path as the alternative.
6. Middleware session round-trip on nearly every request — cost and latency.
7. SMTP-in-a-lambda for the email that gates account activation.
8. Deprecated `middleware` convention (non-urgent).

---

## 19. Build Status

Diagnostics run: `tsc --noEmit`, `npm run lint`, `npm run build`. No writes, no migrations, no database mutation.

| Check | Result | Output |
|---|---|---|
| Type check | **PASS** | `npx tsc --noEmit` → exit 0, zero diagnostics. Notable given `strict: true` and that the build ignores type errors anyway. |
| Lint | **BROKEN** | `npm run lint` → exit 127, `sh: 1: eslint: not found`. ESLint is neither installed nor configured; the script is decorative. |
| Production build | **PASS** | `next build` → exit 0. Compiled in 52s, 14 routes generated. |

### Warnings emitted during build

- `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
- `[Better Auth]: Social provider google is missing clientId or clientSecret` — three times, from the workers collecting page data.
- `Skipping validation of types` — the effect of `ignoreBuildErrors`.

### Missing environment variables, by name

Present locally and required by the Zod schema: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

Absent from `.env` and therefore falling back to schema defaults: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (empty string → Google sign-in is non-functional), `GEMINI_FREE_MODEL`, `GEMINI_PREMIUM_MODEL`.

Present but unused by any code: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, all three `STRIPE_*`.

### Broken imports / runtime configuration

None found — every `@services/*`, `@domain/*`, `@application/*` and `@/*` alias in `tsconfig.json` resolves. The one runtime configuration risk is that `env.ts` throws at import time rather than returning a typed error, so a missing variable in production presents as an opaque build or boot failure.

---

## 20. Environment Variables

Names only. **Required** = enforced by the Zod schema in `shared/config/env.ts`, which parses at import time — so "build time" and "runtime" are effectively the same requirement here.

### Database

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `DATABASE_URL` | MySQL connection string for the TypeORM DataSource. | Yes | Yes | Yes | No | **Yes** |
| `DIRECT_URL` | Pooler-bypassing URL; used only by `bin/SeedAdmin.ts`. | Optional | Optional | No | No | **Yes** |
| `DB_SYNCHRONIZE` | TypeORM auto-schema. **Must be false/absent in production.** | Yes (true) | Yes (false) | No | No | No |
| `DB_LOGGING` | SQL query logging. | Optional | Optional | No | No | No |

### Auth

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `BETTER_AUTH_SECRET` | Session/token signing key. | Yes | Yes | Yes | No | **Yes** |
| `BETTER_AUTH_URL` | Base URL for callbacks and email links. | Yes | Yes | Yes | No | No |
| `ADMIN_EMAIL` | Seed-script admin account. *Required by the app schema despite being CLI-only.* | Yes | Yes* | Yes* | No | No |
| `ADMIN_PASSWORD` | Seed-script admin password (min 8). Same over-requirement. | Yes | Yes* | Yes* | No | **Yes** |

### Google OAuth

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client id. Defaults to `""` → provider disabled. | Optional | If OAuth | No | No | No |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret. Defaults to `""`. | Optional | If OAuth | No | No | **Yes** |

### Gemini

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `GEMINI_API_KEY` | Sent as `X-goog-api-key`. Optional in schema, but the roast fails without it. | Yes | Yes | No | No | **Yes** |
| `GEMINI_FREE_MODEL` | Free-tier model. Default `gemini-flash-lite-latest`. | Optional | Optional | No | No | No |
| `GEMINI_PREMIUM_MODEL` | Paid-tier model. Default `gemini-3.6-flash`. | Optional | Optional | No | No | No |

### Email

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `SMTP_HOST` | SMTP server. | Yes | Yes | Yes | No | No |
| `SMTP_PORT` | Port; `465` switches on implicit TLS. | Yes | Yes | Yes | No | No |
| `SMTP_USER` | SMTP username. | Yes | Yes | Yes | No | **Yes** |
| `SMTP_PASS` | SMTP password. | Yes | Yes | Yes | No | **Yes** |
| `SMTP_FROM` | From address on outbound mail. | Yes | Yes | Yes | No | No |

### Payments — all stale

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `STRIPE_SECRET_KEY` | Read by `getStripe()`, which nothing calls. **Stale.** | No | No | No | No | **Yes** |
| `STRIPE_WEBHOOK_SECRET` | Declared; no handler reads it. **Stale.** | No | No | No | No | **Yes** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Declared; Stripe.js is not installed. **Stale.** | No | No | No | **Yes** | No |

### Application

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Auth client base URL and `trustedOrigins` entry. Must be set per environment or preview deploys break. | Yes | Yes | Yes | **Yes** | No |
| `NODE_ENV` | Set by the platform; gates log redaction and the DataSource cache. | Auto | Auto | Auto | No | No |

### Other / stale

| Name | Purpose | Local | Prod | Build | Client | Sensitive |
|---|---|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | Declared in schema and `.env.example`. Referenced by no code. **Stale.** | No | No | No | No | **Yes** |
| `OPENAI_API_KEY` | Same. **Stale.** | No | No | No | No | **Yes** |

\* `ADMIN_EMAIL`/`ADMIN_PASSWORD` are required by the schema, not by any application code path. Moving them out of `env.ts` into the seed script removes two secrets from your production environment.

---

## 21. MVP Readiness Matrix

| Capability | Status | Production Ready? | Main Problem |
|---|---|---|---|
| Homepage | FUNCTIONAL | Yes | Pricing copy contradicts the dashboard and admin. |
| URL submission | FUNCTIONAL | No | Validation accepts localhost and private IPs; no auth or quota gate. |
| Page fetching | PARTIAL | No | SSRF; unbounded body; regex extraction fails on JS-rendered pages. |
| Gemini audit | FUNCTIONAL | Nearly | No retries, no token cap, no cost control, 40s worst case with no `maxDuration`. |
| Report parsing | FUNCTIONAL | Yes | Best-engineered part of the pipeline. `date` should be a timestamp, not a display string. |
| Report persistence | MOCK | No | In-memory Map; lost across instances and restarts. |
| Authentication | FUNCTIONAL | Nearly | Remove demo credential buttons; enable rate limiting. |
| Email verification | FUNCTIONAL | Nearly | SMTP-in-lambda; a send failure fails the signup. |
| Google OAuth | PARTIAL | No | No credentials configured; buttons visible and non-functional. |
| Free audit limit | MISSING | No | UI string only; no counter, no gate, works unauthenticated. |
| Payments | MOCK | No | Fake card form that mutates React state. No provider integration. |
| Subscription state | MISSING | No | One unconstrained `package` column; no status, period, or external ids. |
| Webhooks | MISSING | No | No endpoint exists; the secret env var is unread. |
| Admin | MOCK | No | Real auth gate, entirely fabricated data behind it. |
| PDF | MOCK | No | Returns a fake buffer; the button has no handler. |
| Vercel deployment | PARTIAL | No | Builds and deploys, then breaks on reports, DB connections and timeouts. |

---

## 22. MVP Scope Recommendation

**The shape.** *Free:* one audit, requiring an account, enforced server-side by a row count. *Paid:* one plan, one price, bought through a hosted MoR checkout, granting the premium model and persistent reports. Everything else waits.

Concretely, that means adding two tables (`reports`, and either `usage` or a counter on `users`), one webhook route, one checkout-session action, and a real server-side gate at the top of `roastUrlAction`. Nothing else on this list is required to charge a stranger money.

| Feature | Call | Why |
|---|---|---|
| Email/password auth | **KEEP FOR MVP** | Works, is the anchor for usage limits and paid state. |
| Email verification | **KEEP** (fix transport) | Without it, "1 free audit per account" is defeated by disposable signups. Move to an HTTP email API. |
| Password reset | **KEEP FOR MVP** | Already works; support burden without it is immediate. |
| URL auditing | **FIX FOR MVP** | Add SSRF guards, body cap, `maxDuration`, and a retry on 429/503. |
| Report persistence | **FIX FOR MVP** — priority | New `reports` entity with `userId`, JSON payload, timestamps; replace `ReportStore` behind its existing two-function interface. |
| Usage enforcement | **FIX FOR MVP** — priority | Requires auth on the roast action. Count rows in `reports` per user per period; block before fetching. |
| Payments | **FIX FOR MVP** — priority | Lemon Squeezy or Paddle hosted checkout + signed webhook. Delete Stripe. |
| Google OAuth | **FIX or REMOVE** | Cheap to finish (add two env vars, register the app) and it lifts signup conversion — but a visible button that does nothing is worse than none. Decide, don't ship as-is. |
| Admin dashboard | **REMOVE/DISABLE** | Every number is invented. At launch scale, `SELECT` in a SQL client beats a fake dashboard. Keep the `isAdmin` flag and the middleware gate; drop the four mock tabs. |
| Fake checkout & payment dialog | **REMOVE** | Collecting real card numbers into React state is a liability, not a placeholder. |
| `/results` mock page + `constants/mock-data.ts` | **REMOVE** | Dead route rendering invented data for a competitor-facing product. Its removal also unblocks a truthful dashboard history. |
| Mock audit history & billing history | **REMOVE** | Replace history with a real query once `reports` exists; delete billing history until invoices are real. |
| PDF export | **POSTPONE** | Remove the dead button. A print stylesheet is a one-hour substitute if a customer asks. |
| White labeling | **POSTPONE** | Depends on PDF, which doesn't exist. |
| Agency tier | **POSTPONE** | Every differentiator it advertises is unbuilt. Selling one plan is also a cleaner pricing test. |
| API access | **POSTPONE** | No API, no keys, no rate limiting. Large project sold as a bullet point. |
| Screenshot auditing | **POSTPONE** (first thing after launch) | The strongest real differentiator and the honest fix for grading "Visual Design" from text — but not needed to take a first payment. |
| Roast sharing | **POSTPONE** | Becomes possible the moment reports persist; it is the cheapest growth feature at that point. Needs an OG image and a deliberate public/private choice. |
| Multiple AI models | **KEEP** as-is | The free/premium tier split is two lines and is already the paid product's mechanism. Don't add Anthropic/OpenAI — remove those unused keys. |
| Complex analytics | **POSTPONE** | Vercel Analytics is already mounted and is enough to validate the funnel. |
| Account lockout | **FIX or REMOVE** | Either write the counters or delete the hook and enable Better Auth's rate limiter. Leaving dead security code is worse than either. |

---

## 23. Suggested Implementation Order

Dependency-ordered. Each phase leaves the app deployable.

### Phase 0 — Clean the tree and commit the refactor

- **Objective:** one architecture, one source of truth, a green lint run. Nothing behavioural.
- **Files:** commit the pending deletions (`prisma/`, `lib/stripe.ts`, `lib/llm/`, `lib/pdf/`, `lib/email/`, `lib/prisma.ts`) and the 12 untracked files (`src/`, `app/actions/roast.actions.ts`, `schemas/roast.ts`, `instrumentation.ts`, `bin/`). Add an ESLint config + dependency. Remove `ignoreBuildErrors`. Delete the demo credential block from `login-form.tsx`. Decide the pricing model and collapse `constants/plans.ts` to one definition.
- **Depends on:** nothing.
- **Risks:** low. The main risk is committing `.env` by accident — it is gitignored; keep it that way.
- **Done when:** `git status` is clean, `npm run lint` and `tsc --noEmit` both pass, and one price appears in exactly one file.

### Phase 1 — Report persistence + migrations

- **Objective:** reports survive restarts, belong to users, and have working permanent URLs.
- **Files:** new `src/Infrastructure/Database/Models/ReportModel.ts` (`id` uuid PK, `userId` nullable FK, `url`, `tier`, `score`, `payload` JSON, `createdAt`); `ReportRepository` + `IReportRepository`; rewrite `ReportStore.ts` to async DB calls keeping `saveReport`/`getReport`; `await` them in `roast.actions.ts` and `app/report/[id]/page.tsx`. Add a TypeORM migrations directory, a `migration:generate`/`migration:run` script, generate the baseline for the existing four tables, and hard-disable `synchronize` in production.
- **Depends on:** Phase 0.
- **Risks:** baselining migrations against a database that `synchronize` already created. Do it on a scratch database first. Also fix the DataSource production cache and set an explicit small `connectionLimit` here.
- **Done when:** a report generated before a redeploy still loads after it, and the dashboard history is a real query.

### Phase 2 — Usage enforcement + fetcher hardening

- **Objective:** an audit costs an account and counts against a quota; the fetcher stops being an SSRF.
- **Files:** `app/actions/roast.actions.ts` — require a session, resolve the plan's limit, count this period's reports, return a typed "limit reached" result *before* fetching. `PageFetcher.ts` — scheme allow-list, DNS + private-range checks, manual redirects, streamed 256 KB cap. `LlmClient.ts` — `maxOutputTokens` and one retry on 429/503. Add `export const maxDuration`. Update `roast-tab.tsx` and `subscription-tab.tsx` to render real counts.
- **Depends on:** Phase 1 (the counter is a query over `reports`).
- **Risks:** requiring auth on the landing-page roast changes the funnel — decide deliberately whether guests get zero audits or one per verified email. This is a product decision that determines the whole acquisition loop; make it before writing the gate.
- **Done when:** a free user is blocked on their second audit, an anonymous caller is refused, and a request for `http://169.254.169.254/` is rejected before any socket opens.

### Phase 3 — Payments via a merchant of record

- **Objective:** a stranger can pay, and the server can prove it.
- **Files:** delete `stripe`, `StripeClient.ts`, the `STRIPE_*` vars, `checkout-page.tsx` and `payment-dialog.tsx`. Add a checkout server action creating a hosted session; new `app/api/webhooks/[provider]/route.ts` with `export const runtime = "nodejs"`, raw-body signature verification, and idempotent event handling. New `SubscriptionModel` (`userId`, `provider`, `customerId`, `subscriptionId`, `status`, `currentPeriodEnd`) — replace the free-text `users.package` as the authority. Link the provider's customer portal instead of building cancellation UI.
- **Depends on:** Phases 1–2, and a settled answer on one-time vs recurring.
- **Risks:** webhook signature verification needs the raw body — the classic Next.js footgun. Test replay and out-of-order delivery. Sandbox-test cancellation and failed renewal before launch, not after.
- **Done when:** a sandbox purchase flips plan state through the webhook alone (never from the browser), and a cancellation flips it back at period end.

### Phase 4 — Real paywall behaviour

- **Objective:** paid content is actually withheld from free users.
- **Files:** `roast.actions.ts` — split the return so free responses omit `actionFixes` and `elementGrades` instead of shipping them under a blur. `results-preview.tsx`, `report-view.tsx`, `report-sections.tsx`, `action-items.tsx` — render from what the server sent. `app/report/[id]/page.tsx` — ownership check.
- **Depends on:** Phase 3.
- **Risks:** low, but easy to half-do: any field still present in the payload is not gated, whatever the CSS says.
- **Done when:** the free response body, inspected in devtools, contains no premium field.

### Phase 5 — Vercel hardening

- **Objective:** correct under cold starts, concurrency and timeouts.
- **Files:** `DBConnection.ts` (cache in all environments, pool limit, SSL); `shared/config/env.ts` (move `ADMIN_*` out; make required-ness explicit per environment); `EmailService.ts` (HTTP email API behind the same signature); `middleware.ts` (migrate to the `proxy` convention; reduce the matcher so it stops running on every asset path); add `vercel.json` and a cron for quota reset and session/verification cleanup.
- **Depends on:** Phases 1–4.
- **Risks:** connection limits only show up under real concurrency — load-test with more parallel requests than your MySQL `max_connections`.
- **Done when:** a burst of concurrent audits completes without connection errors or timeouts on a preview deployment.

### Phase 6 — Production deployment

- **Objective:** live, monitored, chargeable.
- **Files:** environment variables set per Vercel environment (production/preview/development), `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` matching the real domain, `DB_SYNCHRONIZE` absent, migrations run against production, admin seeded once with a strong password and the demo/unlimited accounts *not* created, live payment keys, webhook endpoint registered with the provider.
- **Depends on:** Phase 5.
- **Risks:** running the seed script unmodified in production is the single most dangerous step in this plan — it creates two known-password accounts, one on the Agency plan. Gate it on `NODE_ENV` or split admin seeding into its own script.
- **Done when:** a real card, on the real domain, produces a persisted premium report and a webhook-confirmed paid state.

### Phase 7 — Post-launch

- **Objective:** differentiate, then grow.
- **Files:** screenshot service + multimodal Gemini input (extends `LlmClient`, `roastResultSchema`, and adds blob storage); public share links with OG images; a real admin backed by queries; PDF; then Agency features.
- **Depends on:** revenue existing.
- **Risks:** building any of this before Phase 6 is the failure mode this codebase is currently in — a great deal of surface, no working till.
- **Done when:** paying customers exist and are telling you which of these to build.

---

## 24. Critical Files

Read these before changing anything. Ordered by how much damage a careless edit would do.

### File
`app/actions/roast.actions.ts`

Purpose: the entire audit pipeline as one server action.

Why it matters: every launch blocker except payments passes through this file — usage enforcement, auth gating, SSRF entry point, model tiering, report persistence. It is also untracked; commit it before touching it.

Important functions: `roastUrlAction()`, `PAID_PLANS`

### File
`src/Infrastructure/Services/ReportStore.ts`

Purpose: in-memory report cache on `globalThis`.

Why it matters: the reason permanent report URLs don't work. Its two-function interface is the right seam to swap for a repository — the change is contained.

Important functions: `saveReport()`, `getReport()`, `generateReportId()`, `StoredReport`

### File
`src/Infrastructure/Services/PageFetcher.ts`

Purpose: fetches and text-extracts the target page.

Why it matters: the SSRF. Also the ceiling on audit quality, since JS-rendered pages yield almost nothing.

Important functions: `fetchPageText()`, `extractText()`, `MAX_TEXT_LENGTH`, `FETCH_TIMEOUT_MS`

### File
`src/Infrastructure/Database/DBConnection.ts`

Purpose: the single TypeORM DataSource.

Why it matters: two production hazards in 25 lines — the `NODE_ENV !== "production"` cache guard, and `synchronize` from raw env. Every serverless DB problem starts here.

Important functions: `buildDataSource()`, `AppDataSource`

### File
`lib/auth.ts`

Purpose: Better Auth configuration — the whole auth policy.

Why it matters: password hashing, verification requirements, email sending, OAuth, additional user fields (`isAdmin`, `package`) and the non-functional lockout hook all live here. Changing `additionalFields` changes the session shape everything else reads.

Important functions: `auth`, `emailAndPassword.password.hash/verify`, `hooks.before`

### File
`src/Infrastructure/Auth/TypeOrmAdapter.ts`

Purpose: custom Better Auth ↔ TypeORM adapter.

Why it matters: every auth write goes through it. Non-obvious, load-bearing, and the place any auth-persistence bug will actually be. Note `transaction: false` — auth operations are not atomic.

Important functions: `typeOrmAdapter()`, `getRepository()`, `create/findOne/findMany/update/delete/count`

### File
`shared/config/env.ts`

Purpose: Zod-validated environment, parsed at import time.

Why it matters: decides what your Vercel deployment must define to build at all. Currently over-requires `ADMIN_*` and under-requires `GEMINI_API_KEY`.

Important functions: `envSchema`, `env`

### File
`middleware.ts`

Purpose: route protection for public/protected/admin paths.

Why it matters: the only place authorization is centralized. `/report/[id]` is deliberately absent from its lists — decide that consciously. Runs on nearly every request and costs an extra invocation each time.

Important functions: `PUBLIC_ROUTES`, `PROTECTED_ROUTES`, `ADMIN_ROUTES`, `config.matcher`

### File
`schemas/roast.ts`

Purpose: Zod contract for the Gemini response.

Why it matters: the boundary that makes untrusted model output safe to render. Any change to the report shape starts here and must stay in step with the prompt. Untracked.

Important functions: `roastResultSchema`, `RoastResult`

### File
`src/Infrastructure/Services/LlmPrompts.ts`

Purpose: the single roast prompt.

Why it matters: it *is* the product. Also where prompt-injection defence and any screenshot/multimodal work will land. Must match `roastResultSchema` exactly or every audit fails validation.

Important functions: `buildRoastPrompt()`

### File
`src/Infrastructure/Services/LlmClient.ts`

Purpose: Gemini REST call and tier→model mapping.

Why it matters: where retries, token caps and cost controls belong. No SDK, so the request body is yours to extend for vision input.

Important functions: `generateRoastJson()`, `modelForTier()`, `ModelTier`

### File
`src/Infrastructure/Database/Models/UserModel.ts`

Purpose: the user table.

Why it matters: holds the only paid-state field in the schema (`package`) and the two lockout columns nothing writes. Any subscription or usage work starts by deciding what belongs here versus in new tables.

Important fields: `package`, `isAdmin`, `failedPasswordAttempts`, `lockedUntil`

### File
`components/features/auth/login-form.tsx`

Purpose: login UI.

Why it matters: contains the hardcoded admin/demo/unlimited credentials described in §17. Read it before the next deploy, not after.

Important functions: `setDemoUser()` (lines 46–53), the demo button block (166–181)

### File
`bin/SeedAdmin.ts`

Purpose: seeds admin, demo, and an "unlimited" paid account.

Why it matters: the only code that can grant `isAdmin` or set `package`. Running it unmodified in production creates two known-password accounts, one on the Agency plan. Untracked.

Important functions: `seedUser()`, `DEMO_USER_*`, `TEST_UNLIMITED_*`, `loadEnv()`

### File
`constants/plans.ts`

Purpose: three separate, disagreeing definitions of the same three plans.

Why it matters: must become one before any billing code is written. Also holds `FREE_AUDITS_USED = 2`, the fake usage number rendered to every user.

Important exports: `SUBSCRIPTION_PLANS`, `LANDING_PRICING_PLANS`, `ADMIN_PLAN_CONFIGS`, `FREE_AUDIT_LIMIT`

### File
`components/features/checkout/checkout-page.tsx`

Purpose: fake checkout that collects real card details.

Why it matters: delete it. Read it first only to confirm nothing else depends on its props.

Important functions: `handleSubmit()`, `isFormValid`

### File
`components/features/dashboard/dashboard-shell.tsx`

Purpose: the whole authenticated app in one client component.

Why it matters: holds the fake upgrade handler, the mock stat arrays, the `localStorage` user cache, and the tab routing. Most "make the dashboard real" work touches this file.

Important functions: `handleRoastClick()`, `handlePaymentSuccess()`, `adminStats`, `userStats`

### File
`app/report/[id]/page.tsx`

Purpose: full report route.

Why it matters: where persistence, ownership checks and the free/paid split all converge. Currently a synchronous Map lookup with no auth.

Important functions: `ReportPage()`

### File
`instrumentation.ts`

Purpose: boots the DataSource and DI container on the Node runtime.

Why it matters: startup order for the entire backend. Misunderstanding it produces "connection not initialized" errors that look like adapter bugs. Untracked.

Important functions: `register()`

### File
`next.config.mjs`

Purpose: build configuration.

Why it matters: `serverExternalPackages` is what makes TypeORM work at all here — don't remove it. `ignoreBuildErrors` should go.

Important settings: `serverExternalPackages`, `typescript.ignoreBuildErrors`

### File
`src/Infrastructure/Services/EmailService.ts`

Purpose: Nodemailer transport, HTML wrapper, log masking.

Why it matters: signup depends on it succeeding. The clean `sendEmail(to, subject, html)` signature makes swapping to an HTTP provider a one-file change.

Important functions: `sendEmail()`, `wrapEmailHtml()`, `maskEmail()`

### File
`src/Infrastructure/DIContainer/Resolver.ts`

Purpose: eagerly resolves `accountService` and `userRepository` at import.

Why it matters: import-time resolution means import order matters; anything importing this before the container registers will fail confusingly.

Important exports: `accountService`, `userRepository`

### File
`src/Infrastructure/Database/Repositories/BaseRepository.ts`

Purpose: generic CRUD base for all repositories.

Why it matters: the template for the `ReportRepository` you are about to write. Note it resolves the repository per call via `AppDataSource.getRepository`, so it depends on initialization having happened.

Important functions: `create()`, `fetch()`, `fetchAll()`, `edit()`, `remove()`

### File
`constants/mock-data.ts`

Purpose: 164 lines of invented users, audits, invoices and roast content.

Why it matters: imported by six live components. Deleting it is the fastest way to find every screen that is currently lying.

Important exports: `MOCK_AUDIT_HISTORY`, `ADMIN_USERS_FULL`, `MOCK_BILLING_HISTORY`, `ROAST_LINES`

---

## 25. Git / Repository State

- **Current branch:** `master`, tracking `origin/master`. Remote branches: `auth-db-operations`, `code-optimization`, `code-rule-setup`, `show-users`.
- **Latest commit:** `c8aab16` — "Merge pull request #3 from Bukhari-CT/code-rule-setup".
- **Working tree:** heavily dirty. **~45 modified** files, **12 deleted**, **12 untracked** paths. None of it is committed.

> **The most important repository fact:** the working tree contains a substantially different application from HEAD. HEAD is the Prisma/Postgres-flavoured version with `lib/`-based services; the working tree is the TypeORM/MySQL version with the `src/` layered architecture. The roast pipeline — the product's core feature — exists only as untracked files. A `git checkout .`, a stash mishap, or a fresh clone loses it. **Commit before anything else.**

**Untracked (never committed):** `src/` (the entire layered architecture, 30 files) · `app/actions/roast.actions.ts` · `schemas/roast.ts` · `instrumentation.ts` · `bin/SeedAdmin.ts` · `containers/` · `components/Settings/` · `hooks/useSetPassword.ts` · `lib/settingsApi.ts` · `app/privacy/` · `PROJECT_OVERVIEW.md` · `project_check.md`.

**Deleted but not committed:** `prisma/schema.prisma`, `prisma/migrations/20260405080023_init/migration.sql`, `prisma/migrations/migration_lock.toml`, `prisma/seed-admin.ts`, `lib/prisma.ts`, `lib/stripe.ts`, `lib/llm/client.ts`, `lib/llm/prompts.ts`, `lib/pdf/export.ts`, `lib/email.ts`, `lib/email/index.ts`, `lib/email/templates/receipt.tsx`, plus `components/auth/FormField.tsx` and `PasswordField.tsx`.

**Ignored config:** `.gitignore` covers `.env` and `.env*.local` (line 29), `/node_modules`, `/.next/`, `.vercel`, `*.pem`, `*.tsbuildinfo`. `.env.example` is tracked, as intended.

**Committed secrets: none found.** `git log --all -- .env` returns nothing — `.env` has never been committed on any branch, and the only env-shaped file ever added to the repository is `.env.example`, which contains placeholders.

One item deserves flagging without being a leak: `.env.example` ships `ADMIN_PASSWORD=change-me-locally`, and that exact literal appears as the admin quick-fill value in `components/features/auth/login-form.tsx`. It is a placeholder, not a secret — but it is a placeholder that a seeded production database may be using. Treat it as a credential to rotate, not as a committed secret.

---

## 26. Final Launch Blockers

### Must fix — cannot launch without

1. **Commit the working tree.** The product's core feature is untracked. Everything else is at risk until this is done.
2. **Persist reports in the database.** Permanent URLs, audit history, and the paywall all depend on it.
3. **Enforce the free limit server-side, with auth.** Requires reports to be persisted; protects both the upgrade incentive and the Gemini bill.
4. **Build a real payment path with a webhook.** Hosted MoR checkout, signed webhook, subscription state in the DB. Never trust the browser for paid state.
5. **Delete both fake payment forms.** Collecting card numbers into React state is a liability with no upside.
6. **Remove the demo credential buttons and never seed demo accounts in production.** One-click admin from the public login page.
7. **Fix the SSRF in `PageFetcher`.** Scheme allow-list, private-range blocking, manual redirects, body cap.
8. **Adopt migrations and hard-disable `DB_SYNCHRONIZE` in production.** Otherwise you have either no schema management or a destructive one.
9. **Fix the DataSource production cache and set a pool limit.** Connection exhaustion is a certainty, not a risk.
10. **Set `maxDuration` for the roast path.** A 40s worst case against a 10s default kills real audits.

### Must decide — product choices that block engineering

- **One-time, subscription, or credits?** Four surfaces currently claim three different answers. Billing cannot be written until this is one sentence.
- **Do guests get a free audit at all?** Requiring an account makes the limit enforceable; allowing guests keeps the viral loop. This decision shapes Phase 2 and the whole funnel.
- **How many plans at launch?** Recommendation: one paid plan. Agency advertises three features that do not exist.
- **Are reports public or private by default?** Determines whether sharing is a feature or an IDOR.

### Should fix soon after — not launch-blocking

- Delete or finish the account lockout; enable Better Auth's rate limiter either way.
- Finish or hide Google OAuth — a dead button on the signup page costs conversions.
- Move email to an HTTP API so signup doesn't fail on an SMTP hiccup.
- Remove `ignoreBuildErrors`, install ESLint, delete `constants/mock-data.ts` and the stale Anthropic/OpenAI/Stripe env vars.
- Delete the dead "Download PDF" button and the PDF stub.
- Prompt-injection hardening and a retry on Gemini 429/503.
- Add screenshots — the honest fix for grading visual design from text, and the clearest reason to pay.

---

> **The one-line assessment:** PageRoastAI has a working AI audit and a genuinely solid authentication system wrapped in a convincing but hollow product shell. The distance to a chargeable MVP is not large — roughly four focused pieces of work (persist, enforce, charge, harden) — but none of that work has been started, and the polish of the mock UI makes the gap look smaller than it is.

---

*Read-only audit — no files were modified, no migrations created, no packages installed.*
*Diagnostics run: `tsc --noEmit` (pass) · `npm run lint` (exit 127, eslint not installed) · `next build` (pass, 52s).*
*Environment variables are reported by name only; no values, keys, or credentials appear in this document.*
