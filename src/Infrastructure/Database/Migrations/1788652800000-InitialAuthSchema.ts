import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Baseline: the four authentication tables.
 *
 * These tables already exist in databases created before migrations were
 * introduced (TypeORM `synchronize` built them). Every statement is therefore
 * written as CREATE TABLE IF NOT EXISTS, which makes this migration safe to run
 * against both an empty database and an existing one:
 *
 *  - Fresh database: the tables are created exactly as the entities define them.
 *  - Existing database: nothing is touched, and the migration is simply recorded
 *    as applied. No table is dropped, altered or recreated.
 *
 * Note this baseline does NOT include failedPasswordAttempts, lockedUntil,
 * resetToken or resetTokenExpiresAt. Those columns were never written by any
 * code path; a fresh database never gets them, and an existing database has
 * them removed by the DropUnusedUserColumns migration.
 *
 * `down` is intentionally not destructive — see the comment on it.
 */
export class InitialAuthSchema1788652800000 implements MigrationInterface {
  name = "InitialAuthSchema1788652800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` text NOT NULL,
        \`firstName\` text NOT NULL,
        \`lastName\` text NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`emailVerified\` tinyint NOT NULL DEFAULT 0,
        \`image\` text NULL,
        \`isAdmin\` tinyint NOT NULL DEFAULT 0,
        \`package\` text NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sessions\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        \`token\` varchar(255) NOT NULL,
        \`expiresAt\` datetime(3) NOT NULL,
        \`ipAddress\` text NULL,
        \`userAgent\` text NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX \`IDX_sessions_token\` (\`token\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_sessions_user\` FOREIGN KEY (\`userId\`)
          REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`accounts\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        \`accountId\` varchar(255) NOT NULL,
        \`providerId\` varchar(255) NOT NULL,
        \`accessToken\` text NULL,
        \`refreshToken\` text NULL,
        \`accessTokenExpiresAt\` datetime(3) NULL,
        \`refreshTokenExpiresAt\` datetime(3) NULL,
        \`scope\` text NULL,
        \`idToken\` text NULL,
        \`password\` text NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        UNIQUE INDEX \`IDX_accounts_provider_account\` (\`providerId\`, \`accountId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_accounts_user\` FOREIGN KEY (\`userId\`)
          REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`verifications\` (
        \`id\` varchar(36) NOT NULL,
        \`identifier\` text NOT NULL,
        \`value\` text NOT NULL,
        \`expiresAt\` datetime(3) NOT NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  /**
   * Deliberately a no-op.
   *
   * Reverting a baseline would mean dropping every user, session and account in
   * the database. If a teardown is genuinely wanted it should be an explicit,
   * manual decision — not one keystroke of `migration:revert` away.
   */
  public async down(): Promise<void> {
    throw new Error(
      "InitialAuthSchema cannot be reverted: it would drop the authentication tables and all user data. Drop the schema manually if that is genuinely intended."
    );
  }
}
