import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENTITIES } from "./Entities";
import {
  resolveConnectionLimit,
  resolveDriverExtra,
  resolveLogging,
  resolveSsl,
  resolveSynchronize,
  shouldWarnAboutIgnoredSynchronize,
} from "./DataSourceConfig";

const buildDataSource = () => {
  if (shouldWarnAboutIgnoredSynchronize(process.env)) {
    // Names only — never the connection string or any credential.
    console.warn(
      "[DB] DB_SYNCHRONIZE=true was supplied in production and is being ignored. " +
        "Schema changes in production must go through migrations (npm run migration:run). " +
        "Remove DB_SYNCHRONIZE from the production environment."
    );
  }

  return new DataSource({
    type: "mysql",
    url: process.env.DATABASE_URL,
    // Never true in production — the guard lives inside resolveSynchronize so
    // no call site can opt out of it.
    synchronize: resolveSynchronize(process.env),
    logging: resolveLogging(process.env),
    entities: ENTITIES,
    // Migrations are run through the CLI DataSource (DataSourceCli.ts), never
    // automatically on boot: an unexpected schema change during a cold start is
    // exactly the failure mode migrations are meant to prevent.
    migrationsRun: false,
    poolSize: resolveConnectionLimit(process.env),
    ssl: resolveSsl(process.env),
    extra: resolveDriverExtra(process.env),
  });
};

declare global {
  var __dataSource: DataSource | undefined;
  var __dataSourceInits: WeakMap<DataSource, Promise<DataSource>> | undefined;
}

/**
 * Cached in **all** environments, including production.
 *
 * The previous `NODE_ENV !== "production"` guard was copied from the Prisma
 * hot-reload pattern, but here it had the opposite of the intended effect: on a
 * serverless target it meant every module graph in a warm instance could build
 * its own DataSource, and therefore its own MySQL pool. Reusing one instance
 * per warm process is the whole point.
 */
export const AppDataSource: DataSource = globalThis.__dataSource ?? buildDataSource();
globalThis.__dataSource = AppDataSource;

const initPromises: WeakMap<DataSource, Promise<DataSource>> =
  globalThis.__dataSourceInits ?? new WeakMap();
globalThis.__dataSourceInits = initPromises;

/**
 * Initializes a DataSource at most once, sharing a single in-flight
 * initialization between concurrent callers.
 *
 * Without this, two requests arriving during a cold start both observe
 * `isInitialized === false` and both call `initialize()`, which races and can
 * throw AlreadyHasActiveConnectionError or leak a second connection pool.
 *
 * Keyed by DataSource so the Better Auth adapter — which is handed a
 * DataSource rather than importing one — shares the same guarantee.
 */
export async function ensureDataSourceInitialized(
  dataSource: DataSource
): Promise<DataSource> {
  if (dataSource.isInitialized) return dataSource;

  const existing = initPromises.get(dataSource);
  if (existing) return existing;

  const pending = dataSource.initialize().catch((error) => {
    // Drop the cached promise so a transient failure (database briefly
    // unreachable) can be retried by the next request instead of poisoning the
    // instance for the rest of its life.
    initPromises.delete(dataSource);
    throw error;
  });

  initPromises.set(dataSource, pending);
  return pending;
}

/** The application's DataSource, initialized. */
export function getDataSource(): Promise<DataSource> {
  return ensureDataSourceInitialized(AppDataSource);
}
