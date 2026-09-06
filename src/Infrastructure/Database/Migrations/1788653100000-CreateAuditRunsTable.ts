import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * `audit_runs` — the quota reservation ledger.
 *
 * A slot is claimed here *before* any page fetch or Gemini call, so two
 * concurrent requests cannot both pass a count check and both spend money.
 * `reserved` rows stop counting once `reservedUntil` passes, so a crashed
 * process cannot block a user permanently, and `failed` rows never consume
 * quota.
 *
 * Index and foreign-key names are exactly the ones TypeORM's naming strategy
 * derives for this table, taken from `schema:log` output. That is deliberate:
 * the earlier migrations used hand-written names that do not match what the
 * metadata expects, so a database built from those migrations drifts from a
 * database built by synchronize. This table is defined so both routes produce
 * an identical schema. (The pre-existing mismatch on the older tables is
 * untouched here and is recorded as a pre-deployment task.)
 */
export class CreateAuditRunsTable1788653100000 implements MigrationInterface {
  name = "CreateAuditRunsTable1788653100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`audit_runs\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        \`planId\` varchar(16) NOT NULL,
        \`periodKey\` varchar(32) NOT NULL,
        \`status\` varchar(16) NOT NULL,
        \`reservedUntil\` datetime(3) NOT NULL,
        \`reportId\` varchar(36) NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`completedAt\` datetime(3) NULL,
        INDEX \`IDX_a0e9a665c288112ca6c656a9dc\` (\`userId\`, \`status\`, \`periodKey\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Added separately (and guarded) so re-running against a database that
    // already has the table is a no-op rather than an error.
    if (!(await this.constraintExists(queryRunner, "FK_bdaa90f7ca67aa9deef31a948e2"))) {
      await queryRunner.query(
        `ALTER TABLE \`audit_runs\` ADD CONSTRAINT \`FK_bdaa90f7ca67aa9deef31a948e2\`
           FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`
      );
    }

    if (!(await this.constraintExists(queryRunner, "FK_a31e705782229a6506379981cf7"))) {
      await queryRunner.query(
        `ALTER TABLE \`audit_runs\` ADD CONSTRAINT \`FK_a31e705782229a6506379981cf7\`
           FOREIGN KEY (\`reportId\`) REFERENCES \`reports\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`audit_runs\``);
  }

  private async constraintExists(queryRunner: QueryRunner, name: string): Promise<boolean> {
    const rows: Array<{ count: string | number }> = await queryRunner.query(
      `SELECT COUNT(*) AS count
         FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'audit_runs'
          AND CONSTRAINT_NAME = ?`,
      [name]
    );

    return Number(rows?.[0]?.count ?? 0) > 0;
  }
}
