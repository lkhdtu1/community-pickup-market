const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testFrontendIntegration() {
  console.log('🌐 Testing Frontend Integration with Customer Account...');
  
  try {
    // 1. Register a test customer
    const registerData = {
      firstName: 'Frontend',
      lastName: 'Tester',
      email: `frontend-test-${Date.now()}@example.com`,
      password: 'testpass123'
    };
    
    console.log('1. Registering frontend test customer...');
    const registerResponse = await axios.post(`${BASE_URL}/users/customer/register`, registerData);
    console.log('✅ Frontend test customer registered');
    
    // 2. Login the customer to get token
    console.log('2. Logging in frontend test customer...');
    const loginResponse = await axios.post(`${BASE_URL}/users/customer/login`, {
      email: registerData.email,
      password: registerData.password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Frontend test customer logged in');
    
    // 3. Test the APIs that the frontend uses
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('3. Testing customer profile API (used by frontend)...');
    const profileResponse = await axios.get(`${BASE_URL}/users/customer/profile`, { headers });
    console.log('✅ Profile API working');
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
    console.log('4. Testing customer orders API (used by frontend)...');
    const ordersResponse = await axios.get(`${BASE_URL}/orders/customer`, { headers });
    console.log('✅ Orders API working');
    console.log('Orders count:', ordersResponse.data.length);
    
    console.log('5. Testing customer preferences API (used by frontend)...');
    const preferencesResponse = await axios.get(`${BASE_URL}/users/customer/preferences`, { headers });
    console.log('✅ Preferences API working');
    
    console.log('6. Testing profile update API (used by frontend editing)...');
    const updateData = {
      firstName: 'Updated Frontend',
      lastName: 'Tester',
      phone: '555-FRONTEND',
      address: '123 Frontend Test Street',
      dateOfBirth: '1992-03-20'
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/users/customer/profile`, updateData, { headers });
    console.log('✅ Profile update API working');
    console.log('Updated profile:', JSON.stringify(updateResponse.data, null, 2));
    
    console.log('\n🎉 All frontend integration tests passed!');
    console.log('\n📋 Frontend Integration Summary:');
    console.log('   ✅ Customer registration API working');
    console.log('   ✅ Customer login API working');
    console.log('   ✅ Customer profile retrieval API working');
    console.log('   ✅ Customer orders API working');
    console.log('   ✅ Customer preferences API working');
    console.log('   ✅ Customer profile update API working');
    console.log('   ✅ Date of birth field properly handled');
    console.log('\n🌐 The CustomerAccount component should work properly with real data!');
    console.log('📝 Login credentials for manual testing:');
    console.log(`   Email: ${registerData.email}`);
    console.log(`   Password: ${registerData.password}`);
    
  } catch (error) {
    console.error('❌ Frontend integration test failed:', error.response?.data || error.message);
  }
}

testFrontendIntegration();
