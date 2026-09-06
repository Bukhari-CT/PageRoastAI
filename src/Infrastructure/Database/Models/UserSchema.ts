import { EntitySchema } from "typeorm";

/**
 * Persistence row shape for `users`.
 *
 * Replaces the previous decorator class. TypeORM derives an entity's identity
 * from `metadata.targetName`, which for a decorator entity is the JavaScript
 * class name — and the production build minifies every entity class to a
 * single letter. All five entities collapsed to the same name, which made
 * TypeORM's persistence sorter see a self-referencing graph and throw
 * `Cyclic dependency: "a"` on every write.
 *
 * An EntitySchema declared with an explicit `name` and no `target` class sets
 * `targetName` to that string (EntityMetadata.js: `typeof target === "function"
 * ? target.name : target`), so identity is stable under any minifier.
 */
export interface UserRow {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  isAdmin: boolean;
  package: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new EntitySchema<UserRow>({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "varchar", length: 36, primary: true },
    name: { type: "text" },
    firstName: { type: "text" },
    lastName: { type: "text" },
    email: { type: "varchar", length: 255 },
    emailVerified: { type: "boolean", default: false },
    image: { type: "text", nullable: true },
    isAdmin: { type: "boolean", default: false },
    package: { type: "text", nullable: true },
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
  // Unnamed on purpose: TypeORM's naming strategy hashes table + column names
  // (not entity names), so this regenerates the existing IDX_… name unchanged.
  indices: [{ columns: ["email"], unique: true }],
});
