import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class BranchStock {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    branchId: number;

    @Column()
    productId: number;

    @ManyToOne(() => Branch, (branch) => branch.stock)
    branch: Branch;

    @ManyToOne(() => Product, (product) => product.branchStock)
    product: Product;

    @Column('int', { default: 0 })
    quantity: number;
}
