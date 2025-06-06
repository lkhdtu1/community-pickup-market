import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../models/User';
import { Producer } from '../models/Producer';
import { Product } from '../models/Product';

// Get producer profile
export const getProducerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const producerRepository = AppDataSource.getRepository(Producer);
    const userRepository = AppDataSource.getRepository(User);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOne({ 
      where: { id: req.user.userId } 
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const producer = await producerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    res.json({
      id: producer.id,
      shopName: producer.shopName,
      description: producer.description,
      address: producer.address,
      certifications: producer.certifications,
      pickupInfo: producer.pickupInfo,
      isActive: producer.isActive,
      email: user.email,
      createdAt: producer.createdAt,
      updatedAt: producer.updatedAt
    });
  } catch (error) {
    console.error('Get producer profile error:', error);
    res.status(500).json({ message: 'Error fetching producer profile' });
  }
};

// Update producer profile
export const updateProducerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const producerRepository = AppDataSource.getRepository(Producer);
    const userRepository = AppDataSource.getRepository(User);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOne({ 
      where: { id: req.user.userId } 
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const producer = await producerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    const { 
      shopName, 
      description, 
      address, 
      certifications, 
      pickupInfo, 
      isActive,
      email 
    } = req.body;

    // Update producer data
    if (shopName !== undefined) producer.shopName = shopName;
    if (description !== undefined) producer.description = description;
    if (address !== undefined) producer.address = address;
    if (certifications !== undefined) producer.certifications = certifications;
    if (pickupInfo !== undefined) producer.pickupInfo = pickupInfo;
    if (isActive !== undefined) producer.isActive = isActive;

    await producerRepository.save(producer);

    // Update user email if provided
    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }
      user.email = email;
      await userRepository.save(user);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update producer profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Get producer statistics
export const getProducerStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // For now, return mock data since we don't have order/product analytics yet
    const mockStats = {
      totalSales: 15840.50,
      totalOrders: 127,
      activeProducts: 23,
      averageRating: 4.8,
      monthlyRevenue: [
        { month: 'Jan', revenue: 2840 },
        { month: 'Fév', revenue: 3220 },
        { month: 'Mar', revenue: 2980 },
        { month: 'Avr', revenue: 3450 },
        { month: 'Mai', revenue: 3350 }
      ],
      topProducts: [
        { name: 'Tomates cerises bio', sales: 45, revenue: 1350 },
        { name: 'Pain de campagne', sales: 89, revenue: 890 },
        { name: 'Miel de lavande', sales: 23, revenue: 920 }
      ],
      recentOrders: [
        { id: 1, customer: 'Marie D.', total: 45.80, status: 'En préparation' },
        { id: 2, customer: 'Jean P.', total: 32.50, status: 'Prête' },
        { id: 3, customer: 'Sophie L.', total: 68.90, status: 'Récupérée' }
      ]
    };

  res.json(mockStats);
  } catch (error) {
    console.error('Get producer stats error:', error);
    res.status(500).json({ message: 'Error fetching producer statistics' });
  }
};

// Note: Producer orders are now handled by the order controller

// Get all producers (for customers to browse)
export const getAllProducers = async (req: Request, res: Response): Promise<void> => {
  try {
    const producerRepository = AppDataSource.getRepository(Producer);
    const { search } = req.query;

    const queryBuilder = producerRepository.createQueryBuilder('producer')
      .leftJoinAndSelect('producer.user', 'user')
      .where('producer.isActive = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere(
        '(producer.shopName ILIKE :search OR producer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder.orderBy('producer.createdAt', 'DESC');

    const producers = await queryBuilder.getMany();

    // Format producers for frontend
    const formattedProducers = producers.map(producer => ({
      id: producer.id,
      name: producer.shopName,
      description: producer.description || 'Producteur local passionné',
      specialties: producer.certifications || [],
      image: '/placeholder.svg', // You can add an image field to Producer model later
      location: producer.address || 'Adresse non renseignée',
      pickupInfo: producer.pickupInfo,
      certifications: producer.certifications,
      isActive: producer.isActive
    }));

    res.json(formattedProducers);
  } catch (error) {
    console.error('Error fetching producers:', error);
    res.status(500).json({ message: 'Error fetching producers' });
  }
};

// Get producer public profile (for customers)
export const getProducerPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const producerRepository = AppDataSource.getRepository(Producer);
    const productRepository = AppDataSource.getRepository(Product);
    const { id } = req.params;

    const producer = await producerRepository.findOne({
      where: { id, isActive: true },
      relations: ['user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer not found' });
      return;
    }

    // Get producer's available products
    const products = await productRepository.find({
      where: { 
        producer: { id: producer.id },
        isAvailable: true
      },
      order: { createdAt: 'DESC' }
    });

    // Format products
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.toString()),
      unit: product.unit,
      category: product.category,
      image: product.images?.[0] || '/placeholder.svg',
      stock: product.stock
    }));

    const formattedProducer = {
      id: producer.id,
      name: producer.shopName,
      description: producer.description,
      address: producer.address,
      certifications: producer.certifications || [],
      pickupInfo: producer.pickupInfo,
      products: formattedProducts,
      productsCount: formattedProducts.length
    };

    res.json(formattedProducer);
  } catch (error) {
    console.error('Error fetching producer public profile:', error);
    res.status(500).json({ message: 'Error fetching producer profile' });
  }
};
