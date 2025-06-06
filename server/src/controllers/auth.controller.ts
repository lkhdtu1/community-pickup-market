import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../index';
import { User, UserRole } from '../models/User';
import { Producer } from '../models/Producer';
import { Customer } from '../models/Customer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);
    const customerRepository = AppDataSource.getRepository(Customer);

    const { email, password, role, profileData } = req.body;    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      // Check if trying to register with different role than existing account
      if (existingUser.role !== role) {
        res.status(400).json({ message: 'An account with this email already exists for a different account type' });
        return;
      } else {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
    }

    // Create new user
    const user = new User();
    user.email = email;
    user.password = password;
    user.role = role || UserRole.CUSTOMER;

    // Hash password
    await user.hashPassword();

    // Save user
    await userRepository.save(user);

    // Create specific profile based on role
    if (role === UserRole.PRODUCER) {
      const producer = new Producer();
      producer.user = user;
      producer.shopName = profileData.shopName;
      producer.description = profileData.description;
      producer.address = profileData.address;
      producer.certifications = profileData.certifications;
      producer.pickupInfo = profileData.pickupInfo;
      await producerRepository.save(producer);
    } else {
      const customer = new Customer();
      customer.user = user;
      customer.firstName = profileData.firstName;
      customer.lastName = profileData.lastName;
      customer.phone = profileData.phone;
      customer.address = profileData.address;
      customer.preferences = profileData.preferences;
      await customerRepository.save(customer);
    }

    // Generate JWT token
    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);
    const customerRepository = AppDataSource.getRepository(Customer);

    const { email, password, role } = req.body;

    // Find user
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify role matches if provided
    if (role && user.role !== role) {
      res.status(401).json({ message: 'Invalid credentials for this account type' });
      return;
    }

    // Get profile data based on role
    let profileData = null;
    if (user.role === UserRole.PRODUCER) {
      const producer = await producerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });
      profileData = producer;
    } else {
      const customer = await customerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });
      profileData = customer;
    }

    // Generate JWT token
    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);
    const customerRepository = AppDataSource.getRepository(Customer);

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

    // Get profile data based on role
    let profileData = null;
    if (user.role === UserRole.PRODUCER) {
      const producer = await producerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });
      profileData = producer;
    } else {
      const customer = await customerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });
      profileData = customer;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);
    const customerRepository = AppDataSource.getRepository(Customer);

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

    const { profileData } = req.body;

    // Update profile based on role
    if (user.role === UserRole.PRODUCER) {
      const producer = await producerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });

      if (producer) {
        Object.assign(producer, profileData);
        await producerRepository.save(producer);
      }
    } else {
      const customer = await customerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });

      if (customer) {
        Object.assign(customer, profileData);
        await customerRepository.save(customer);
      }
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Verify token and return user data
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);
    const customerRepository = AppDataSource.getRepository(Customer);

    if (!req.user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    const user = await userRepository.findOne({ 
      where: { id: req.user.userId } 
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get profile data based on role
    let profileData = null;
    if (user.role === UserRole.PRODUCER) {
      const producer = await producerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });
      profileData = producer;
    } else {
      const customer = await customerRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user']
      });
      profileData = customer;
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await userRepository.findOne({ 
      where: { id: req.user.userId } 
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify current password
    const isValidPassword = await user.checkPassword(currentPassword);
    if (!isValidPassword) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.hashPassword();
    await userRepository.save(user);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};