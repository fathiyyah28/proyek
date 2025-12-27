import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToGlobalStock1734302000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Check for duplicate productIds in global_stock
        const duplicates = await queryRunner.query(`
            SELECT productId, COUNT(*) as count 
            FROM global_stock 
            GROUP BY productId 
            HAVING COUNT(*) > 1
        `);

        if (duplicates.length > 0) {
            console.warn('⚠️  Found duplicate productIds in global_stock:', duplicates);

            // Keep only the first entry for each productId, delete others
            for (const dup of duplicates) {
                await queryRunner.query(`
                    DELETE FROM global_stock 
                    WHERE productId = ? 
                    AND id NOT IN (
                        SELECT MIN(id) 
                        FROM global_stock 
                        WHERE productId = ?
                    )
                `, [dup.productId, dup.productId]);
            }
        }

        // 2. Ensure all products have global_stock entry
        await queryRunner.query(`
            INSERT INTO global_stock (productId, quantity)
            SELECT p.id, 0
            FROM product p
            LEFT JOIN global_stock gs ON p.id = gs.productId
            WHERE gs.id IS NULL
        `);

        // 3. Add UNIQUE constraint
        await queryRunner.query(`
            ALTER TABLE global_stock 
            ADD CONSTRAINT UQ_global_stock_productId UNIQUE (productId)
        `);

        // 4. Make productId NOT NULL (if not already)
        await queryRunner.query(`
            ALTER TABLE global_stock 
            MODIFY COLUMN productId INT NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove UNIQUE constraint
        await queryRunner.query(`
            ALTER TABLE global_stock 
            DROP INDEX UQ_global_stock_productId
        `);

        // Revert productId to nullable (if needed)
        await queryRunner.query(`
            ALTER TABLE global_stock 
            MODIFY COLUMN productId INT NULL
        `);
    }
}
