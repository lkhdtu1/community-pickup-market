import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Customer } from '../models/Customer';
import { Cart, CartItem } from '../models/Cart';
import { Product } from '../models/Product';

// Get customer cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const cartRepository = AppDataSource.getRepository(Cart);

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

    let cart = await cartRepository.findOne({
      where: { customer: { id: customer.id } },
      relations: ['items']
    });

    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart();
      cart.customer = customer;
      cart.items = [];
      cart = await cartRepository.save(cart);
    }

    // Format cart items for frontend
    const formattedItems = cart.items.map(item => ({
      id: item.productId,
      name: item.productName,
      price: parseFloat(item.price.toString()),
      unit: item.unit,
      producer: item.producer,
      quantity: item.quantity,
      image: item.image,
      category: item.category
    }));

    res.json(formattedItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    const productRepository = AppDataSource.getRepository(Product);

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

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    // Verify product exists and get details
    const product = await productRepository.findOne({
      where: { id: productId, isAvailable: true },
      relations: ['shop', 'shop.producer']
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found or not available' });
      return;
    }

    // Check stock availability
    if (product.stock < quantity) {
      res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` 
      });
      return;
    }

    // Get or create cart
    let cart = await cartRepository.findOne({
      where: { customer: { id: customer.id } },
      relations: ['items']
    });

    if (!cart) {
      cart = new Cart();
      cart.customer = customer;
      cart = await cartRepository.save(cart);
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      // Check total stock availability
      if (product.stock < newQuantity) {
        res.status(400).json({ 
          message: `Insufficient stock. Available: ${product.stock}, Cart + Requested: ${newQuantity}` 
        });
        return;
      }

      existingItem.quantity = newQuantity;
      await cartItemRepository.save(existingItem);
    } else {
      // Add new item to cart
      const cartItem = new CartItem();
      cartItem.cart = cart;
      cartItem.productId = product.id;
      cartItem.productName = product.name;
      cartItem.price = product.price;
      cartItem.unit = product.unit;
      cartItem.producer = product.shop.name;
      cartItem.quantity = quantity;
      cartItem.image = product.images[0] || '/placeholder.svg';
      cartItem.category = product.category;

      await cartItemRepository.save(cartItem);
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    const productRepository = AppDataSource.getRepository(Product);

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

    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      res.status(400).json({ message: 'Quantity cannot be negative' });
      return;
    }

    const cart = await cartRepository.findOne({
      where: { customer: { id: customer.id } },
      relations: ['items']
    });

    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const cartItem = cart.items.find(item => item.productId === productId);

    if (!cartItem) {
      res.status(404).json({ message: 'Item not found in cart' });
      return;
    }

    if (quantity === 0) {
      // Remove item from cart
      await cartItemRepository.remove(cartItem);
    } else {
      // Check stock availability
      const product = await productRepository.findOne({
        where: { id: productId, isAvailable: true }
      });

      if (!product) {
        res.status(404).json({ message: 'Product not found or not available' });
        return;
      }

      if (product.stock < quantity) {
        res.status(400).json({ 
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` 
        });
        return;
      }

      cartItem.quantity = quantity;
      await cartItemRepository.save(cartItem);
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

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

    const { productId } = req.params;

    const cart = await cartRepository.findOne({
      where: { customer: { id: customer.id } },
      relations: ['items']
    });

    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const cartItem = cart.items.find(item => item.productId === productId);

    if (!cartItem) {
      res.status(404).json({ message: 'Item not found in cart' });
      return;
    }

    await cartItemRepository.remove(cartItem);
    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

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

    const cart = await cartRepository.findOne({
      where: { customer: { id: customer.id } },
      relations: ['items']
    });

    if (cart && cart.items.length > 0) {
      await cartItemRepository.remove(cart.items);
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
};

// Sync cart from localStorage (merge local cart with database cart)
export const syncCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerRepository = AppDataSource.getRepository(Customer);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    const productRepository = AppDataSource.getRepository(Product);

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

    const { localCartItems } = req.body;

    if (!Array.isArray(localCartItems)) {
      res.status(400).json({ message: 'Invalid cart items format' });
      return;
    }

    // Get or create cart
    let cart = await cartRepository.findOne({
      where: { customer: { id: customer.id } },
      relations: ['items']
    });

    if (!cart) {
      cart = new Cart();
      cart.customer = customer;
      cart = await cartRepository.save(cart);
    }

    // Process each local cart item
    for (const localItem of localCartItems) {
      if (!localItem.id || !localItem.quantity) continue;

      // Verify product exists
      const product = await productRepository.findOne({
        where: { id: localItem.id, isAvailable: true },
        relations: ['shop']
      });

      if (!product) continue;

      // Check if item already exists in database cart
      const existingItem = cart.items.find(item => item.productId === localItem.id);

      if (existingItem) {
        // Merge quantities, taking the higher value
        const mergedQuantity = Math.max(existingItem.quantity, localItem.quantity);
        
        // Check stock availability
        if (product.stock >= mergedQuantity) {
          existingItem.quantity = mergedQuantity;
          await cartItemRepository.save(existingItem);
        }
      } else {
        // Add new item if stock is available
        if (product.stock >= localItem.quantity) {
          const cartItem = new CartItem();
          cartItem.cart = cart;
          cartItem.productId = product.id;
          cartItem.productName = product.name;
          cartItem.price = product.price;
          cartItem.unit = product.unit;
          cartItem.producer = product.shop.name;
          cartItem.quantity = localItem.quantity;
          cartItem.image = product.images[0] || '/placeholder.svg';
          cartItem.category = product.category;

          await cartItemRepository.save(cartItem);
        }
      }
    }

    // Return updated cart
    const updatedCart = await cartRepository.findOne({
      where: { customer: { id: customer.id } },
      relations: ['items']
    });

    const formattedItems = updatedCart?.items.map(item => ({
      id: item.productId,
      name: item.productName,
      price: parseFloat(item.price.toString()),
      unit: item.unit,
      producer: item.producer,
      quantity: item.quantity,
      image: item.image,
      category: item.category
    })) || [];

    res.json(formattedItems);
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ message: 'Error syncing cart' });
  }
};
