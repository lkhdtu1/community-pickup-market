import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../models/User';
import { Customer } from '../models/Customer';

// Get customer profile
export const getCustomerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
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

    const customer = await customerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer profile not found' });
      return;
    }

    res.json({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      preferences: customer.preferences,
      email: user.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ message: 'Error fetching customer profile' });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
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

    const customer = await customerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer profile not found' });
      return;
    }

    const { firstName, lastName, phone, address, email } = req.body;

    // Update customer data
    if (firstName !== undefined) customer.firstName = firstName;
    if (lastName !== undefined) customer.lastName = lastName;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;

    await customerRepository.save(customer);

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
    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Get customer orders
export const getCustomerOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    // For now, return mock data since Order entity doesn't exist yet
    const mockOrders = [
      {
        id: 1,
        date: '2024-01-15',
        total: 45.80,
        status: 'completed',
        items: ['Tomates bio x2', 'Pain artisanal', 'Miel de lavande'],
        pickupPoint: 'Marché de Belleville',
        rating: 5
      },
      {
        id: 2,
        date: '2024-01-08',
        total: 32.50,
        status: 'ready',
        items: ['Fromage de chèvre', 'Salade verte', 'Œufs fermiers'],
        pickupPoint: 'Ferme des Roses',
        rating: null
      },
      {
        id: 3,
        date: '2024-01-01',
        total: 68.90,
        status: 'delivered',
        items: ['Panier légumes de saison', 'Viande locale', 'Fruits bio'],
        pickupPoint: 'Centre-ville',
        rating: 4
      }
    ];

    res.json(mockOrders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get customer preferences
export const getCustomerPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
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

    const customer = await customerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer profile not found' });
      return;
    }

    const defaultPreferences = {
      notifications: true,
      newsletter: true,
      sms: false,
      emailPromotions: true,
      favoriteCategories: []
    };

    res.json(customer.preferences || defaultPreferences);
  } catch (error) {
    console.error('Get customer preferences error:', error);
    res.status(500).json({ message: 'Error fetching preferences' });
  }
};

// Update customer preferences
export const updateCustomerPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
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

    const customer = await customerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer profile not found' });
      return;
    }

    const { preferences } = req.body;
    customer.preferences = { ...customer.preferences, ...preferences };
    
    await customerRepository.save(customer);

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Update customer preferences error:', error);
    res.status(500).json({ message: 'Error updating preferences' });
  }
};
