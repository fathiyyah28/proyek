import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum DeliveryMethod {
    PICKUP = 'PICKUP',
    DELIVERY = 'DELIVERY',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customerId: number;

    @ManyToOne(() => User)
    customer: User;

    @Column()
    branchId: number;

    @ManyToOne(() => Branch)
    branch: Branch;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING_PAYMENT,
    })
    status: OrderStatus;

    @Column({
        type: 'enum',
        enum: DeliveryMethod,
    })
    deliveryMethod: DeliveryMethod;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ nullable: true })
    proofOfPayment: string;

    @Column({ nullable: true })
    deliveryAddress: string;

    @Column({ nullable: true })
    deliveryPhone: string;

    @Column({ nullable: true, type: 'text' })
    notes: string;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
