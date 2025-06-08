import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './database';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import producerRoutes from './routes/producer.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import shopRoutes from './routes/shop.routes';
import paymentRoutes from './routes/payment.routes';
import cartRoutes from './routes/cart.routes';
import rateLimiters from './middleware/rateLimiting.middleware';
import { globalErrorHandler } from './services/errorService';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083'],
  credentials: true
}));

// Middleware - Increase body size limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply general rate limiting to all routes
app.use(rateLimiters.generalRateLimit);

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });

// Routes - Apply specific rate limiting where needed
app.use('/api/auth', rateLimiters.authRateLimit, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', rateLimiters.orderRateLimit, orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 