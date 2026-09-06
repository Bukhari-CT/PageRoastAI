import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENTITIES } from "./Entities";
import { resolveSsl } from "./DataSourceConfig";

/**
 * DataSource used only by the TypeORM CLI (`npm run migration:*`).
 *
 * Kept separate from the application DataSource on purpose:
 *
 *  - `synchronize` is hard-coded false. The CLI must never be able to alter
 *    schema outside a migration, in any environment.
 *  - No connection pool tuning: the CLI is a single short-lived process, so the
 *    serverless pool settings would only get in the way.
 *  - It points at DIRECT_URL when present, so migrations bypass a connection
 *    pooler (poolers frequently reject DDL or multi-statement transactions).
 *
 * Environment is loaded by the npm scripts via Node's --env-file-if-exists.
 */
export const CliDataSource = new DataSource({
  type: "mysql",
  url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  // Migrations run against the same managed database as the app, so they need
  // the same TLS setting.
  ssl: resolveSsl(process.env),
  // Same entity definitions as the application DataSource — one source of truth.
  entities: ENTITIES,
  migrations: ["src/Infrastructure/Database/Migrations/*.ts"],
  migrationsTableName: "migrations",
});

// Exactly one DataSource export: the TypeORM CLI rejects a file that exports
// the same instance twice (e.g. named plus default).
