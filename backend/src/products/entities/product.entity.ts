import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { GlobalStock } from '../../stock/entities/global-stock.entity';
import { BranchStock } from '../../stock/entities/branch-stock.entity';
import { SalesRecord } from '../../sales/entities/sales-record.entity';
import { StockDistribution } from '../../stock/entities/stock-distribution.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    // NEW: Harga per mililiter (untuk perhitungan dinamis)
    @Column('decimal', { precision: 10, scale: 2 })
    pricePerMl: number;

    // DEPRECATED: Untuk backward compatibility (bisa dihapus nanti)
    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    price: number;

    @Column()
    category: string;

    @Column({ nullable: true })
    imageUrl: string;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @OneToMany(() => GlobalStock, (stock) => stock.product)
    globalStock: GlobalStock[];

    @OneToMany(() => BranchStock, (stock) => stock.product)
    branchStock: BranchStock[];

    @OneToMany(() => SalesRecord, (sales) => sales.product)
    sales: SalesRecord[];

    @OneToMany(() => StockDistribution, (dist) => dist.product)
    distributions: StockDistribution[];
}
