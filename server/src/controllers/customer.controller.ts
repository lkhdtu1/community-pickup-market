import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import cacheService from '../services/cacheService';
import { catchAsync } from '../services/errorService';

// Get customer profile
export const getCustomerProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  const userId = req.user.userId;
  const cacheKey = `customer:${userId}:profile`;

  const customerData = await cacheService.getOrSet(cacheKey, async () => {
    const customerRepository = AppDataSource.getRepository(Customer);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ 
      where: { id: userId } 
    });

    if (!user) {
      throw new Error('User not found');
    }

    const customer = await customerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user']
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      preferences: customer.preferences,
      email: user.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }, 300); // 5 minutes cache

  res.json(customerData);
});

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
    }    const { firstName, lastName, phone, address, dateOfBirth, email } = req.body;

    // Update customer data
    if (firstName !== undefined) customer.firstName = firstName;
    if (lastName !== undefined) customer.lastName = lastName;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;await customerRepository.save(customer);

    // Update user email if provided
    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }
      user.email = email;
      await userRepository.save(user);
    }    // Return updated profile data
    res.json({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      dateOfBirth: customer.dateOfBirth,
      preferences: customer.preferences,
      email: user.email,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Note: Customer orders are now handled by the order controller

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
