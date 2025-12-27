import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum StockHistoryType {
    INITIAL = 'INITIAL',
    RESTOCK = 'RESTOCK',
    DISTRIBUTION = 'DISTRIBUTION',
    ADJUSTMENT = 'ADJUSTMENT' // For manual corrections if ever needed, though restricted
}

@Entity()
export class GlobalStockHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productId: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'int' })
    changeAmount: number; // Positive for IN, Negative for OUT

    @Column({ type: 'int' })
    previousBalance: number;

    @Column({ type: 'int' })
    newBalance: number;

    @Column({
        type: 'enum',
        enum: StockHistoryType,
        default: StockHistoryType.RESTOCK
    })
    type: StockHistoryType;

    @Column({ nullable: true })
    reason: string; // e.g. "Restock Supplier A", "Distribution to Branch X"

    @Column({ nullable: true })
    referenceId: string; // ID of distribution or other ref

    @CreateDateColumn()
    createdAt: Date;
}
