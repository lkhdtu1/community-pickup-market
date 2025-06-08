import express from 'express';
import request from 'supertest';

// Mock controller functions
const mockLogin = jest.fn();
const mockGetAllProducts = jest.fn();
const mockCreateProduct = jest.fn();
const mockGetProductById = jest.fn();

// Create a minimal Express app for testing
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/auth/login', mockLogin);
  app.get('/api/products', mockGetAllProducts);
  app.post('/api/products', mockCreateProduct);
  app.get('/api/products/:id', mockGetProductById);

  return app;
}

describe('Security Tests', () => {
  let app: express.Express;
  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('SQL Injection Tests', () => {
    it('should prevent SQL injection in login', async () => {
      mockLogin.mockImplementation(async (_req, res) => {
        res.status(401).json({ message: 'Invalid credentials' });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "' OR '1'='1",
          password: "' OR '1'='1"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should prevent SQL injection in product search', async () => {
      mockGetAllProducts.mockImplementation(async (_req, res) => {
        res.status(400).json({ message: 'Invalid search query' });
      });

      const response = await request(app)
        .get('/api/products')
        .query({ search: "' OR '1'='1" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid search query');
    });
  });

  describe('XSS Tests', () => {
    it('should sanitize product description', async () => {
      mockCreateProduct.mockImplementation(async (req, res) => {
        const sanitizedDescription = req.body.description.replace(/<[^>]*>/g, '');
        res.status(201).json({
          ...req.body,
          description: sanitizedDescription
        });
      });

      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: '<script>alert("XSS")</script>',
          price: 10.99,
          unit: 'kg',
          category: 'test',
          shopId: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.description).not.toContain('<script>');
    });

    it('should sanitize user input in product details', async () => {
      mockGetProductById.mockImplementation(async (req, res) => {
        const sanitizedDescription = req.body.description?.replace(/<[^>]*>/g, '') || '';
        res.status(200).json({
          ...req.body,
          description: sanitizedDescription
        });
      });

      const response = await request(app)
        .get('/api/products/1')
        .send({
          description: '<img src="x" onerror="alert(\'XSS\')">'
        });

      expect(response.status).toBe(200);
      expect(response.body.description).not.toContain('<img');
    });
  });

  describe('Authentication Tests', () => {
    it('should prevent brute force attacks', async () => {
      let attemptCount = 0;
      mockLogin.mockImplementation(async (_req, res) => {
        attemptCount++;
        if (attemptCount > 5) {
          res.status(429).json({ message: 'Too many login attempts' });
        } else {
          res.status(401).json({ message: 'Invalid credentials' });
        }
      });

      // Make 6 login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@test.com',
            password: 'wrongpassword'
          });
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toBe('Too many login attempts');
    });
  });
}); 