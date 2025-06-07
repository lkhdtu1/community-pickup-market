import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Customer } from '../models/Customer';
import { PaymentMethod } from '../models/PaymentMethod';

// Get customer payment methods
export const getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);

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

    const paymentMethods = await paymentMethodRepository.find({
      where: { customer: { id: customer.id } },
      order: { isDefault: 'DESC', createdAt: 'DESC' }
    });

    res.json(paymentMethods);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Error fetching payment methods' });
  }
};

// Add payment method
export const addPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);

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

    const { type, cardLastFour, cardBrand, expiryMonth, holderName, isDefault, stripePaymentMethodId } = req.body;

    // If this is being set as default, unset others
    if (isDefault) {
      await paymentMethodRepository.update(
        { customer: { id: customer.id } },
        { isDefault: false }
      );
    }

    const paymentMethod = paymentMethodRepository.create({
      customer,
      type,
      cardLastFour,
      cardBrand,
      expiryMonth,
      holderName,
      isDefault: isDefault || false,
      stripePaymentMethodId
    });

    const savedPaymentMethod = await paymentMethodRepository.save(paymentMethod);
    res.status(201).json(savedPaymentMethod);
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ message: 'Error adding payment method' });
  }
};

// Update payment method
export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);

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

    const paymentMethodId = req.params.id;
    const paymentMethod = await paymentMethodRepository.findOne({
      where: { id: paymentMethodId, customer: { id: customer.id } }
    });

    if (!paymentMethod) {
      res.status(404).json({ message: 'Payment method not found' });
      return;
    }

    const { isDefault, holderName } = req.body;

    // If this is being set as default, unset others
    if (isDefault && !paymentMethod.isDefault) {
      await paymentMethodRepository.update(
        { customer: { id: customer.id } },
        { isDefault: false }
      );
    }

    // Update allowed fields
    if (isDefault !== undefined) paymentMethod.isDefault = isDefault;
    if (holderName !== undefined) paymentMethod.holderName = holderName;

    const updatedPaymentMethod = await paymentMethodRepository.save(paymentMethod);
    res.json(updatedPaymentMethod);
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ message: 'Error updating payment method' });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);

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

    const paymentMethodId = req.params.id;
    const paymentMethod = await paymentMethodRepository.findOne({
      where: { id: paymentMethodId, customer: { id: customer.id } }
    });

    if (!paymentMethod) {
      res.status(404).json({ message: 'Payment method not found' });
      return;
    }

    await paymentMethodRepository.remove(paymentMethod);
    res.status(204).send();
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ message: 'Error deleting payment method' });
  }
};
