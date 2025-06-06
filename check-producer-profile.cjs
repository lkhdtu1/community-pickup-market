const axios = require('axios');

async function checkProducerProfile() {
  try {
    // Login as producer
    const producerLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-producer-1749250564798@example.com',
      password: 'password123'
    });
    
    const producerToken = producerLogin.data.token;
    console.log('Producer login successful');

    // Get producer profile
    const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${producerToken}` }
    });

    console.log('Producer profile:');
    console.log(JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkProducerProfile();
