import request from 'supertest';
import { app } from '../index';
import { createConnection } from 'typeorm';

describe('Security Tests', () => {
  beforeAll(async () => {
    await createConnection();
  });

  describe('SQL Injection Tests', () => {
    it('should prevent SQL injection in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "' OR '1'='1",
          password: "' OR '1'='1"
        });
      
      expect(response.status).toBe(401);
    });

    it('should prevent SQL injection in product search', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({ q: "' OR '1'='1" });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('XSS Tests', () => {
    it('should sanitize product description', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: '<script>alert("XSS")</script>',
          price: 10.99
        });
      
      expect(response.status).toBe(201);
      expect(response.body.description).not.toContain('<script>');
    });

    it('should sanitize user input in comments', async () => {
      const response = await request(app)
        .post('/api/products/1/comments')
        .send({
          content: '<img src="x" onerror="alert(\'XSS\')">'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.content).not.toContain('<img');
    });
  });

  describe('Authentication Tests', () => {
    it('should prevent brute force attacks', async () => {
      const attempts = 5;
      for (let i = 0; i < attempts; i++) {
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

      expect(response.status).toBe(429); // Too Many Requests
    });
  });
}); 