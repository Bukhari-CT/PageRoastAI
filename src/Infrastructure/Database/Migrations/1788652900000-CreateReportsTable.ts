import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * The `reports` table — durable storage for generated audits, replacing the
 * in-memory store.
 *
 * `payload` is a MySQL JSON column holding the Zod-validated RoastResult;
 * `score` is lifted out so history listings can read and sort it without
 * parsing JSON per row. The (userId, createdAt) index serves both the history
 * query and the per-period count Phase 2 needs for quota enforcement.
 *
 * `userId` is nullable so audits created before authentication became mandatory
 * can be stored. Such rows have no owner and are readable by nobody.
 */
export class CreateReportsTable1788652900000 implements MigrationInterface {
  name = "CreateReportsTable1788652900000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`reports\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NULL,
        \`url\` varchar(2048) NOT NULL,
        \`tier\` varchar(16) NOT NULL,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`reports\``);
  }
}
