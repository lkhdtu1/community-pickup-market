import { Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Order, OrderItem, OrderStatus } from '../models/Order';
import { Customer } from '../models/Customer';
import { Producer } from '../models/Producer';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { emailService } from '../services/emailService';

// Helper function to safely format dates
const formatDate = (date: any): string | null => {
  if (!date) return null;
  
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string') {
    return date;
  }
  
  // If it's a Date object, format it
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  // Try to convert to Date and format
  try {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  } catch {
    return null;
  }
};

// Get all orders for a producer
export const getProducerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const producer = await producerRepository.findOne({
      where: { user: { id: user.id } }
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }    console.log('Debug: Attempting to get producer orders for producer ID:', producer.id);
    
    // Get orders with proper relations
    const orders = await orderRepository.find({
      where: { 
        producer: { id: producer.id }
      },
      relations: ['customer', 'customer.user', 'items'],
      order: {
        createdAt: 'DESC'
      }
    });
      
    console.log('Debug: Found orders for producer:', orders.length);    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customer?.user ? 
        `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 
        order.customer.user.email || 'Client' : 'Client',
      customerEmail: order.customer?.user?.email || 'Not available',
      items: order.items?.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        subtotal: parseFloat(item.subtotal.toString())
      })) || [],      total: parseFloat(order.total.toString()),
      status: order.status,
      orderDate: formatDate(order.createdAt),
      pickupDate: formatDate(order.pickupDate),
      pickupPoint: order.pickupPoint,
      notes: order.notes
    }));

    res.json(formattedOrders);} catch (error) {
    console.error('Get producer orders error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get all orders for a customer
export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const userRepository = AppDataSource.getRepository(User);
    const customerRepository = AppDataSource.getRepository(Customer);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const customer = await customerRepository.findOne({
      where: { user: { id: user.id } }
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer profile not found' });
      return;
    }    console.log('Debug: Attempting to get customer orders for customer ID:', customer.id);
    
    // Get orders with proper relations
    const orders = await orderRepository.find({
      where: { 
        customer: { id: customer.id }
      },
      relations: ['producer', 'producer.user', 'items'],
      order: {
        createdAt: 'DESC'
      }
    });
      
    console.log('Debug: Found orders for customer:', orders.length);    const formattedOrders = orders.map(order => ({
      id: order.id,
      producerName: order.producer?.shops?.[0]?.name || 'Unknown Producer',      items: order.items?.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        subtotal: parseFloat(item.subtotal.toString())
      })) || [],      total: parseFloat(order.total.toString()),
      status: order.status,
      orderDate: formatDate(order.createdAt),
      pickupDate: formatDate(order.pickupDate),
      pickupPoint: order.pickupPoint,
      notes: order.notes
    }));

    res.json(formattedOrders);} catch (error) {
    console.error('Get customer orders error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    const customerRepository = AppDataSource.getRepository(Customer);
    const producerRepository = AppDataSource.getRepository(Producer);
    const productRepository = AppDataSource.getRepository(Product);
    const userRepository = AppDataSource.getRepository(User);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const customer = await customerRepository.findOne({
      where: { user: { id: user.id } }
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer profile not found' });
      return;
    }

    const { producerId, items, pickupDate, pickupPoint, notes, paymentMethodId, paymentIntentId, paymentStatus } = req.body;

    if (!producerId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Producer ID and items are required' });
      return;
    }    const producer = await producerRepository.findOne({
      where: { id: producerId },
      relations: ['shops', 'user']
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer not found' });
      return;
    }    // Validate products and calculate total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {      const product = await productRepository.findOne({
        where: { id: item.productId },
        relations: ['shop', 'shop.producer']
      });

      if (!product) {
        res.status(404).json({ message: `Product ${item.productId} not found` });
        return;
      }      if (product.shop.producer.id !== producerId) {
        res.status(400).json({ message: 'All products must belong to the same producer' });
        return;
      }

      const subtotal = parseFloat(product.price.toString()) * item.quantity;
      total += subtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: parseFloat(product.price.toString()),
        subtotal
      });
    }    // Create order
    const order = new Order();
    order.customer = customer;
    order.producer = producer;
    order.total = total;
    order.status = OrderStatus.PENDING;
    order.paymentMethodId = paymentMethodId;
    order.paymentIntentId = paymentIntentId;
    order.paymentStatus = paymentStatus || 'pending';if (pickupDate) {
      order.pickupDate = new Date(pickupDate);
    }
    // Get pickup info from producer's first shop (fallback logic)
    order.pickupPoint = pickupPoint || producer.shops?.[0]?.pickupInfo?.location || 'À définir';
    order.notes = notes;

    const savedOrder = await orderRepository.save(order);    // Create order items
    const orderItems = validatedItems.map(item => {
      const orderItem = new OrderItem();
      orderItem.order = savedOrder;
      orderItem.productId = item.productId;
      orderItem.productName = item.productName;
      orderItem.quantity = item.quantity;
      orderItem.unitPrice = item.unitPrice;
      orderItem.subtotal = item.subtotal;
      return orderItem;
    });

    await orderItemRepository.save(orderItems);    // Send email notifications
    try {
      const emailData = {
        orderId: savedOrder.id,
        customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Client',
        customerEmail: user.email,
        producerName: producer.shops?.[0]?.name || 'Producer',
        items: validatedItems.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        total: savedOrder.total,
        pickupPoint: savedOrder.pickupPoint,
        pickupDate: savedOrder.pickupDate ? savedOrder.pickupDate.toISOString().split('T')[0] : undefined
      };

      // Send confirmation email to customer
      await emailService.sendOrderConfirmation(emailData);

      // Send notification email to producer
      if (producer.user?.email) {
        await emailService.sendProducerOrderNotification({
          ...emailData,
          producerEmail: producer.user.email
        });
      }
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      id: savedOrder.id,
      message: 'Order created successfully',
      order: {
        id: savedOrder.id,
        producerName: producer.shops?.[0]?.name || 'Producer',
        total: savedOrder.total,
        status: savedOrder.status,
        pickupPoint: savedOrder.pickupPoint,
        items: validatedItems.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.unitPrice
        }))
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Update order status (for producers)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const producer = await producerRepository.findOne({
      where: { user: { id: user.id } }
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    const { orderId } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ message: 'Invalid order status' });
      return;
    }    const order = await orderRepository.findOne({
      where: { 
        id: orderId,
        producer: { id: producer.id }
      },
      relations: ['customer', 'customer.user', 'producer', 'producer.user']
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found or access denied' });
      return;
    }    order.status = status;
    await orderRepository.save(order);

    // Send email notification for status update
    try {
      if (order.customer?.user?.email) {
        const statusUpdateData = {
          orderId: order.id,
          customerName: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Client',
          customerEmail: order.customer.user.email,
          producerName: producer.shops?.[0]?.name || 'Producer',
          status: status,
          pickupPoint: order.pickupPoint
        };

        await emailService.sendOrderStatusUpdate(statusUpdateData);
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({ message: 'Order status updated successfully', status });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// Get order statistics for producer
export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const userRepository = AppDataSource.getRepository(User);
    const producerRepository = AppDataSource.getRepository(Producer);

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const producer = await producerRepository.findOne({
      where: { user: { id: user.id } }
    });

    if (!producer) {
      res.status(404).json({ message: 'Producer profile not found' });
      return;
    }

    // Get all orders for this producer with relations
    const orders = await orderRepository.find({
      where: { producer: { id: producer.id } },
      relations: ['items', 'customer']
    });

    // Calculate basic stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.PICKED_UP);
    const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Calculate unique customers
    const uniqueCustomers = new Set(orders.map(o => o.customer?.id).filter(id => id)).size;

    // Calculate previous month stats for growth comparison
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const previousMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousYear;
    });

    const currentMonthRevenue = currentMonthOrders
      .filter(o => o.status === OrderStatus.PICKED_UP)
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    const previousMonthRevenue = previousMonthOrders
      .filter(o => o.status === OrderStatus.PICKED_UP)
      .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    const ordersGrowth = previousMonthOrders.length > 0 
      ? ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length) * 100 
      : 0;

    // Generate monthly data for charts (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const month = targetDate.getMonth();
      const year = targetDate.getFullYear();
      
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === month && orderDate.getFullYear() === year;
      });

      const monthRevenue = monthOrders
        .filter(o => o.status === OrderStatus.PICKED_UP)
        .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

      monthlyData.push({
        month: targetDate.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: Math.round(monthRevenue * 100) / 100,
        orders: monthOrders.length
      });
    }    // Calculate top products from actual order items
    const productStats = new Map();
    
    orders.forEach(order => {
      if (order.items && order.status === OrderStatus.PICKED_UP) {
        order.items.forEach(item => {
          const productName = item.productName;
          const quantity = item.quantity;
          const revenue = parseFloat(item.subtotal.toString());
          
          if (productStats.has(productName)) {
            const existing = productStats.get(productName);
            productStats.set(productName, {
              productName,
              totalSold: existing.totalSold + quantity,
              revenue: existing.revenue + revenue
            });
          } else {
            productStats.set(productName, {
              productName,
              totalSold: quantity,
              revenue: revenue
            });
          }
        });
      }
    });

    // Convert to array and sort by revenue, take top 5
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(product => ({
        ...product,
        revenue: Math.round(product.revenue * 100) / 100
      }));

    const stats = {
      // Basic counts for existing functionality
      total: totalOrders,
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      prepared: orders.filter(o => o.status === OrderStatus.PREPARED).length,
      ready: orders.filter(o => o.status === OrderStatus.READY).length,
      pickedUp: orders.filter(o => o.status === OrderStatus.PICKED_UP).length,
      cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
      
      // Enhanced analytics data for frontend
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      customerCount: uniqueCustomers,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      ordersGrowth: Math.round(ordersGrowth * 100) / 100,
      monthlyData: monthlyData,
      topProducts: topProducts
    };

    res.json(stats);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Error fetching order statistics' });
  }
};
