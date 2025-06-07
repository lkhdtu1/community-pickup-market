#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function simpleTest() {
  console.log('🧪 Running simple API test...');
  
  try {
    // Test health
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', healthResponse.data);

    // Test registration
    console.log('Testing user registration...');
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      profileData: {
        firstName: 'Test',
        lastName: 'User',
        phone: '555-1234',
        address: '123 Test St'
      }
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ Registration successful');
    console.log('Token received:', !!registerResponse.data.token);

    console.log('🎉 Simple test completed successfully!');

  } catch (error) {
    console.error('❌ Simple test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
      console.log('URL:', error.config.url);
    }
  }
}

simpleTest();
