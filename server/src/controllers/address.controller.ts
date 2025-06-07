import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Customer } from '../models/Customer';
import { Address } from '../models/Address';

// Get customer addresses
export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const addressRepository = AppDataSource.getRepository(Address);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const customer = await customerRepository.findOne({
      where: { user: { id: req.user.userId } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const addresses = await addressRepository.find({
      where: { customer: { id: customer.id } },
      order: { isDefault: 'DESC', createdAt: 'DESC' }
    });

    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};

// Add address
export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const addressRepository = AppDataSource.getRepository(Address);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const customer = await customerRepository.findOne({
      where: { user: { id: req.user.userId } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const { 
      type, 
      street, 
      street2, 
      city, 
      postalCode, 
      country, 
      firstName, 
      lastName, 
      phone, 
      isDefault 
    } = req.body;

    // Validate required fields
    if (!type || !street || !city || !postalCode) {
      res.status(400).json({ message: 'Missing required fields: type, street, city, postalCode' });
      return;
    }

    // If this is being set as default, unset others
    if (isDefault) {
      await addressRepository.update(
        { customer: { id: customer.id } },
        { isDefault: false }
      );
    }

    const address = addressRepository.create({
      customer,
      type,
      street,
      street2,
      city,
      postalCode,
      country: country || 'France',
      firstName,
      lastName,
      phone,
      isDefault: isDefault || false
    });

    const savedAddress = await addressRepository.save(address);
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Error adding address' });
  }
};

// Update address
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const addressRepository = AppDataSource.getRepository(Address);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const customer = await customerRepository.findOne({
      where: { user: { id: req.user.userId } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const addressId = req.params.id;
    const address = await addressRepository.findOne({
      where: { id: addressId, customer: { id: customer.id } }
    });

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    const { 
      type, 
      street, 
      street2, 
      city, 
      postalCode, 
      country, 
      firstName, 
      lastName, 
      phone, 
      isDefault 
    } = req.body;

    // If this is being set as default, unset others
    if (isDefault && !address.isDefault) {
      await addressRepository.update(
        { customer: { id: customer.id } },
        { isDefault: false }
      );
    }

    // Update fields
    if (type !== undefined) address.type = type;
    if (street !== undefined) address.street = street;
    if (street2 !== undefined) address.street2 = street2;
    if (city !== undefined) address.city = city;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (firstName !== undefined) address.firstName = firstName;
    if (lastName !== undefined) address.lastName = lastName;
    if (phone !== undefined) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    const updatedAddress = await addressRepository.save(address);
    res.json(updatedAddress);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Error updating address' });
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const addressRepository = AppDataSource.getRepository(Address);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const customer = await customerRepository.findOne({
      where: { user: { id: req.user.userId } },
      relations: ['user']
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const addressId = req.params.id;
    const address = await addressRepository.findOne({
      where: { id: addressId, customer: { id: customer.id } }
    });

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    await addressRepository.remove(address);
    res.status(204).send();
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Error deleting address' });
  }
};
