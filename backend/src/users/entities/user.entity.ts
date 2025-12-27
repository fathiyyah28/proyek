import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';

export enum UserRole {
    OWNER = 'OWNER',
    EMPLOYEE = 'EMPLOYEE',
    CUSTOMER = 'CUSTOMER',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;

    @Column({ nullable: true })
    branchId: number;

    @ManyToOne(() => Branch, (branch) => branch.users, { nullable: true })
    branch: Branch;
}
