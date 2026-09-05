# Database & Migrations

MySQL via TypeORM. Five tables: `users`, `sessions`, `accounts`, `verifications`, `reports`.

## Schema is managed by migrations

`DB_SYNCHRONIZE` still exists for local convenience, but it is **ignored entirely when
`NODE_ENV=production`** (`src/Infrastructure/Database/DataSourceConfig.ts`). Production schema
changes happen only through migrations. Prefer migrations locally too.

Migrations live in `src/Infrastructure/Database/Migrations/` and run against a dedicated CLI
DataSource (`src/Infrastructure/Database/DataSourceCli.ts`) that has `synchronize: false` hard-coded
and prefers `DIRECT_URL`, so DDL bypasses any connection pooler.

## Commands

```bash
npm run migration:show      # which migrations have been applied
npm run migration:run       # apply pending migrations
npm run migration:revert    # roll back the most recent migration
npm run migration:generate -- src/Infrastructure/Database/Migrations/DescribeTheChange
npm run migration:create   -- src/Infrastructure/Database/Migrations/DescribeTheChange
```

`migration:generate` diffs the entities against the live database and writes the SQL for you;
`migration:create` gives you an empty migration to hand-write. Always read a generated migration
before running it — TypeORM will happily generate a destructive `ALTER`.

## Fresh database

```bash
mysql -e "CREATE DATABASE pageroast CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
# point DATABASE_URL at it, then:
npm run migration:run
npm run seed:admin          # optional: creates the one admin account
```

All five tables are created from migrations alone. No `synchronize` step is needed.

## Existing database created by `synchronize`

Databases built before migrations existed already contain the four auth tables. The baseline
migration is written with `CREATE TABLE IF NOT EXISTS`, so:

```bash
npm run migration:run
```

is safe and non-destructive. It records the baseline as applied without touching the existing
tables, then creates `reports` and drops four unused `users` columns
(`failedPasswordAttempts`, `lockedUntil`, `resetToken`, `resetTokenExpiresAt` — nothing ever wrote
them; each drop is guarded by an `information_schema` check).

Back up first if the database holds anything you care about:

```bash
mysqldump "$DATABASE_NAME" > backup.sql
```

If you would rather not run the column drop, apply the first two migrations only and leave the
third pending — the application does not read those columns either way.

### Alternative: mark the baseline as applied without running it

Only needed if you do not want `CREATE TABLE IF NOT EXISTS` to run at all:

```sql
-- Verify the table first: SELECT * FROM migrations;
INSERT INTO migrations (timestamp, name)
VALUES (1788652800000, 'InitialAuthSchema1788652800000');
```

Then `npm run migration:run` applies only the later migrations.

## Before deploying to production

1. `DB_SYNCHRONIZE` unset (or `false`) in the production environment.
2. `DB_SSL=true` if the provider requires TLS. Certificate validation is always enforced.
3. `DB_CONNECTION_LIMIT` sized deliberately — every warm serverless instance holds its own pool, so
   total connections are (instances × limit). Default is 3.
4. Migrations run against production **before** the new build serves traffic. The app never runs
   migrations on boot (`migrationsRun: false`).

## Connection handling

`getDataSource()` in `src/Infrastructure/Database/DBConnection.ts` is the only way application code
should reach the database. It caches the DataSource on `globalThis` in every environment (so a warm
serverless instance reuses one pool) and shares a single in-flight `initialize()` between concurrent
callers, so a cold start cannot open two pools or throw `AlreadyHasActiveConnectionError`.
