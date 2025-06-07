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

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 