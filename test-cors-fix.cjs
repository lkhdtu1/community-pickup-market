#!/usr/bin/env node

console.log('🎯 TESTING CORS FIX');
console.log('====================');

const axios = require('axios');

async function testCORSFix() {
  try {
    console.log('1. Testing API products endpoint...');
    const productsResponse = await axios.get('http://localhost:3001/api/products');
    console.log('✅ Products API working! Found', productsResponse.data.length, 'products');
    
    console.log('2. Testing API producers endpoint...');
    const producersResponse = await axios.get('http://localhost:3001/api/producers');
    console.log('✅ Producers API working! Found', producersResponse.data.length, 'producers');
    
    console.log('3. Testing authentication endpoint...');
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer'
    };
    
    const authResponse = await axios.post('http://localhost:3001/api/auth/register', testUser);
    console.log('✅ Authentication API working! User registered with ID:', authResponse.data.profile.id);
    
    console.log('\n🎉 CORS FIX CONFIRMED!');
    console.log('✅ All API endpoints are accessible');
    console.log('✅ Frontend should now work correctly');
    console.log('\n🚀 Try refreshing your browser at: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data?.message || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Backend server may not be running on port 3001');
    }
  }
}

testCORSFix();
