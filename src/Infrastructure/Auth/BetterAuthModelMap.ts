import { UserSchema } from "@models/UserSchema";
import { SessionSchema } from "@models/SessionSchema";
import { AccountSchema } from "@models/AccountSchema";
import { VerificationSchema } from "@models/VerificationSchema";

/**
 * Maps Better Auth's model names to TypeORM entities.
 *
 * These are the EntitySchema objects themselves, not name strings. TypeORM
 * resolves an EntitySchema target directly, so there is no name lookup to get
 * wrong and nothing here depends on a JavaScript class name surviving
 * minification — which is what broke the production build before.
 *
 * This replaces two earlier attempts: class-name strings ("UserModel"), which
 * the production minifier destroyed, and table-name strings ("users"), which
 * fixed lookup but not TypeORM's internal identity. One mechanism now.
 */
export const BETTER_AUTH_MODEL_MAP = {
  user: UserSchema,
  session: SessionSchema,
  account: AccountSchema,
  verification: VerificationSchema,
} as const;

export type BetterAuthModelName = keyof typeof BETTER_AUTH_MODEL_MAP;
