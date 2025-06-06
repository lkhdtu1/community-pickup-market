const axios = require('axios');

async function debugRegistration() {
  try {
    console.log('🔍 Debugging registration endpoint...');    const response = await axios.post('http://localhost:3001/api/auth/register', {
      email: 'debug.producer@test.com',
      password: 'test123',
      role: 'producer',
      profileData: {
        shopName: 'Test Farm',
        description: 'Organic produce farm',
        address: '456 Farm Rd',
        certifications: ['Organic Certified', 'Local Farm'],
        pickupInfo: {
          location: '456 Farm Rd',
          hours: 'Mon-Fri 9-5',
          instructions: 'Ring bell at gate'
        }
      }
    });
    
    console.log('✅ Registration successful:', response.data);
  } catch (error) {
    console.log('❌ Registration failed');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

debugRegistration();
