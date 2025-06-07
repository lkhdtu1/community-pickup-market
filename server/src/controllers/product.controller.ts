import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Product } from '../models/Product';
import { Producer } from '../models/Producer';
import { Shop } from '../models/Shop';
import { PerformanceService } from '../services/performanceService';
import { catchAsync } from '../services/errorService';

// Get all products (for customers) - Enhanced with caching and performance optimization
export const getAllProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { category, search } = req.query;

  // Use performance service for optimized product queries
  const products = await PerformanceService.getProducts({
    category: category as string,
    search: search as string,
    isAvailable: true
  });

  res.json(products);
});

// Get products by producer (for producer's admin panel) - Enhanced with performance optimization
export const getProducerProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  // Find producer ID
  const producerRepository = AppDataSource.getRepository(Producer);
  const producer = await producerRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user']
  });

  if (!producer) {
    res.status(404).json({ message: 'Producer profile not found' });
    return;
  }

  // Use performance service for optimized product queries
  const products = await PerformanceService.getProducts({
    producerId: producer.id
  });

  res.json(products);
});

// Create new product (for producers)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const shopRepository = AppDataSource.getRepository(Shop);
    const producerRepository = AppDataSource.getRepository(Producer);
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find producer by user ID
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'shops']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    const { 
      name, 
      price, 
      stock, 
      category, 
      unit, 
      description, 
      images = ['/placeholder.svg'],
      isAvailable = true,
      shopId
    } = req.body;

    // Validate required fields
    if (!name || !price || !unit || !category || !shopId) {
      res.status(400).json({ message: 'Missing required fields: name, price, unit, category, shopId' });
      return;
    }

    // Verify the shop belongs to this producer
    const shop = await shopRepository.findOne({
      where: { id: shopId, producer: { id: producer.id } },
      relations: ['producer']
    });

    if (!shop) {
      res.status(403).json({ message: 'Shop not found or you do not have permission to add products to it' });
      return;
    }

    // Create new product
    const product = new Product();
    product.name = name;
    product.price = parseFloat(price);
    product.stock = parseInt(stock) || 0;
    product.category = category;
    product.unit = unit;
    product.description = description || '';
    product.images = Array.isArray(images) ? images : [images || '/placeholder.svg'];
    product.isAvailable = isAvailable;
    product.shop = shop;

    const savedProduct = await productRepository.save(product);

    // Format response for frontend
    const formattedProduct = {
      id: savedProduct.id,
      name: savedProduct.name,
      price: parseFloat(savedProduct.price.toString()),
      stock: savedProduct.stock,
      category: savedProduct.category,
      image: savedProduct.images[0],
      images: savedProduct.images,
      status: savedProduct.stock === 0 ? 'rupture' : (savedProduct.isAvailable ? 'active' : 'inactive'),
      description: savedProduct.description,
      unit: savedProduct.unit,
      isAvailable: savedProduct.isAvailable,
      shopId: savedProduct.shop.id,
      shopName: savedProduct.shop.name,
      createdAt: savedProduct.createdAt,
      updatedAt: savedProduct.updatedAt
    };

    res.status(201).json(formattedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Update product (for producers)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const producerRepository = AppDataSource.getRepository(Producer);
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find producer by user ID
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'shops']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    // Get shop IDs for this producer
    const shopIds = producer.shops.map(shop => shop.id);    // Find product belonging to this producer's shops
    const product = await productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop')
      .where('product.id = :id', { id })
      .andWhere('shop.id IN (:...shopIds)', { shopIds })
      .getOne();

    if (!product) {
      res.status(404).json({ message: 'Product not found or you do not have permission to edit it' });
      return;
    }

    const { 
      name, 
      price, 
      stock, 
      category, 
      unit, 
      description, 
      images,
      isAvailable 
    } = req.body;

    // Update product fields
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category !== undefined) product.category = category;
    if (unit !== undefined) product.unit = unit;
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = Array.isArray(images) ? images : [images];
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    const savedProduct = await productRepository.save(product);

    // Format response for frontend
    const formattedProduct = {
      id: savedProduct.id,
      name: savedProduct.name,
      price: parseFloat(savedProduct.price.toString()),
      stock: savedProduct.stock,
      category: savedProduct.category,
      image: savedProduct.images[0],
      images: savedProduct.images,
      status: savedProduct.stock === 0 ? 'rupture' : (savedProduct.isAvailable ? 'active' : 'inactive'),
      description: savedProduct.description,
      unit: savedProduct.unit,
      isAvailable: savedProduct.isAvailable,
      shopId: savedProduct.shop.id,
      shopName: savedProduct.shop.name,
      createdAt: savedProduct.createdAt,
      updatedAt: savedProduct.updatedAt
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete product (for producers)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const producerRepository = AppDataSource.getRepository(Producer);
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find producer by user ID
    const producer = await producerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'shops']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    // Get shop IDs for this producer
    const shopIds = producer.shops.map(shop => shop.id);

    // Find product belonging to this producer's shops
    const product = await productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop')
      .where('product.id = :id', { id })
      .andWhere('shop.id IN (:...shopIds)', { shopIds })
      .getOne();

    if (!product) {
      res.status(404).json({ message: 'Product not found or you do not have permission to delete it' });
      return;
    }

    await productRepository.remove(product);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Get single product by ID (for customers)
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const { id } = req.params;

    const product = await productRepository.findOne({
      where: { id, isAvailable: true },
      relations: ['shop', 'shop.producer', 'shop.producer.user']
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Format product for frontend
    const formattedProduct = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.toString()),
      unit: product.unit,
      category: product.category,
      description: product.description,
      image: product.images?.[0] || '/placeholder.svg',
      images: product.images || [],
      producer: product.shop.name,
      producerId: product.shop.producer.id,
      shopId: product.shop.id,
      stock: product.stock,
      isAvailable: product.isAvailable,
      producerInfo: {
        id: product.shop.producer.id,
        shopName: product.shop.name,
        description: product.shop.description,
        address: product.shop.address,
        pickupInfo: product.shop.pickupInfo
      }
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};