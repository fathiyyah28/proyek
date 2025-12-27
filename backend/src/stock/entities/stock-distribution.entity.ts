import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class StockDistribution {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    branchId: number;

    @Column()
    productId: number;

    @ManyToOne(() => Branch)
    branch: Branch;

    @ManyToOne(() => Product)
    product: Product;

    @Column('int')
    quantity: number;

    @CreateDateColumn()
    distributedAt: Date;

    @Column({ default: 'PENDING' }) // PENDING, RECEIVED
    status: string;
}
