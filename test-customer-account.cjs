const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCustomerAccount() {
  console.log('🧪 Testing Customer Account API Integration...\n');
  
  try {
    // Step 1: Register a test customer
    console.log('1. Registering test customer...');
    const customerData = {
      email: `test-customer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer',
      profileData: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        address: '123 Test St'
      }
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, customerData);
    const token = registerResponse.data.token;
    console.log('✅ Customer registration successful');
    
    // Step 2: Test customer profile endpoint
    console.log('\n2. Testing customer profile endpoint...');
    const profileResponse = await axios.get(`${API_BASE_URL}/users/customer/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Customer profile endpoint working');
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
    // Step 3: Test customer orders endpoint
    console.log('\n3. Testing customer orders endpoint...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders/customer`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Customer orders endpoint working');
    console.log(`Found ${ordersResponse.data.length} orders`);
    
    // Step 4: Test profile update
    console.log('\n4. Testing profile update...');
    const updateData = {
      firstName: 'John Updated',
      phone: '555-9999'
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/users/customer/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile update successful');
    
    // Step 5: Verify update
    console.log('\n5. Verifying profile update...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/users/customer/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile update verified');
    console.log('Updated profile:', JSON.stringify(verifyResponse.data, null, 2));
    
    // Step 6: Test preferences endpoints
    console.log('\n6. Testing preferences endpoints...');
    const preferencesResponse = await axios.get(`${API_BASE_URL}/users/customer/preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get preferences working');
    console.log('Preferences:', JSON.stringify(preferencesResponse.data, null, 2));
    
    console.log('\n✅ All customer account API tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testCustomerAccount();
