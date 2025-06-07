import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './Customer';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, customer => customer.paymentMethods, { onDelete: 'CASCADE' })
  customer: Customer;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'card', 'wallet', 'bank_transfer'

  @Column({ type: 'varchar', length: 100 })
  cardLastFour: string; // Last 4 digits for display

  @Column({ type: 'varchar', length: 100 })
  cardBrand: string; // 'visa', 'mastercard', etc.

  @Column({ type: 'varchar', length: 7 })
  expiryMonth: string; // MM/YY format

  @Column({ type: 'varchar', length: 100, nullable: true })
  holderName?: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'text', nullable: true })
  stripePaymentMethodId?: string; // For Stripe integration

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
