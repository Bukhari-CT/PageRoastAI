import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ENTITIES, ENTITY_NAMES } from "../src/Infrastructure/Database/Entities";

/**
 * Guards the invariant that broke production before Phase 1.75.
 *
 * TypeORM computes an entity's identity as
 * `typeof target === "function" ? target.name : target` (EntityMetadata.js).
 * With decorator entities the target is the class, so the production build's
 * minifier renamed all five entities to `a`; TypeORM's persistence sorter then
 * saw one self-referencing node and threw `Cyclic dependency: "a"` on every
 * write.
 *
 * These assertions read the real EntitySchema definitions the DataSource is
 * built from — not a stand-in — and pin the two properties that keep identity
 * stable: an explicit `name`, and no `target` class for a minifier to rename.
 *
 * The authoritative end-to-end check remains the production-mode write test
 * (`npm run build && npm start`, then sign in and generate a report), because
 * the failure only manifests in a minified build.
 */
describe("TypeORM entity identity", () => {
  it("registers exactly the expected entities", () => {
    assert.equal(ENTITIES.length, 6);
    assert.equal(ENTITY_NAMES.length, 6);
  });

  it("gives every entity an explicit, non-empty metadata name", () => {
    for (const entity of ENTITIES) {
      const name = entity.options.name;
      assert.equal(typeof name, "string");
      assert.ok(name.length > 0, "entity name must not be empty");
      // A single-letter name is exactly what minification produced.
      assert.ok(name.length > 1, `suspiciously short entity name: ${name}`);
    }
  });

  it("keeps all entity names distinct", () => {
    const names = ENTITIES.map((e) => e.options.name);
    assert.deepEqual([...names].sort(), [...ENTITY_NAMES].sort());
    assert.equal(new Set(names).size, names.length, "entity names must be unique");
  });

  it("declares no target class, so no name can be minified away", () => {
    for (const entity of ENTITIES) {
      // `target` is what makes TypeORM fall back to `target.name`. Its absence
      // is the property that makes identity survive a production build.
      assert.equal(
        entity.options.target,
        undefined,
        `${entity.options.name} must not declare a target class`
      );
    }
  });

  it("maps each entity to its expected table without relying on the entity name", () => {
    const tables = Object.fromEntries(
      ENTITIES.map((e) => [e.options.name, e.options.tableName])
    );
    assert.deepEqual(tables, {
      User: "users",
      Session: "sessions",
      Account: "accounts",
      Verification: "verifications",
      Report: "reports",
      AuditRun: "audit_runs",
    });
  });

  it("targets relations by stable entity name, never by class reference", () => {
    for (const entity of ENTITIES) {
      for (const [property, relation] of Object.entries(entity.options.relations ?? {})) {
        const target = relation.target;
        assert.equal(
          typeof target,
          "string",
          `${entity.options.name}.${property} must target an entity name, not a class`
        );
        assert.ok(
          (ENTITY_NAMES as readonly string[]).includes(target as string),
          `${entity.options.name}.${property} targets unknown entity "${String(target)}"`
        );
      }
    }
  });
});

describe("Better Auth model map", () => {
  it("maps to entity schemas rather than name strings", async () => {
    const { BETTER_AUTH_MODEL_MAP } = await import(
      "../src/Infrastructure/Auth/BetterAuthModelMap"
    );

    const expected: Record<string, string> = {
      user: "User",
      session: "Session",
      account: "Account",
      verification: "Verification",
    };

    for (const [model, schema] of Object.entries(BETTER_AUTH_MODEL_MAP)) {
      // A string here would mean we were back to name-based lookup.
      assert.notEqual(typeof schema, "string", `${model} must map to an EntitySchema`);
      assert.equal(schema.options.name, expected[model]);
    }
  });
});
