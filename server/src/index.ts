import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

dotenv.config();

const app = express();

// Sécurise les headers HTTP
app.use(helmet());

// Configure CORS pour limiter les origines autorisées
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:8080'
  ],
  credentials: true
}));

// Parse les requêtes JSON et les formulaires volumineux (ex: images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Applique le rate limiting global
app.use(rateLimiters.generalRateLimit);

// Connexion à la base de données
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });

// Définition des routes principales
app.use('/api/auth', rateLimiters.authRateLimit, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/orders', rateLimiters.orderRateLimit, orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);

// Endpoint de vérification de santé
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Gestion globale des erreurs (doit être le dernier middleware)
app.use(globalErrorHandler);

// Démarrage du serveur sur le port disponible
const PORT = process.env.PORT || 3001;

function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(Number(PORT));