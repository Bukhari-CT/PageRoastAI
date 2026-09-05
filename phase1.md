We are continuing the PageRoastAI MVP implementation.

Phase 0 has been completed successfully.

This is PHASE 1 ONLY.

Do NOT implement payments, Lemon Squeezy, subscription webhooks, usage limits, screenshots, public sharing, PDF generation, or Vercel deployment during this phase.

# PHASE 1 OBJECTIVE

Make PageRoastAI's database layer production-safe enough for the upcoming MVP and replace the ephemeral in-memory report store with durable MySQL-backed report persistence.

When this phase is complete:

1. A generated report belongs to an authenticated user.
2. A report is persisted in MySQL.
3. `/report/[id]` reads the report from MySQL.
4. Reports survive server restarts and Vercel cold starts.
5. Report history can be queried by user.
6. TypeORM migrations exist.
7. Production must NEVER use `synchronize: true`.
8. The TypeORM DataSource must be safer for Vercel/serverless MySQL usage.
9. No usage enforcement or payment logic should be implemented yet.

Preserve the existing Better Auth + TypeORM architecture.

# IMPORTANT CURRENT STATE

Phase 0 established:

FREE:

- 1 audit
- free Gemini model

PRO:

- $19/month
- 30 audits/month
- premium Gemini model

These limits are CONFIGURATION ONLY right now.

Do NOT enforce them during Phase 1.

Current reports are still stored in:

`src/Infrastructure/Services/ReportStore.ts`

using an in-memory `globalThis` Map.

Current DB entities are auth-only.

Current TypeORM schema management still has:

`DB_SYNCHRONIZE`

and the audit found this is still honored in production.

The DataSource also needs production/serverless hardening.

# SAFETY RULES

Before modifying anything:

1. Run `git status`.
2. Confirm the Phase 0 baseline has been committed.
3. If the worktree is unexpectedly dirty, inspect it before continuing.
4. NEVER print secrets.
5. NEVER display the value of `DATABASE_URL`.
6. NEVER run destructive production SQL.
7. NEVER run a migration against production.
8. NEVER use `synchronize: true` against production.
9. NEVER drop existing auth tables.
10. NEVER reset or recreate the developer database without explicit permission.
11. Do not automatically push commits.
12. Do not rewrite the working Better Auth TypeORM adapter.

# TASK 1 — INSPECT CURRENT DATABASE ARCHITECTURE

Before changing code, inspect:

- `src/Infrastructure/Database/DBConnection.ts`
- database models
- repositories
- BaseRepository
- domain repository conventions
- DI registration if relevant
- `instrumentation.ts`
- Better Auth adapter
- current local schema assumptions
- existing scripts in `package.json`

Determine the smallest architecture-consistent way to add reports.

Avoid introducing a second ORM or alternate DB abstraction.

Continue using:

TypeORM + MySQL.

# TASK 2 — CREATE REPORT DOMAIN MODEL

Add a proper report/audit representation consistent with the existing layered architecture.

Preferred structure should follow the repository's existing Domain/Application/Infrastructure conventions.

At minimum the persisted report must contain:

- `id`
- `userId`
- `url`
- `tier`
- `score`
- `payload`
- `createdAt`
- `updatedAt` if consistent with existing entities

Recommended types:

### id

UUID/string primary key.

Continue using cryptographically strong generated IDs.

### userId

Foreign key to the existing user.

For the MVP every newly generated report should eventually belong to an authenticated user.

However:

DO NOT break old development/test report handling unnecessarily.

If nullable `userId` is useful specifically for migration compatibility, explain why.

The final application behavior for newly generated MVP reports should associate them with a real user.

### url

Store the normalized audited URL.

Choose a reasonable maximum length compatible with MySQL.

### tier

Store the tier/model entitlement used for that audit.

Use a constrained application-level value such as:

`free | pro`

Do not reintroduce Agency.

Do not blindly trust arbitrary strings.

### score

Store the top-level score separately.

This allows dashboard queries without parsing JSON.

### payload

Store the complete validated `RoastResult`.

Use the appropriate MySQL JSON column representation if supported by the project's DB target.

Do not duplicate every report field into separate columns.

The validated JSON should remain the canonical detailed report body.

### timestamps

Use actual database timestamps.

Do NOT store:

`"Sep 5, 2026"`

as the persisted date.

Formatting belongs in the UI.

# TASK 3 — FOREIGN KEY AND DELETION POLICY

Choose and document the relationship between User and Report.

For MVP, preferred behavior:

User
1 → many
Reports

Consider what should happen if a user account is deleted.

Prefer a deliberate foreign-key behavior.

Possible acceptable choices:

- CASCADE reports when a user is deleted

or

- SET NULL if retaining anonymized report history is genuinely needed

For a small MVP, CASCADE is probably simpler.

Use the architecture and privacy expectations to make the final decision and explain it.

# TASK 4 — REPORT REPOSITORY

Create an appropriate repository interface and infrastructure implementation consistent with existing code.

We need operations approximately equivalent to:

- save/create report
- find report by id
- find reports by user
- count reports by user within a date range

IMPORTANT:

The last count operation is required because Phase 2 will enforce:

Free:
1 audit

Pro:
30 audits per billing/month period

Do NOT implement quota enforcement now.

Only create a clean repository capability so Phase 2 does not need to hack around persistence.

Provide pagination support for user history if reasonably simple.

For example:

`findByUserId(userId, { limit, offset })`

Do not over-engineer cursor pagination yet.

# TASK 5 — REPLACE THE IN-MEMORY REPORT STORE

The current:

`src/Infrastructure/Services/ReportStore.ts`

is an in-memory Map.

Replace the persistence mechanism with database-backed operations.

Prefer preserving a small seam/API so callers do not need unnecessary rewrites.

Current concepts such as:

- `saveReport`
- `getReport`
- `generateReportId`

may remain if useful, but they should use the repository/database.

All DB operations will now be async.

Update callers accordingly.

Important callers include:

- `app/actions/roast.actions.ts`
- `app/report/[id]/page.tsx`

Search for every importer before changing signatures.

After Phase 1:

there must be NO application report persistence using:

- `Map`
- `globalThis.__reportStore`
- process memory
- filesystem JSON

Search to confirm.

# TASK 6 — ASSOCIATE REPORTS WITH AUTHENTICATED USERS

The audit pipeline currently reads the Better Auth session mainly to choose the model tier.

For Phase 1:

when an authenticated user generates a report, persist:

`userId = session.user.id`

Do NOT yet implement:

- blocking anonymous users
- free quota checking
- paid subscription verification

Those belong to Phase 2/3.

However, the persistence API must already support ownership.

If the landing page currently allows anonymous roasting and Phase 1 would otherwise break that behavior, use the safest temporary compatibility approach and clearly document it.

Do NOT build complex guest-account tracking.

Phase 2 will make authentication required before audits.

# TASK 7 — REPORT AUTHORIZATION

The product decision is:

Reports are PRIVATE by default for MVP.

Update:

`app/report/[id]/page.tsx`

so that persisted reports are not freely visible merely because someone knows the UUID.

Preferred behavior for authenticated reports:

1. Read current session.
2. Load report.
3. Verify report.userId matches session.user.id.
4. Admin access may be permitted if the existing `isAdmin` system makes this straightforward.
5. Otherwise return a normal not-found/unauthorized experience without leaking report existence.

Avoid returning:

"Report exists but belongs to another user."

Prefer a generic not-found style result.

If temporary legacy/anonymous records exist, document their handling explicitly.

Do not implement public sharing.

# TASK 8 — REAL DASHBOARD AUDIT HISTORY

Phase 0 intentionally replaced fake audit history with an empty state.

Now connect dashboard history to real persisted reports.

Keep this SIMPLE.

Show approximately:

- audited URL
- score
- date
- plan/tier if useful
- View Report

Do not create complex filters or analytics.

Do not fabricate information.

If user has zero reports:

show the existing honest empty state.

If there are reports:

load them from the database.

Prefer server-side loading rather than fetching a second client API unless the current architecture strongly favors otherwise.

Limit initial history to something reasonable such as the most recent 10 or 20 reports.

# TASK 9 — TYPEORM MIGRATIONS

The repository currently has no TypeORM migration system.

Add a proper migration setup.

We need scripts equivalent to:

- migration generate
- migration create
- migration run
- migration revert if safe/appropriate
- optionally migration show

Use a dedicated TypeORM CLI DataSource file if that is cleaner than using the application DataSource directly.

IMPORTANT:

The application database already has four auth tables created historically via TypeORM synchronize.

Do NOT create a migration that blindly tries to recreate existing production/development tables.

We need a safe baseline strategy.

# BASELINE MIGRATION STRATEGY

Inspect the current database/entity state and choose a safe approach.

Preferred goal:

A fresh empty database should eventually be creatable entirely from migrations.

An existing development database created through synchronize must also be adoptable without destructive recreation.

Possible strategy:

1. Create an initial/baseline migration representing existing:
   - users
   - accounts
   - sessions
   - verifications

2. Add the new reports migration after that.

3. For the EXISTING development DB, mark/baseline appropriately rather than rerunning table creation.

DO NOT automatically manipulate migration history unless clearly safe.

If applying a true baseline to the existing DB requires manual SQL or marking a migration as applied, STOP and explain the exact safe command/process instead of guessing.

The Phase 1 implementation should make the migration files correct.

It does NOT need to mutate the existing database automatically if doing so could destroy data.

# TASK 10 — REMOVE OBSOLETE USER COLUMNS IF SAFE

Phase 0 identified these as orphaned:

- `failedPasswordAttempts`
- `lockedUntil`
- `resetToken`
- `resetTokenExpiresAt`

Before removing them:

verify against the entire repository and Better Auth configuration.

If truly unused:

include their removal in an appropriate migration.

But only if doing so is clearly safe.

If there is uncertainty about existing production/development data, leave them for a later cleanup and report why.

This task is OPTIONAL.

Do not let it delay report persistence.

# TASK 11 — HARD-DISABLE SYNCHRONIZE IN PRODUCTION

This is mandatory.

Current code honors:

`DB_SYNCHRONIZE=true`

even in production.

Change database configuration so:

if:

`NODE_ENV === "production"`

then:

`synchronize` is ALWAYS false

regardless of environment-variable value.

Development may continue allowing explicit synchronize temporarily if useful, although once migrations work the preferred path should be migrations everywhere.

Do not silently allow production schema mutation.

If `DB_SYNCHRONIZE=true` is supplied in production:

either:

- ignore it safely and log a warning without secrets

or

- fail fast with a clear configuration error

Choose whichever is safer for this project and explain the choice.

# TASK 12 — VERCEL/SERVERLESS DATASOURCE HARDENING

Fix the DataSource production caching bug identified in the audit.

The existing code caches the DataSource only outside production.

That is backwards for serverless reuse.

Implement safe module/global reuse for BOTH development and production instances.

Avoid creating a new TypeORM connection pool repeatedly inside the same warm Vercel instance.

Also configure a conservative MySQL pool.

Do not assume unlimited DB connections.

Use a small configurable limit such as:

`DB_CONNECTION_LIMIT`

with a safe default appropriate for serverless, perhaps 2–5.

Choose the exact default deliberately.

Add related config if useful:

- connect timeout
- acquire timeout where supported
- queue behavior if appropriate

Avoid passing unsupported mysql2/TypeORM settings.

Do not invent config fields.

Check actual library APIs/types.

# TASK 13 — DATABASE SSL

Inspect the intended `DATABASE_URL` usage and existing host assumptions.

Do not force SSL for localhost development.

Create a production-compatible strategy.

Possible options:

- `DB_SSL=true`
- parse provider-specific URL options
- automatically enable SSL only when explicitly configured

Prefer explicit configuration over guessing.

If adding:

`DB_SSL`

document it in `.env.example`.

Do NOT disable certificate validation globally with:

`rejectUnauthorized: false`

unless the provider explicitly requires that behavior and there is no safe alternative.

Do not weaken TLS merely to make deployment easy.

# TASK 14 — INITIALIZATION / INSTRUMENTATION

Review:

`instrumentation.ts`

and all places calling:

`AppDataSource.initialize()`

Ensure concurrent calls cannot race and initialize the same DataSource twice.

A robust helper might expose:

`getDataSource()`

or equivalent that:

- returns initialized DataSource
- shares an in-progress initialization promise
- safely reuses warm instances

Do not rewrite the entire repository for this.

But eliminate obvious:

`AlreadyHasActiveConnectionError`

or multiple-pool race scenarios.

Update Better Auth adapter usage if necessary while preserving behavior.

# TASK 15 — REPORT ERROR HANDLING

Database persistence failures must not produce fake success.

If Gemini succeeds but report persistence fails:

the user should receive a safe application error rather than a report URL pointing to nowhere.

Log useful server-side details.

Never log:

- DB credentials
- auth tokens
- entire environment
- sensitive user data unnecessarily

Do not expose raw SQL errors to users.

# TASK 16 — URL NORMALIZATION

Before persisting report.url:

ensure the existing normalized URL used by the roast pipeline is what is stored.

Avoid duplicate weird forms such as:

example.com
https://example.com
https://example.com/

being stored inconsistently where reasonably easy to normalize.

Do not attempt aggressive canonicalization that changes semantic URLs.

At minimum retain protocol and valid normalized URL representation.

# TASK 17 — REPORT PAYLOAD VALIDATION

The report payload sent to the DB comes from:

`roastResultSchema`

Continue treating that Zod validation as authoritative.

Do not save unvalidated Gemini output.

When reading persisted JSON:

ensure it is compatible with the expected report type/schema.

If a future schema change makes old payloads invalid:

handle it gracefully.

Do not build a full versioned schema system now.

A simple defensive parse at the repository/service boundary is enough if appropriate.

# TASK 18 — MIGRATION AND ENV CONFIG

Update `.env.example` with names only.

Likely relevant variables:

`DATABASE_URL`
`DB_SYNCHRONIZE`
`DB_LOGGING`
`DB_CONNECTION_LIMIT`
`DB_SSL`

Only add variables actually used.

Do not include secrets.

Also update package scripts/documentation so another developer can understand:

- how to generate migrations
- how to run migrations locally
- how a fresh DB is initialized
- what must happen before production deployment

Keep documentation short and practical.

# TASK 19 — DO NOT IMPLEMENT PHASE 2

Explicitly DO NOT implement:

- free quota enforcement
- 1-audit blocking
- 30-audit Pro blocking
- period resets
- subscription period calculations
- Lemon Squeezy
- subscription database entity
- payment checkout
- payment webhooks
- paid plan verification
- screenshot analysis
- SSRF hardening beyond changes strictly required by report work
- external rate-limit storage
- Vercel deployment
- cron jobs

Those come later.

# TASK 20 — TESTS

There were previously no tests.

For this phase, add a SMALL amount of meaningful automated coverage if the existing architecture allows it without bringing in a huge framework.

Prioritize tests around:

- report payload persistence mapping
- report ownership behavior
- plan/tier validation
- URL/report serialization
- DataSource config logic such as production synchronize=false

Do not spend the whole phase constructing an elaborate test infrastructure.

If installing a lightweight test runner is needed, explain why.

If adding tests would materially expand scope, skip them and clearly list manual validation steps instead.

# VALIDATION

After implementation:

1. Run TypeScript typecheck.

2. Run ESLint.

3. Run production build.

4. Run `git diff --check`.

5. Search for:
   - `__reportStore`
   - `new Map`
   - `ReportStore`
   - `DB_SYNCHRONIZE`
   - `synchronize:`
   - direct `AppDataSource.initialize`
   - Agency plan references
   - hardcoded report dates

6. Confirm no new Stripe/payment code was added.

7. Confirm no migration was run against production.

8. Confirm no secret values were printed.

If a safe LOCAL scratch database is available and clearly non-production:

you may test migrations against it.

Before doing that:

prove from configuration that it is not production.

If there is any uncertainty:

DO NOT RUN migrations.

Instead report the exact validation commands I should run manually.

# FUNCTIONAL VALIDATION TARGETS

Phase 1 should be considered complete only if code supports the following behavior:

### Test A

Authenticated User A generates an audit.

Result:

- report row created in MySQL
- report.userId = User A id
- report loads at `/report/[id]`

### Test B

Restart the Next.js server.

Result:

- same report still loads.

### Test C

Authenticated User B attempts User A's report URL.

Result:

- report content is not shown.

### Test D

User A dashboard opens.

Result:

- real audit appears in recent history.

### Test E

Production configuration has:

`DB_SYNCHRONIZE=true`

Result:

TypeORM still cannot synchronize/alter production schema.

### Test F

Multiple calls inside one warm process request a DataSource.

Result:

they reuse one initialized DataSource/pool rather than creating new pools.

# EXPECTED FINAL RESPONSE

When finished return:

# Phase 1 — Completion Report

## 1. Summary

What was implemented.

## 2. Architecture Changes

Describe:

- Report domain/model
- repository
- service/store replacement
- ownership
- dashboard history

## 3. Database Schema

Show the final Report table structure.

Do NOT show DB credentials.

## 4. Migration Strategy

List migration files created.

Explain:

- fresh database process
- existing synchronize-created database process
- whether any migration was actually executed
- any manual baseline steps required

## 5. Production Synchronize Protection

Explain exactly how production is protected.

## 6. DataSource / Pool Changes

Explain:

- warm-instance caching
- initialization race protection
- connectionLimit
- SSL behavior

## 7. Report Ownership

Explain how unauthorized report reads are handled.

## 8. Files Added

Path + purpose.

## 9. Files Modified

Path + change.

## 10. Environment Changes

Variable NAMES only.

## 11. Validation Results

Report:

- TypeScript
- ESLint
- build
- git diff --check
- tests if any

## 12. Functional Verification

Report results for Test A–F.

If any were not executed, explicitly say why and give exact safe manual steps.

## 13. Remaining Risks

Especially anything that affects Phase 2 or Vercel.

## 14. Git Status

Paths/status only.

Never secrets.

## 15. Recommendation for Phase 2

Do NOT implement it.

Describe the next phase only:

- authentication required for auditing
- free/pro quota enforcement
- SSRF-safe URL fetching
- Gemini cost controls
- real usage display

Stop after this report.
