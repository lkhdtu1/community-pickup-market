import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Product } from '../models/Product';
import { Producer } from '../models/Producer';

// Get all products (for customers)
export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find({
      relations: ['producer'],
      where: { isAvailable: true }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get products by producer (for producer's admin panel)
export const getProducerProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const producerId = req.user?.userId;
    const products = await productRepository.find({
      where: { producer: { user: { id: producerId } } }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching producer products:', error);
    res.status(500).json({ message: 'Error fetching producer products' });
  }
};

// Create new product (for producers)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const producerRepository = AppDataSource.getRepository(Producer);
    const producerId = req.user?.userId;
    const producer = await producerRepository.findOne({
      where: { user: { id: producerId } }
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer not found' });
      return;
    }

    const product = new Product();
    Object.assign(product, req.body);
    product.producer = producer;

    await productRepository.save(product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Update product (for producers)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const { id } = req.params;
    const producerId = req.user?.userId;

    const product = await productRepository.findOne({
      where: { 
        id,
        producer: { user: { id: producerId } }
      }
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    Object.assign(product, req.body);
    await productRepository.save(product);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete product (for producers)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const { id } = req.params;
    const producerId = req.user?.userId;

    const product = await productRepository.findOne({
      where: { 
        id,
        producer: { user: { id: producerId } }
      }
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await productRepository.remove(product);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};