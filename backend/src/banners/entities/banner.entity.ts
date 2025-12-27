import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    subtitle: string;

    @Column()
    imageUrl: string;

    @Column({ nullable: true })
    ctaText: string;

    @Column({ nullable: true })
    ctaLink: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    position: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
