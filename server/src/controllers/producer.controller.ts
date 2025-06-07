import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Producer } from '../models/Producer';
import { Product } from '../models/Product';
import { Order, OrderStatus } from '../models/Order';
import { In } from 'typeorm';

// Get producer profile
export const getProducerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const producerRepository = AppDataSource.getRepository(Producer);
    
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'shops']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    const formattedProducer = {
      id: producer.id,
      email: producer.user.email,
      isActive: producer.isActive,
      createdAt: producer.createdAt,
      updatedAt: producer.updatedAt,
      shops: producer.shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        description: shop.description,
        address: shop.address,
        phone: shop.phone,
        email: shop.email,
        specialties: shop.specialties || [],
        images: shop.images || [],
        certifications: shop.certifications || [],
        pickupInfo: shop.pickupInfo,
        isActive: shop.isActive,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt
      }))
    };

    res.json(formattedProducer);
  } catch (error) {
    console.error('Error fetching producer profile:', error);
    res.status(500).json({ message: 'Error fetching producer profile' });
  }
};

// Update producer profile
export const updateProducerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const producerRepository = AppDataSource.getRepository(Producer);
    const { isActive } = req.body;
    
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    // Update producer fields
    if (isActive !== undefined) producer.isActive = isActive;
    producer.updatedAt = new Date();

    await producerRepository.save(producer);

    const formattedProducer = {
      id: producer.id,
      email: producer.user.email,
      isActive: producer.isActive,
      createdAt: producer.createdAt,
      updatedAt: producer.updatedAt
    };

    res.json(formattedProducer);
  } catch (error) {
    console.error('Error updating producer profile:', error);
    res.status(500).json({ message: 'Error updating producer profile' });
  }
};

// Get producer stats
export const getProducerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const producerRepository = AppDataSource.getRepository(Producer);
    const productRepository = AppDataSource.getRepository(Product);
    const orderRepository = AppDataSource.getRepository(Order);
    
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['shops']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    const shopIds = producer.shops.map(shop => shop.id);

    // Get total shops count
    const totalShops = producer.shops.length;

    // Get total products count
    let totalProducts = 0;
    if (shopIds.length > 0) {
      totalProducts = await productRepository.count({
        where: { shop: { id: In(shopIds) } }
      });
    }

    // Get total orders count and revenue
    const orders = await orderRepository.find({
      where: { producer: { id: producer.id } }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    // Get orders by status
    const pendingOrders = orders.filter(order => order.status === OrderStatus.PENDING).length;
    const preparedOrders = orders.filter(order => order.status === OrderStatus.PREPARED).length;
    const readyOrders = orders.filter(order => order.status === OrderStatus.READY).length;
    const pickedUpOrders = orders.filter(order => order.status === OrderStatus.PICKED_UP).length;

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= sevenDaysAgo
    ).length;

    const stats = {
      totalShops,
      totalProducts,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      ordersByStatus: {
        pending: pendingOrders,
        prepared: preparedOrders,
        ready: readyOrders,
        pickedUp: pickedUpOrders
      },
      recentOrders
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching producer stats:', error);
    res.status(500).json({ message: 'Error fetching producer stats' });
  }
};

// Get all producers (for customers)
export const getAllProducers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const producerRepository = AppDataSource.getRepository(Producer);
    
    const producers = await producerRepository.find({
      where: { isActive: true },
      relations: ['shops', 'user'],
      order: { createdAt: 'DESC' }
    });

    const formattedProducers = producers.map(producer => ({
      id: producer.id,
      name: producer.user.email,
      shops: producer.shops.filter(shop => shop.isActive).map(shop => ({
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

    res.json(formattedProducers);
  } catch (error) {
    console.error('Error fetching producers:', error);
    res.status(500).json({ message: 'Error fetching producers' });
  }
};

// Get producer public profile by ID
export const getProducerPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const producerRepository = AppDataSource.getRepository(Producer);
    
    const producer = await producerRepository.findOne({
      where: { id, isActive: true },
      relations: ['shops', 'user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer not found' });
      return;
    }

    const formattedProducer = {
      id: producer.id,
      name: producer.user.email,
      shops: producer.shops.filter(shop => shop.isActive).map(shop => ({
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
    };

    res.json(formattedProducer);
  } catch (error) {
    console.error('Error fetching producer public profile:', error);
    res.status(500).json({ message: 'Error fetching producer public profile' });
  }
};
