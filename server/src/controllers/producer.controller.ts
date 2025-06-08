import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Producer } from '../models/Producer';
import { Product } from '../models/Product';
import { Order, OrderStatus } from '../models/Order';
import { In } from 'typeorm';

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

    res.json({ producers: formattedProducers, pagination: { page: 1, limit: 20, total: formattedProducers.length, totalPages: 1 } });
  } catch (error) {
    console.error('Error fetching producers:', error);
    res.status(500).json({ message: 'Error fetching producers' });
  }
};

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

export const getProducerInformation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const producerRepository = AppDataSource.getRepository(Producer);
    
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    const producerInfo = {
      firstName: producer.firstName || '',
      lastName: producer.lastName || '',
      email: producer.user.email,
      phone: producer.phone || '',
      businessName: producer.businessName || '',
      businessType: producer.businessType || '',
      siretNumber: producer.siretNumber || '',
      vatNumber: producer.vatNumber || '',
      businessAddress: producer.businessAddress || '',
      farmName: producer.farmName || '',
      farmDescription: producer.farmDescription || '',
      farmSize: producer.farmSize || '',
      productionMethods: producer.productionMethods || [],
      certifications: producer.certifications || [],
      contactHours: producer.contactHours || '',
      websiteUrl: producer.websiteUrl || '',
      socialMedia: producer.socialMedia || {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    };

    res.json(producerInfo);
  } catch (error) {
    console.error('Error fetching producer information:', error);
    res.status(500).json({ message: 'Error fetching producer information' });
  }
};

export const updateProducerInformation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const producerRepository = AppDataSource.getRepository(Producer);
    const {
      firstName,
      lastName,
      phone,
      businessName,
      businessType,
      siretNumber,
      vatNumber,
      businessAddress,
      farmName,
      farmDescription,
      farmSize,
      productionMethods,
      certifications,
      contactHours,
      websiteUrl,
      socialMedia
    } = req.body;
    
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    // Update producer information
    if (firstName !== undefined) producer.firstName = firstName;
    if (lastName !== undefined) producer.lastName = lastName;
    if (phone !== undefined) producer.phone = phone;
    if (businessName !== undefined) producer.businessName = businessName;
    if (businessType !== undefined) producer.businessType = businessType;
    if (siretNumber !== undefined) producer.siretNumber = siretNumber;
    if (vatNumber !== undefined) producer.vatNumber = vatNumber;
    if (businessAddress !== undefined) producer.businessAddress = businessAddress;
    if (farmName !== undefined) producer.farmName = farmName;
    if (farmDescription !== undefined) producer.farmDescription = farmDescription;
    if (farmSize !== undefined) producer.farmSize = farmSize;
    if (productionMethods !== undefined) producer.productionMethods = productionMethods;
    if (certifications !== undefined) producer.certifications = certifications;
    if (contactHours !== undefined) producer.contactHours = contactHours;
    if (websiteUrl !== undefined) producer.websiteUrl = websiteUrl;
    if (socialMedia !== undefined) producer.socialMedia = socialMedia;
    
    producer.updatedAt = new Date();

    await producerRepository.save(producer);

    const updatedInfo = {
      firstName: producer.firstName || '',
      lastName: producer.lastName || '',
      email: producer.user.email,
      phone: producer.phone || '',
      businessName: producer.businessName || '',
      businessType: producer.businessType || '',
      siretNumber: producer.siretNumber || '',
      vatNumber: producer.vatNumber || '',
      businessAddress: producer.businessAddress || '',
      farmName: producer.farmName || '',
      farmDescription: producer.farmDescription || '',
      farmSize: producer.farmSize || '',
      productionMethods: producer.productionMethods || [],
      certifications: producer.certifications || [],
      contactHours: producer.contactHours || '',
      websiteUrl: producer.websiteUrl || '',
      socialMedia: producer.socialMedia || {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    };

    res.json(updatedInfo);
  } catch (error) {
    console.error('Error updating producer information:', error);
    res.status(500).json({ message: 'Error updating producer information' });
  }
};
