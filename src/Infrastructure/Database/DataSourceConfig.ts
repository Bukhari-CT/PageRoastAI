/**
 * Pure resolution of database configuration from environment values.
 *
 * Deliberately free of TypeORM/model imports and side effects so it can be
 * unit-tested directly — the production-synchronize guard in particular is a
 * safety property worth asserting in a test rather than trusting by reading.
 */

export interface DatabaseEnvInput {
  NODE_ENV?: string;
  DB_SYNCHRONIZE?: string;
  DB_LOGGING?: string;
  DB_CONNECTION_LIMIT?: string;
  DB_SSL?: string;
}

/**
 * Conservative default for serverless. Every warm instance holds its own pool,
 * so total connections are (instances x limit); MySQL's default max_connections
 * is 151. Three leaves headroom for parallel queries within one request while
 * keeping ~50 warm instances within budget.
 */
export const DEFAULT_CONNECTION_LIMIT = 3;

/** Idle connections are released well inside typical provider idle timeouts. */
export const IDLE_TIMEOUT_MS = 30_000;
export const CONNECT_TIMEOUT_MS = 10_000;

export function isProductionEnv(env: DatabaseEnvInput): boolean {
  return env.NODE_ENV === "production";
}

export function isSynchronizeRequested(env: DatabaseEnvInput): boolean {
  return env.DB_SYNCHRONIZE === "true";
}

/**
 * `synchronize` lets TypeORM ALTER/DROP live columns to match entities. It is
 * structurally impossible to enable in production: the production check is
 * applied here rather than left to the caller, so no call site can opt out.
 *
 * A production deployment that still sets DB_SYNCHRONIZE=true is a real
 * misconfiguration, but it is already rendered harmless by this function, so
 * it is reported as a loud warning rather than a boot failure — see
 * `shouldWarnAboutIgnoredSynchronize`.
 */
export function resolveSynchronize(env: DatabaseEnvInput): boolean {
  if (isProductionEnv(env)) return false;
  return isSynchronizeRequested(env);
}

export function shouldWarnAboutIgnoredSynchronize(env: DatabaseEnvInput): boolean {
  return isProductionEnv(env) && isSynchronizeRequested(env);
}

export function resolveLogging(env: DatabaseEnvInput): boolean {
  return env.DB_LOGGING === "true";
}

/** Falls back to the default for absent, non-numeric or non-positive values. */
export function resolveConnectionLimit(env: DatabaseEnvInput): number {
  const parsed = Number(env.DB_CONNECTION_LIMIT);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_CONNECTION_LIMIT;
  return parsed;
}

/**
 * TLS is opt-in via DB_SSL so localhost development is unaffected. Certificate
 * validation stays on: providers that need a custom CA should supply one
 * through the connection URL rather than us disabling verification.
 */
export function resolveSsl(env: DatabaseEnvInput): { rejectUnauthorized: true } | undefined {
  return env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined;
}

/**
 * Driver-level options passed straight to mysql2. Every key here is a
 * documented mysql2 pool/connection option.
 */
export function resolveDriverExtra(env: DatabaseEnvInput) {
  return {
    connectTimeout: CONNECT_TIMEOUT_MS,
    waitForConnections: true,
    // 0 is mysql2's "no queue limit". Stated explicitly because the real bound
    // on a saturated instance is the serverless function timeout, not the pool.
    queueLimit: 0,
    idleTimeout: IDLE_TIMEOUT_MS,
    maxIdle: resolveConnectionLimit(env),
  };
}
