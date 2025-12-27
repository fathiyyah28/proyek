import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BranchStock } from '../../stock/entities/branch-stock.entity';
import { SalesRecord } from '../../sales/entities/sales-record.entity';
import { StockDistribution } from '../../stock/entities/stock-distribution.entity';

@Entity()
export class Branch {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column()
    contact: string;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;

    @OneToMany(() => User, (user) => user.branch)
    users: User[];

    @OneToMany(() => BranchStock, (stock) => stock.branch)
    stock: BranchStock[];

    @OneToMany(() => SalesRecord, (sales) => sales.branch)
    sales: SalesRecord[];

    @OneToMany(() => StockDistribution, (dist) => dist.branch)
    distributions: StockDistribution[];
}
