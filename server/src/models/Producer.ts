import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { Shop } from './Shop';

@Entity('producers')
export class Producer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ default: true })
  isActive: boolean;

  // Personal Information
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  // Business Information
  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  businessType: string;

  @Column({ nullable: true })
  siretNumber: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ type: 'text', nullable: true })
  businessAddress: string;

  // Farm/Production Information
  @Column({ nullable: true })
  farmName: string;

  @Column({ type: 'text', nullable: true })
  farmDescription: string;

  @Column({ nullable: true })
  farmSize: string;

  @Column('simple-array', { nullable: true })
  productionMethods: string[];

  @Column('simple-array', { nullable: true })
  certifications: string[];

  // Contact & Schedule
  @Column({ nullable: true })
  contactHours: string;

  @Column({ nullable: true })
  websiteUrl: string;

  @Column('simple-json', { nullable: true })
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };

  @OneToMany(() => Shop, shop => shop.producer)
  shops: Shop[];

  @OneToMany(() => Order, order => order.producer)
  orders: Order[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}