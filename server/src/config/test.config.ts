import { DataSourceOptions } from 'typeorm';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order, OrderItem } from '../models/Order';
import { Producer } from '../models/Producer';
import { Customer } from '../models/Customer';
import { Shop } from '../models/Shop';
import { PaymentMethod } from '../models/PaymentMethod';
import { Address } from '../models/Address';
import { Cart, CartItem } from '../models/Cart';

export const testConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'community_market_test',
  entities: [
    User,
    Product,
    Order,
    OrderItem,
    Producer,
    Customer,
    Shop,
    PaymentMethod,
    Address,
    Cart,
    CartItem
  ],
  synchronize: true,
  dropSchema: true,
  logging: false
}; 