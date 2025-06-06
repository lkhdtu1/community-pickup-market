const axios = require('axios');

async function testRoleMismatch() {
  try {
    console.log('=== Testing Role Mismatch Scenarios ===\n');
    
    // Test 1: Producer credentials with customer role selection
    console.log('Test 1: Producer credentials + Customer role selection');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'producer@test.com',
        password: 'password123',
        role: 'customer'
      });
      console.log('❌ ERROR: Should have been rejected but succeeded');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ SUCCESS: Correctly rejected role mismatch');
        console.log('Error:', error.response.data.message);
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 2: Customer credentials with producer role selection
    console.log('Test 2: Customer credentials + Producer role selection');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'customer@test.com',
        password: 'password123',
        role: 'producer'
      });
      console.log('❌ ERROR: Should have been rejected but succeeded');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ SUCCESS: Correctly rejected role mismatch');
        console.log('Error:', error.response.data.message);
      } else {
        console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 3: Login without specifying role (should work)
    console.log('Test 3: Producer credentials without role specification');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'producer@test.com',
        password: 'password123'
        // No role specified
      });
      console.log('✅ SUCCESS: Login without role works');
      console.log('User role:', response.data.user.role);
    } catch (error) {
      console.log('❌ ERROR:', error.response?.data || error.message);
    }
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testRoleMismatch();
