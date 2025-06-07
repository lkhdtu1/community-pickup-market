const axios = require('axios');

async function quickBackendTest() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic connectivity
    const response = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Backend health check:', response.data);
    
    // Test auth endpoint
    try {
      await axios.post('http://localhost:3001/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpass'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth endpoint responding correctly');
      } else {
        console.log('❌ Auth endpoint error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.error('Make sure backend server is running on port 3001');
  }
}

quickBackendTest();
