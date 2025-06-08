import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Producer } from './models/Producer';
import { Customer } from './models/Customer';
import { Product } from './models/Product';
import { Shop } from './models/Shop';
import { Order, OrderItem } from './models/Order';
import { PaymentMethod } from './models/PaymentMethod';
import { Address } from './models/Address';
import { Cart, CartItem } from './models/Cart';
import { testConfig } from './config/test.config';

const isTest = process.env.NODE_ENV === 'test';

// Database configuration
export const AppDataSource = new DataSource(
  isTest ? testConfig : {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'community_market',
    synchronize: true,
    logging: true,
    entities: [User, Producer, Customer, Product, Shop, Order, OrderItem, PaymentMethod, Address, Cart, CartItem],
    subscribers: [],
    migrations: [],
  }
);
