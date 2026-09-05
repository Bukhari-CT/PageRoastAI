import { MigrationInterface, QueryRunner } from "typeorm";

const UNUSED_COLUMNS = [
  "failedPasswordAttempts",
  "lockedUntil",
  "resetToken",
  "resetTokenExpiresAt",
] as const;

/**
 * Removes four columns on `users` that nothing ever wrote.
 *
 * `failedPasswordAttempts` and `lockedUntil` backed an account-lockout check
 * that read them but never incremented them — it could not lock an account, and
 * the check was replaced by Better Auth's rate limiter. `resetToken` and
 * `resetTokenExpiresAt` were superseded by Better Auth's `verifications` table,
 * which is where password-reset tokens actually live.
 *
 * MySQL 8 has no `DROP COLUMN IF EXISTS`, so each drop is guarded by an
 * information_schema lookup. That keeps this migration a safe no-op on a fresh
 * database (where the baseline never created the columns) while still cleaning
 * up a database built by the old `synchronize` path.
 *
 * The dropped data is a zero counter and three always-null columns, so nothing
 * of value is lost. `down` recreates the columns but cannot restore values —
 * there were never any to restore.
 */
export class DropUnusedUserColumns1788653000000 implements MigrationInterface {
  name = "DropUnusedUserColumns1788653000000";

  private async columnExists(queryRunner: QueryRunner, column: string): Promise<boolean> {
    const rows: Array<{ count: string | number }> = await queryRunner.query(
      `SELECT COUNT(*) AS count
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = ?`,
      [column]
    );

    return Number(rows?.[0]?.count ?? 0) > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The unique index on resetToken must go before the column it covers.
    const indexes: Array<{ INDEX_NAME: string }> = await queryRunner.query(
      `SELECT DISTINCT INDEX_NAME
         FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'resetToken'`
    );

    for (const { INDEX_NAME } of indexes ?? []) {
      await queryRunner.query(`DROP INDEX \`${INDEX_NAME}\` ON \`users\``);
    }

    for (const column of UNUSED_COLUMNS) {
      if (await this.columnExists(queryRunner, column)) {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`${column}\``);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.columnExists(queryRunner, "failedPasswordAttempts"))) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`failedPasswordAttempts\` int NOT NULL DEFAULT 0`
      );
    }
    if (!(await this.columnExists(queryRunner, "lockedUntil"))) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`lockedUntil\` datetime(3) NULL`
      );
    }
    if (!(await this.columnExists(queryRunner, "resetToken"))) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`resetToken\` varchar(255) NULL`
      );
      await queryRunner.query(
        `CREATE UNIQUE INDEX \`IDX_users_reset_token\` ON \`users\` (\`resetToken\`)`
      );
    }
    if (!(await this.columnExists(queryRunner, "resetTokenExpiresAt"))) {
      await queryRunner.query(
        `ALTER TABLE \`users\` ADD \`resetTokenExpiresAt\` datetime(3) NULL`
      );
    }
  }
}
