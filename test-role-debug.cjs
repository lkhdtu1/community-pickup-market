const axios = require('axios');

async function testRoleMismatch() {
  try {
    console.log('Testing role mismatch...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'customer@test.com',
      password: 'password123',
      role: 'producer'
    });
    console.log('❌ Should have failed but got:', response.data);
  } catch (error) {
    console.log('✅ Correctly failed with:', error.response?.data);
  }
}

testRoleMismatch();
