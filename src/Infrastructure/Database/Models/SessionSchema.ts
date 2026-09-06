import { EntitySchema } from "typeorm";
import type { UserRow } from "./UserSchema";

/** Persistence row shape for `sessions`. See UserSchema for why this is an EntitySchema. */
export interface SessionRow {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: UserRow;
}

export const SessionSchema = new EntitySchema<SessionRow>({
  name: "Session",
  tableName: "sessions",
  columns: {
    id: { type: "varchar", length: 36, primary: true },
    userId: { type: "varchar", length: 36 },
    token: { type: "varchar", length: 255 },
    expiresAt: { type: "datetime", precision: 3 },
    ipAddress: { type: "text", nullable: true },
    userAgent: { type: "text", nullable: true },
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
  indices: [{ columns: ["token"], unique: true }],
  relations: {
    // Target is the stable schema name, never a class reference.
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
});
