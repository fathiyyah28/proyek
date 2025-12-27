import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { PurchaseType } from '../../sales/entities/sales-record.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    orderId: number;

    @ManyToOne(() => Order, (order) => order.items)
    order: Order;

    @Column()
    productId: number;

    @ManyToOne(() => Product)
    product: Product;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    priceAtPurchase: number;

    @Column({
        type: 'enum',
        enum: PurchaseType,
    })
    purchaseType: PurchaseType;

    @Column('int')
    volumeMl: number;
}
