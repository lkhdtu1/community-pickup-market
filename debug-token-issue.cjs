const axios = require('axios');

async function debugTokenIssue() {
  console.log('🔍 Debugging Token Authentication Issue\n');

  try {
    // First, get a token
    console.log('1. Getting authentication token...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    });

    const token = loginResponse.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('Token length:', token ? token.length : 'N/A');
    console.log('Token starts with:', token ? token.substring(0, 20) + '...' : 'N/A');

    // Try to use the token
    console.log('\n2. Testing token with profile endpoint...');
    try {
      const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Token works! Profile data:', profileResponse.data);
    } catch (error) {
      console.log('❌ Token failed:', error.response?.data);
      console.log('Status:', error.response?.status);
      
      // Debug the authorization header
      console.log('\nDebugging authorization header...');
      console.log('Full header value:', `Bearer ${token}`);
      
      // Try without Bearer prefix (might be middleware issue)
      try {
        const altResponse = await axios.get('http://localhost:3001/api/auth/profile', {
          headers: {
            'Authorization': token
          }
        });
        console.log('✅ Token works without Bearer prefix:', altResponse.data);
      } catch (altError) {
        console.log('❌ Token failed without Bearer prefix too:', altError.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

debugTokenIssue();
