import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteColumns1734303000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add deletedAt column to product table
        await queryRunner.query(`
            ALTER TABLE product 
            ADD COLUMN deletedAt TIMESTAMP NULL DEFAULT NULL
        `);

        // Add deletedAt column to branch table
        await queryRunner.query(`
            ALTER TABLE branch 
            ADD COLUMN deletedAt TIMESTAMP NULL DEFAULT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove deletedAt column from product table
        await queryRunner.query(`
            ALTER TABLE product 
            DROP COLUMN deletedAt
        `);

        // Remove deletedAt column from branch table
        await queryRunner.query(`
            ALTER TABLE branch 
            DROP COLUMN deletedAt
        `);
    }
}
