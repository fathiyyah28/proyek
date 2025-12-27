import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Product } from '../../products/entities/product.entity';

export enum PurchaseType {
    REFILL = 'REFILL',
    NEW_BOTTLE = 'NEW_BOTTLE',
}

export enum TransactionSource {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}

@Entity()
export class SalesRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    employeeId: number;

    @Column()
    branchId: number;

    @Column()
    productId: number;

    // NEW: Jenis pembelian (Refill atau Botol Baru)
    @Column({
        type: 'enum',
        enum: PurchaseType,
    })
    purchaseType: PurchaseType;

    // NEW: Volume dalam mililiter (30, 50, 100, 150)
    @Column('int')
    volumeMl: number;

    @ManyToOne(() => User)
    employee: User;

    @ManyToOne(() => Branch)
    branch: Branch;

    @ManyToOne(() => Product)
    product: Product;

    @Column('int')
    quantitySold: number;

    @Column('decimal', { precision: 10, scale: 2 })
    totalPrice: number;

    @Column({
        type: 'enum',
        enum: TransactionSource,
        default: TransactionSource.OFFLINE
    })
    source: TransactionSource;

    @Column({ nullable: true })
    orderId: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    transactionDate: Date;

    @CreateDateColumn()
    createdAt: Date;
}
