import Redis from 'ioredis';

class CacheService {
  private redis: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });

        this.redis.on('connect', () => {
          console.log('✅ Redis connected successfully');
          this.isConnected = true;
        });

        this.redis.on('error', (error) => {
          console.warn('⚠️ Redis connection error (falling back to no cache):', error.message);
          this.isConnected = false;
        });

        this.redis.on('close', () => {
          console.log('📴 Redis connection closed');
          this.isConnected = false;
        });
      } else {
        console.log('ℹ️ Redis not configured - running without cache');
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize Redis (running without cache):', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.isConnected) {
      return null;
    }

    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string | string[]): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const keys = Array.isArray(key) ? key : [key];
      await this.redis.del(...keys);
      return true;
    } catch (error) {
      console.warn(`Cache delete error for key(s) ${key}:`, error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.warn(`Cache pattern invalidation error for ${pattern}:`, error);
      return false;
    }
  }

  // Cache key generators
  static keys = {
    products: (filters?: any) => `products:${filters ? JSON.stringify(filters) : 'all'}`,
    product: (id: string) => `product:${id}`,
    producer: (id: string) => `producer:${id}`,
    producerStats: (id: string) => `producer:${id}:stats`,
    producerOrders: (id: string) => `producer:${id}:orders`,
    customerOrders: (id: string) => `customer:${id}:orders`,
    shops: (producerId?: string) => `shops:${producerId || 'all'}`,
    analytics: (producerId: string, period: string) => `analytics:${producerId}:${period}`
  };

  // Helper method for cache-aside pattern
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFunction();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  isAvailable(): boolean {
    return this.isConnected && this.redis !== null;
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
