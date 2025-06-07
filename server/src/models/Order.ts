import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Customer } from './Customer';
import { Producer } from './Producer';

export enum OrderStatus {
  PENDING = 'en_attente',
  PREPARED = 'preparee',
  READY = 'prete',
  PICKED_UP = 'retiree',
  CANCELLED = 'annulee'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => Producer, producer => producer.orders)
  @JoinColumn({ name: 'producerId' })
  producer: Producer;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ name: 'pickup_date', type: 'date', nullable: true })
  pickupDate: Date;

  @Column({ name: 'pickup_point' })
  pickupPoint: string;
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'payment_method_id', nullable: true })
  paymentMethodId: string;

  @Column({ name: 'payment_intent_id', nullable: true })
  paymentIntentId: string;

  @Column({ name: 'payment_status', default: 'pending' })
  paymentStatus: string; // pending, paid, failed, refunded

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'product_id', nullable: true })
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;
}
