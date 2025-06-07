import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Shop } from '../models/Shop';
import { Producer } from '../models/Producer';
import PerformanceService from '../services/performanceService';
import cacheService from '../services/cacheService';
import { catchAsync } from '../services/errorService';

// Get all shops for a producer
export const getProducerShops = catchAsync(async (req: Request, res: Response) => {
  const producerId = req.user?.userId;
  if (!producerId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const cacheKey = `producer:${producerId}:shops`;
  
  const shops = await cacheService.getOrSet(cacheKey, async () => {
    const shopRepository = AppDataSource.getRepository(Shop);
    const producerRepository = AppDataSource.getRepository(Producer);
    
    const producer = await producerRepository.findOne({
      where: { user: { id: producerId } }
    });

    if (!producer) {
      throw new Error('Producer not found');
    }

    return await shopRepository.find({
      where: { producer: { id: producer.id } },
      relations: ['products'],
      order: { createdAt: 'DESC' }
    });
  }, 300); // 5 minutes cache

  return res.json(shops);
});

// Create new shop (for producers)
export const createShop = catchAsync(async (req: Request, res: Response) => {
  const shopRepository = AppDataSource.getRepository(Shop);
  const producerRepository = AppDataSource.getRepository(Producer);
  
  const producerId = req.user?.userId;
  if (!producerId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const producer = await producerRepository.findOne({
    where: { user: { id: producerId } }
  });

  if (!producer) {
    return res.status(404).json({ message: 'Producer not found' });
  }

  const shop = new Shop();
  Object.assign(shop, req.body);
  shop.producer = producer;

  const savedShop = await shopRepository.save(shop);
  
  // Invalidate caches
  await Promise.all([
    cacheService.del(`producer:${producerId}:shops`),
    cacheService.invalidatePattern('shops:*'),
    PerformanceService.invalidateProductCache(undefined, savedShop.id, producer.id)
  ]);

  return res.status(201).json(savedShop);
});

// Update shop (for producers)
export const updateShop = async (req: Request, res: Response) => {
  try {
    const shopRepository = AppDataSource.getRepository(Shop);
    const producerRepository = AppDataSource.getRepository(Producer);
    
    const shopId = req.params.id;
    const producerId = req.user?.userId;
    
    const producer = await producerRepository.findOne({
      where: { user: { id: producerId } }
    });

    if (!producer) {
      return res.status(404).json({ message: 'Producer not found' });
    }

    const shop = await shopRepository.findOne({
      where: { id: shopId, producer: { id: producer.id } }
    });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }    Object.assign(shop, req.body);
    await shopRepository.save(shop);
    return res.json(shop);
  } catch (error) {
    console.error('Error updating shop:', error);
    return res.status(500).json({ message: 'Error updating shop' });
  }
};

// Delete shop (for producers)
export const deleteShop = async (req: Request, res: Response) => {
  try {
    const shopRepository = AppDataSource.getRepository(Shop);
    const producerRepository = AppDataSource.getRepository(Producer);
    
    const shopId = req.params.id;
    const producerId = req.user?.userId;
    
    const producer = await producerRepository.findOne({
      where: { user: { id: producerId } }
    });

    if (!producer) {
      return res.status(404).json({ message: 'Producer not found' });
    }

    const shop = await shopRepository.findOne({
      where: { id: shopId, producer: { id: producer.id } }
    });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }    await shopRepository.remove(shop);
    return res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return res.status(500).json({ message: 'Error deleting shop' });
  }
};

// Get shop by ID (public)
export const getShopById = async (req: Request, res: Response) => {
  try {
    const shopRepository = AppDataSource.getRepository(Shop);
    const shopId = req.params.id;
    
    const shop = await shopRepository.findOne({
      where: { id: shopId, isActive: true },
      relations: ['producer', 'products']
    });    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    return res.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    return res.status(500).json({ message: 'Error fetching shop' });
  }
};

// Get all active shops (public)
export const getAllShops = async (_req: Request, res: Response) => {
  try {
    const shopRepository = AppDataSource.getRepository(Shop);
      const shops = await shopRepository.find({
      where: { isActive: true },
      relations: ['producer', 'products']
    });
    
    return res.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    return res.status(500).json({ message: 'Error fetching shops' });
  }
};
