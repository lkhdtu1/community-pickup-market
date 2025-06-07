const axios = require('axios');

async function testAuthEndpoint() {
  try {
    console.log('Testing auth endpoint directly...');
    
    // Test auth endpoint with existing credentials
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-customer-1749250564798@example.com',
      password: 'testpass123'
    });
    
    console.log('✅ Backend is working! Auth login successful');
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    
    // Test the API base path
    try {
      const response2 = await axios.get('http://localhost:3001/api/products');
      console.log('✅ Products endpoint accessible:', response2.data.length, 'products');
    } catch (error) {
      console.log('❌ Products endpoint error:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.response?.status, error.response?.data?.message);
  }
}

testAuthEndpoint();
