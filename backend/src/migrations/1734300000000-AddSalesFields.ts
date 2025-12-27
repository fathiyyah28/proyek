import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSalesFields1734300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add pricePerMl to Product (nullable first)
        await queryRunner.addColumn('product', new TableColumn({
            name: 'pricePerMl',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
        }));

        // 2. Populate pricePerMl from existing price (assume price = 100ml)
        await queryRunner.query(`
            UPDATE product 
            SET pricePerMl = price / 100 
            WHERE price IS NOT NULL
        `);

        // 3. Set pricePerMl NOT NULL
        await queryRunner.changeColumn('product', 'pricePerMl', new TableColumn({
            name: 'pricePerMl',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
        }));

        // 4. Make old price nullable (for backward compatibility)
        await queryRunner.changeColumn('product', 'price', new TableColumn({
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
        }));

        // 5. Add purchaseType to SalesRecord (nullable first)
        await queryRunner.addColumn('sales_record', new TableColumn({
            name: 'purchaseType',
            type: 'enum',
            enum: ['REFILL', 'NEW_BOTTLE'],
            isNullable: true,
        }));

        // 6. Add volumeMl to SalesRecord (nullable first)
        await queryRunner.addColumn('sales_record', new TableColumn({
            name: 'volumeMl',
            type: 'int',
            isNullable: true,
        }));

        // 7. Populate default values for existing records
        await queryRunner.query(`
            UPDATE sales_record 
            SET purchaseType = 'NEW_BOTTLE', volumeMl = 100 
            WHERE purchaseType IS NULL
        `);

        // 8. Set NOT NULL
        await queryRunner.changeColumn('sales_record', 'purchaseType', new TableColumn({
            name: 'purchaseType',
            type: 'enum',
            enum: ['REFILL', 'NEW_BOTTLE'],
            isNullable: false,
        }));

        await queryRunner.changeColumn('sales_record', 'volumeMl', new TableColumn({
            name: 'volumeMl',
            type: 'int',
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('sales_record', 'volumeMl');
        await queryRunner.dropColumn('sales_record', 'purchaseType');
        await queryRunner.dropColumn('product', 'pricePerMl');

        // Restore price to NOT NULL
        await queryRunner.changeColumn('product', 'price', new TableColumn({
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
        }));
    }
}
