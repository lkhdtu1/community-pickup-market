import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../models/User';
import { Producer } from '../models/Producer';

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

// Get producer orders
export const getProducerOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    // For now, return mock data since Order entity doesn't exist yet
    const mockOrders = [
      {
        id: 1,
        customer: 'Marie Dupont',
        date: '2024-01-15',
        total: 45.80,
        status: 'pending',
        items: [
          { name: 'Tomates bio', quantity: 2, price: 15.80 },
          { name: 'Pain artisanal', quantity: 1, price: 8.50 },
          { name: 'Miel de lavande', quantity: 1, price: 21.50 }
        ],
        pickupTime: '2024-01-16 14:00',
        notes: 'Prévoir sac réutilisable'
      },
      {
        id: 2,
        customer: 'Jean Petit',
        date: '2024-01-14',
        total: 32.50,
        status: 'ready',
        items: [
          { name: 'Fromage de chèvre', quantity: 1, price: 18.00 },
          { name: 'Salade verte', quantity: 2, price: 7.25 },
          { name: 'Œufs fermiers', quantity: 1, price: 7.25 }
        ],
        pickupTime: '2024-01-15 16:30',
        notes: ''
      },
      {
        id: 3,
        customer: 'Sophie Laurent',
        date: '2024-01-13',
        total: 68.90,
        status: 'completed',
        items: [
          { name: 'Panier légumes de saison', quantity: 1, price: 35.00 },
          { name: 'Viande locale', quantity: 1, price: 25.90 },
          { name: 'Fruits bio', quantity: 1, price: 8.00 }
        ],
        pickupTime: '2024-01-14 10:00',
        notes: 'Client régulier'
      }
    ];

    res.json(mockOrders);
  } catch (error) {
    console.error('Get producer orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};
