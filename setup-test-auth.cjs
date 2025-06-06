const axios = require('axios');

async function setupAndTestAuth() {
  try {
    console.log('🧪 Setting up fresh test users and testing authentication...\n');
    
    // Create a new test customer
    console.log('1. Creating new test customer...');
    const customerData = {
      email: `test-customer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer',
      profileData: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        address: '123 Test St',
        preferences: []
      }
    };
    
    const customerRegResponse = await axios.post('http://localhost:3001/api/auth/register', customerData);
    console.log('✅ Customer created successfully');
    console.log('Customer:', customerRegResponse.data.user);
    
    // Test customer login
    console.log('\n2. Testing customer login...');
    const customerLoginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: customerData.email,
      password: customerData.password
    });
    console.log('✅ Customer login successful');
    const customerToken = customerLoginResponse.data.token;
    
    // Test profile retrieval
    console.log('\n3. Testing profile retrieval...');
    const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Profile retrieved successfully');
    
    // Create a new test producer
    console.log('\n4. Creating new test producer...');
    const producerData = {
      email: `test-producer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'producer',
      profileData: {
        shopName: 'Test Farm',
        description: 'Organic vegetables',
        address: '456 Farm Rd',
        certifications: ['organic'],
        pickupInfo: 'Available weekends'
      }
    };
    
    const producerRegResponse = await axios.post('http://localhost:3001/api/auth/register', producerData);
    console.log('✅ Producer created successfully');
    console.log('Producer:', producerRegResponse.data.user);
    
    // Test producer login
    console.log('\n5. Testing producer login...');
    const producerLoginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: producerData.email,
      password: producerData.password
    });
    console.log('✅ Producer login successful');
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📝 Test credentials for frontend testing:');
    console.log('Customer:', customerData.email, '/ password123');
    console.log('Producer:', producerData.email, '/ password123');
    console.log('\n🌐 Frontend available at: http://localhost:8082');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

setupAndTestAuth();
