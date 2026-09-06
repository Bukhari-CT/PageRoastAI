import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * The `reports` table — durable storage for generated audits, replacing the
 * in-memory store.
 *
 * `planId` records the product plan the audit ran under ("free" | "pro"), not
 * the Gemini model tier — see ReportModel for why those stay separate.
 *
 * `payload` is a MySQL JSON column holding the Zod-validated RoastResult;
 * `score` is lifted out so history listings can read and sort it without
 * parsing JSON per row. The (userId, createdAt) index serves both the history
 * query and the per-period count Phase 2 needs for quota enforcement.
 *
 * `userId` is nullable so audits created before authentication became mandatory
 * can be stored. Such rows have no owner and are readable by nobody.
 *
 * The migration is written to converge on the same schema from either starting
 * point:
 *
 *  - A fresh database gets the table created directly.
 *  - A database where TypeORM `synchronize` already built `reports` keeps its
 *    rows; only the column that changed meaning is reconciled. `synchronize`
 *    created this table with a `tier` column holding the Gemini model tier
 *    ("free" | "premium"), which was later corrected to store the product plan
 *    ("free" | "pro"). The rename and value backfill below are lossless: model
 *    tier and plan id map one-to-one (free->free, premium->pro).
 */
export class CreateReportsTable1788652900000 implements MigrationInterface {
  name = "CreateReportsTable1788652900000";

  private async columnExists(queryRunner: QueryRunner, column: string): Promise<boolean> {
    const rows: Array<{ count: string | number }> = await queryRunner.query(
      `SELECT COUNT(*) AS count
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'reports'
          AND COLUMN_NAME = ?`,
      [column]
    );

    return Number(rows?.[0]?.count ?? 0) > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`reports\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NULL,
        \`url\` varchar(2048) NOT NULL,
        \`planId\` varchar(16) NOT NULL,
        \`score\` int NOT NULL,
        \`payload\` json NOT NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX \`IDX_reports_user_created\` (\`userId\`, \`createdAt\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_reports_user\` FOREIGN KEY (\`userId\`)
          REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    // Reconcile a table that `synchronize` created before the column changed
    // meaning. Only runs when the old shape is present and the new one is not,
    // so it is a no-op on a fresh database and cannot run twice.
    const hasLegacyTier = await this.columnExists(queryRunner, "tier");
    const hasPlanId = await this.columnExists(queryRunner, "planId");

    if (hasLegacyTier && !hasPlanId) {
      await queryRunner.query(
        `ALTER TABLE \`reports\` CHANGE \`tier\` \`planId\` varchar(16) NOT NULL`
      );
      // Model tier -> plan id. "free" is already correct in both vocabularies.
      await queryRunner.query(
        `UPDATE \`reports\` SET \`planId\` = 'pro' WHERE \`planId\` = 'premium'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`reports\``);
  }
}
