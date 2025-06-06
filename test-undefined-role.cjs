const axios = require('axios');

async function testUndefinedRole() {
  console.log('=== Testing Login Without Role Parameter ===\n');
  
  const API_URL = 'http://localhost:3001/api';
  
  // Test 1: Login without role parameter
  console.log('Test 1: Producer credentials without role parameter');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123'
      // No role parameter
    });
    
    console.log('✅ SUCCESS: Login without role succeeded');
    console.log('User role:', response.data.user.role);
    console.log('This is the behavior when role validation is bypassed');
    
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Login with role = undefined
  console.log('Test 2: Producer credentials with role = undefined');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123',
      role: undefined
    });
    
    console.log('✅ SUCCESS: Login with undefined role succeeded');
    console.log('User role:', response.data.user.role);
    
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Login with role = null
  console.log('Test 3: Producer credentials with role = null');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123',
      role: null
    });
    
    console.log('✅ SUCCESS: Login with null role succeeded');
    console.log('User role:', response.data.user.role);
    
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data || error.message);
  }
}

testUndefinedRole();
