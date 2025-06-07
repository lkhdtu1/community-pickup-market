import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Producer } from './Producer';
import { Product } from './Product';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Producer, producer => producer.shops)
  @JoinColumn()
  producer: Producer;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column('text', { array: true, nullable: true })
  specialties: string[];

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column('text', { array: true, nullable: true })
  certifications: string[];

  @Column('jsonb', { nullable: true })
  pickupInfo: {
    location: string;
    hours: string;
    instructions: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Product, product => product.shop)
  products: Product[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
