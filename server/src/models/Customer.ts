import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { PaymentMethod } from './PaymentMethod';
import { Address } from './Address';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  address: string;
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date | null;
  @Column('jsonb', { nullable: true })
  preferences: {
    favoriteCategories: string[];
    notifications: boolean;
    newsletter: boolean;
  };
  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => PaymentMethod, paymentMethod => paymentMethod.customer)
  paymentMethods: PaymentMethod[];

  @OneToMany(() => Address, address => address.customer)
  addresses: Address[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 