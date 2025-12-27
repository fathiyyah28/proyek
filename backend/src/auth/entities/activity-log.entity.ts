import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user.entity';

@Entity()
export class ActivityLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    userRole: UserRole;

    @Column()
    action: string;  // CREATE, UPDATE, DELETE

    @Column()
    entity: string;  // Product, Branch, User, Sales, etc.

    @Column({ nullable: true })
    entityId: number;

    @Column({ type: 'json', nullable: true })
    metadata: any;  // Additional context (URL, body, etc.)

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(() => User, { nullable: true })
    user: User;
}
