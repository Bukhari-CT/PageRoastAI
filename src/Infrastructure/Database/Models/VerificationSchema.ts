import { EntitySchema } from "typeorm";

/**
 * Persistence row shape for `verifications`.
 *
 * Better Auth stores both email-verification and password-reset tokens here.
 * See UserSchema for why this is an EntitySchema rather than a decorator class.
 */
export interface VerificationRow {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const VerificationSchema = new EntitySchema<VerificationRow>({
  name: "Verification",
  tableName: "verifications",
  columns: {
    id: { type: "varchar", length: 36, primary: true },
    identifier: { type: "text" },
    value: { type: "text" },
    expiresAt: { type: "datetime", precision: 3 },
    createdAt: {
      type: "datetime",
      precision: 3,
      createDate: true,
      default: () => "CURRENT_TIMESTAMP(3)",
    },
    updatedAt: {
      type: "datetime",
      precision: 3,
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP(3)",
      onUpdate: "CURRENT_TIMESTAMP(3)",
    },
  },
});
