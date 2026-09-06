import { EntitySchema } from "typeorm";
import type { UserRow } from "./UserSchema";

/** Persistence row shape for `accounts`. See UserSchema for why this is an EntitySchema. */
export interface AccountRow {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  idToken: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: UserRow;
}

export const AccountSchema = new EntitySchema<AccountRow>({
  name: "Account",
  tableName: "accounts",
  columns: {
    id: { type: "varchar", length: 36, primary: true },
    userId: { type: "varchar", length: 36 },
    accountId: { type: "varchar", length: 255 },
    providerId: { type: "varchar", length: 255 },
    accessToken: { type: "text", nullable: true },
    refreshToken: { type: "text", nullable: true },
    accessTokenExpiresAt: { type: "datetime", precision: 3, nullable: true },
    refreshTokenExpiresAt: { type: "datetime", precision: 3, nullable: true },
    scope: { type: "text", nullable: true },
    idToken: { type: "text", nullable: true },
    password: { type: "text", nullable: true },
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
  // One credential/OAuth account per (provider, account) pair.
  indices: [{ columns: ["providerId", "accountId"], unique: true }],
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
});
