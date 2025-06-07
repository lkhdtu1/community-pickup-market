import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Shop } from '../models/Shop';
import { Producer } from '../models/Producer';

// Get all shops for a producer
export const getProducerShops = async (req: Request, res: Response) => {
  try {
    const shopRepository = AppDataSource.getRepository(Shop);
    const producerRepository = AppDataSource.getRepository(Producer);
    
    const producerId = req.user?.userId;
    const producer = await producerRepository.findOne({
      where: { user: { id: producerId } }
    });

    if (!producer) {
      return res.status(404).json({ message: 'Producer not found' });
    }    const shops = await shopRepository.find({
      where: { producer: { id: producer.id } },
      relations: ['products']
    });
    
    return res.json(shops);
  } catch (error) {
    console.error('Error fetching producer shops:', error);
    return res.status(500).json({ message: 'Error fetching producer shops' });
  }
};

// Create new shop (for producers)
export const createShop = async (req: Request, res: Response) => {
  try {
    const shopRepository = AppDataSource.getRepository(Shop);
    const producerRepository = AppDataSource.getRepository(Producer);
    
    const producerId = req.user?.userId;
    const producer = await producerRepository.findOne({
      where: { user: { id: producerId } }
    });

    if (!producer) {
      return res.status(404).json({ message: 'Producer not found' });
    }    const shop = new Shop();
    Object.assign(shop, req.body);
    shop.producer = producer;

    await shopRepository.save(shop);
    return res.status(201).json(shop);
  } catch (error) {
    console.error('Error creating shop:', error);
    return res.status(500).json({ message: 'Error creating shop' });
  }
};

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
