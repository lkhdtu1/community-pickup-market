const axios = require('axios');

async function testAnalytics() {
  try {
    // First, let's login as a producer to get a token
    console.log('Testing analytics endpoint...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-producer-1749250564798@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token obtained');
    
    // Test the analytics endpoint
    const analyticsResponse = await axios.get('http://localhost:3001/api/orders/producer/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Analytics data received:');
    console.log(JSON.stringify(analyticsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing analytics:', error.response?.data || error.message);
  }
}

testAnalytics();
