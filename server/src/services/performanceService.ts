import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '../database';
import cacheService from './cacheService';
import { Product } from '../models/Product';
import { Order, OrderStatus } from '../models/Order';
import { Producer } from '../models/Producer';

// Cache key generators (matching the structure in cacheService)
const cacheKeys = {
  products: (filters?: any) => `products:${filters ? JSON.stringify(filters) : 'all'}`,
  product: (id: string) => `product:${id}`,
  producer: (id: string) => `producer:${id}`,
  producerStats: (id: string) => `producer:${id}:stats`,
  producerOrders: (id: string) => `producer:${id}:orders`,
  customerOrders: (id: string) => `customer:${id}:orders`,
  shops: (producerId?: string) => `shops:${producerId || 'all'}`,
  analytics: (producerId: string, period: string) => `analytics:${producerId}:${period}`
};

export class PerformanceService {
  // Optimized product queries with caching
  static async getProducts(filters: {
    category?: string;
    search?: string;
    producerId?: string;
    shopId?: string;
    isAvailable?: boolean;
  } = {}) {
    const cacheKey = cacheKeys.products(filters);
    
    return cacheService.getOrSet(cacheKey, async () => {
      const productRepository = AppDataSource.getRepository(Product);
      
      const queryBuilder = productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.shop', 'shop')
        .leftJoinAndSelect('shop.producer', 'producer')
        .where('product.isAvailable = :isAvailable', { 
          isAvailable: filters.isAvailable ?? true 
        });

      // Apply filters efficiently
      if (filters.category) {
        queryBuilder.andWhere('product.category = :category', { category: filters.category });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search OR shop.name ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.producerId) {
        queryBuilder.andWhere('shop.producerId = :producerId', { producerId: filters.producerId });
      }

      if (filters.shopId) {
        queryBuilder.andWhere('product.shopId = :shopId', { shopId: filters.shopId });
      }

      // Optimize ordering and limit for performance
      queryBuilder
        .orderBy('product.createdAt', 'DESC')
        .limit(100); // Prevent excessive data loading

      const products = await queryBuilder.getMany();

      // Format for frontend
      return products.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.toString()),
        unit: product.unit,
        category: product.category,
        description: product.description,
        image: product.images?.[0] || '/placeholder.svg',
        images: product.images || [],
        producer: product.shop.name,
        producerId: product.shop.producer.id,
        shopId: product.shop.id,
        stock: product.stock,
        isAvailable: product.isAvailable
      }));
    }, 300); // 5 minutes cache
  }

  // Optimized producer queries with caching
  static async getProducers(filters: {
    search?: string;
    isActive?: boolean;
  } = {}) {
    const cacheKey = `producers:list:${filters.search || 'all'}:${filters.isActive ?? true}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      const producerRepository = AppDataSource.getRepository(Producer);
      
      const queryBuilder = producerRepository
        .createQueryBuilder('producer')
        .leftJoinAndSelect('producer.user', 'user')
        .leftJoinAndSelect('producer.shops', 'shops')
        .where('producer.isActive = :isActive', { 
          isActive: filters.isActive ?? true 
        });

      // Apply search filter
      if (filters.search) {
        queryBuilder.andWhere(
          '(user.email ILIKE :search OR shops.name ILIKE :search OR shops.description ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      // Optimize ordering and limit for performance
      queryBuilder
        .orderBy('producer.createdAt', 'DESC')
        .limit(50); // Prevent excessive data loading

      const producers = await queryBuilder.getMany();

      // Format for frontend
      return producers.map(producer => ({
        id: producer.id,
        name: producer.user.email,
        shops: producer.shops
          .filter(shop => shop.isActive)
          .map(shop => ({
            id: shop.id,
            name: shop.name,
            description: shop.description,
            address: shop.address,
            specialties: shop.specialties || [],
            images: shop.images || [],
            certifications: shop.certifications || [],
            pickupInfo: shop.pickupInfo
          })),
        createdAt: producer.createdAt
      }));
    }, 300); // 5 minutes cache
  }

  // Optimized order queries with pagination
  static async getOrdersForProducer(
    producerId: string, 
    options: {
      page?: number;
      limit?: number;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const { page = 1, limit = 50 } = options;    const cacheKey = `${cacheKeys.producerOrders(producerId)}:${JSON.stringify(options)}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      const orderRepository = AppDataSource.getRepository(Order);
      
      const queryBuilder = orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('customer.user', 'customerUser')
        .where('order.producerId = :producerId', { producerId });

      // Apply filters
      if (options.status) {
        queryBuilder.andWhere('order.status = :status', { status: options.status });
      }

      if (options.startDate) {
        queryBuilder.andWhere('order.createdAt >= :startDate', { startDate: options.startDate });
      }

      if (options.endDate) {
        queryBuilder.andWhere('order.createdAt <= :endDate', { endDate: options.endDate });
      }

      // Pagination and ordering
      const skip = (page - 1) * limit;
      queryBuilder
        .orderBy('order.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const [orders, total] = await queryBuilder.getManyAndCount();

      return {
        orders: orders.map(order => ({
          id: order.id,
          customerName: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim(),
          customerEmail: order.customer.user?.email || '',
          total: parseFloat(order.total.toString()),
          status: order.status,
          orderDate: order.createdAt.toISOString().split('T')[0],
          pickupDate: order.pickupDate ? order.pickupDate.toISOString().split('T')[0] : null,
          items: order.items.map(item => ({
            id: item.id,
            productName: item.productName, // Use productName from OrderItem
            quantity: item.quantity,
            price: parseFloat(item.unitPrice.toString()) // Use unitPrice from OrderItem
          }))
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    }, 180); // 3 minutes cache for orders
  }
  // Optimized analytics with aggressive caching
  static async getProducerAnalytics(producerId: string, period: string = 'month') {
    const cacheKey = cacheKeys.analytics(producerId, period);
    
    return cacheService.getOrSet(cacheKey, async () => {
      const orderRepository = AppDataSource.getRepository(Order);
      
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Single optimized query for all analytics
      const orders = await orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('order.customer', 'customer')
        .where('order.producerId = :producerId', { producerId })
        .andWhere('order.createdAt >= :startDate', { startDate })
        .getMany();

      // Calculate metrics in memory (faster than multiple DB queries)
      const completedOrders = orders.filter(o => o.status === OrderStatus.PICKED_UP);
      const totalRevenue = completedOrders.reduce((sum, order) => 
        sum + parseFloat(order.total.toString()), 0
      );
      
      const uniqueCustomers = new Set(orders.map(o => o.customer.id)).size;
      const averageOrderValue = completedOrders.length > 0 ? 
        totalRevenue / completedOrders.length : 0;

      // Product analytics using OrderItem data
      const productStats = new Map();
      orders.forEach(order => {
        order.items.forEach(item => {
          const productName = item.productName; // Use productName from OrderItem
          if (!productStats.has(productName)) {
            productStats.set(productName, { totalSold: 0, revenue: 0 });
          }
          const stats = productStats.get(productName);
          stats.totalSold += item.quantity;
          stats.revenue += item.quantity * parseFloat(item.unitPrice.toString()); // Use unitPrice
        });
      });

      const topProducts = Array.from(productStats.entries())
        .map(([productName, stats]) => ({ productName, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        customerCount: uniqueCustomers,
        topProducts,
        period,
        generatedAt: new Date().toISOString()
      };
    }, 600); // 10 minutes cache for analytics
  }
  // Cache invalidation helpers
  static async invalidateProductCache(productId?: string, shopId?: string, producerId?: string) {
    const patterns = [
      'products:*',
      productId ? cacheKeys.product(productId) : null,
      shopId ? `shops:*${shopId}*` : null,
      producerId ? `producer:${producerId}:*` : null
    ].filter(Boolean) as string[];

    await Promise.all(patterns.map(pattern => 
      pattern.includes('*') ? 
        cacheService.invalidatePattern(pattern) : 
        cacheService.del(pattern)
    ));
  }

  static async invalidateOrderCache(producerId?: string, customerId?: string) {
    const patterns = [
      producerId ? `producer:${producerId}:*` : null,
      customerId ? cacheKeys.customerOrders(customerId) : null,
      'analytics:*'
    ].filter(Boolean) as string[];

    await Promise.all(patterns.map(pattern => 
      pattern.includes('*') ? 
        cacheService.invalidatePattern(pattern) : 
        cacheService.del(pattern)
    ));
  }

  // Database query optimization helpers
  static addCommonJoins(queryBuilder: SelectQueryBuilder<any>, entityName: string) {
    // Add commonly needed joins to reduce N+1 queries
    if (entityName === 'order') {
      queryBuilder
        .leftJoinAndSelect(`${entityName}.items`, 'items')
        .leftJoinAndSelect('items.product', 'product')
        .leftJoinAndSelect(`${entityName}.customer`, 'customer')
        .leftJoinAndSelect('customer.user', 'customerUser');
    }
    
    if (entityName === 'product') {
      queryBuilder
        .leftJoinAndSelect(`${entityName}.shop`, 'shop')
        .leftJoinAndSelect('shop.producer', 'producer');
    }
    
    return queryBuilder;
  }
  // Batch operations for better performance
  static async batchUpdateOrderStatus(orderIds: string[], status: OrderStatus, producerId: string) {
    const orderRepository = AppDataSource.getRepository(Order);
    
    // Batch update
    await orderRepository
      .createQueryBuilder()
      .update(Order)
      .set({ status: status })
      .where('id IN (:...orderIds)', { orderIds })
      .andWhere('producerId = :producerId', { producerId })
      .execute();

    // Invalidate related caches
    await this.invalidateOrderCache(producerId);
    
    return true;
  }
}

export default PerformanceService;
