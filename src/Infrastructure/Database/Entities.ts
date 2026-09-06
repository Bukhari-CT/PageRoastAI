import { UserSchema } from "./Models/UserSchema";
import { SessionSchema } from "./Models/SessionSchema";
import { AccountSchema } from "./Models/AccountSchema";
import { VerificationSchema } from "./Models/VerificationSchema";
import { ReportSchema } from "./Models/ReportSchema";
import { AuditRunSchema } from "./Models/AuditRunSchema";

/**
 * The single entity registry, shared by the application DataSource and the
 * migration CLI DataSource so the two can never drift apart.
 *
 * Every entry is an EntitySchema with an explicit `name`, which is what makes
 * entity identity survive the production build — see UserSchema for the full
 * explanation.
 */
export const ENTITIES = [
  UserSchema,
  SessionSchema,
  AccountSchema,
  VerificationSchema,
  ReportSchema,
  AuditRunSchema,
];

/**
 * Stable metadata names, asserted by tests. These strings are the entity
 * identity TypeORM uses internally; they must stay distinct and must never be
 * derived from a JavaScript class name.
 */
export const ENTITY_NAMES = [
  "User",
  "Session",
  "Account",
  "Verification",
  "Report",
  "AuditRun",
] as const;
