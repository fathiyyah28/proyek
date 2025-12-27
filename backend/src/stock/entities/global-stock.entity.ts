import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class GlobalStock {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    productId: number;

    @OneToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn()
    product: Product;

    @Column('int', { default: 0 })
    quantity: number;
}
