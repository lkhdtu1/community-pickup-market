const axios = require('axios');

async function testFrontendAuth() {
  try {
    console.log('🧪 Testing frontend authentication integration...\n');
    
    // Test 1: Login with existing test customer
    console.log('1. Testing customer login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-customer-1749229238406@example.com',
      password: 'password123'
    });
    console.log('✅ Customer login successful');
    console.log('User:', loginResponse.data.user);
    const customerToken = loginResponse.data.token;
    
    // Test 2: Get profile with token
    console.log('\n2. Testing profile retrieval...');
    const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('Profile:', profileResponse.data.user);
    
    // Test 3: Test token verification
    console.log('\n3. Testing token verification...');
    const verifyResponse = await axios.get('http://localhost:3001/api/auth/verify', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Token verification successful');
    
    // Test 4: Producer login
    console.log('\n4. Testing producer login...');
    const producerLoginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-producer-1749229238410@example.com',
      password: 'password123'
    });
    console.log('✅ Producer login successful');
    console.log('Producer:', producerLoginResponse.data.user);
    
    console.log('\n🎉 All frontend authentication tests passed!');
    console.log('\nReady for frontend UI testing at http://localhost:8082');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendAuth();
