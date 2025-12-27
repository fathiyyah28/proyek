import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateActivityLogs1734301000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'activity_log',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'userId',
                        type: 'int',
                    },
                    {
                        name: 'userRole',
                        type: 'enum',
                        enum: ['OWNER', 'EMPLOYEE', 'CUSTOMER'],
                    },
                    {
                        name: 'action',
                        type: 'varchar',
                        length: '50',
                    },
                    {
                        name: 'entity',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'entityId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['userId'],
                        referencedTableName: 'user',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('activity_log');
    }
}
