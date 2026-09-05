/**
 * Maps by entity NAME (TypeORM's metadata.name, matched by string) rather
 * than by class reference. Next.js can evaluate a Model file into more than
 * one module instance across different bundles (e.g. the instrumentation
 * hook vs. a route handler's own bundle), so a class reference captured in
 * one bundle can fail identity checks against DataSource metadata built in
 * another. String lookup sidesteps that entirely.
 */
export const BETTER_AUTH_MODEL_MAP = {
  user: "UserModel",
  session: "SessionModel",
  account: "AccountModel",
  verification: "VerificationModel",
} as const;

export type BetterAuthModelName = keyof typeof BETTER_AUTH_MODEL_MAP;
