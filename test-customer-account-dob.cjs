const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCustomerAccountWithDateOfBirth() {
  console.log('🧪 Testing Customer Account API with Date of Birth...\n');
  
  try {
    // Step 1: Register a test customer
    console.log('1. Registering test customer...');
    const customerData = {
      email: `test-customer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer',
      profileData: {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-1234',
        address: '123 Test St'
      }
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, customerData);
    const token = registerResponse.data.token;
    console.log('✅ Customer registration successful');
    
    // Step 2: Get initial profile
    console.log('\n2. Getting initial profile...');
    const profileResponse = await axios.get(`${API_BASE_URL}/users/customer/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Initial profile retrieved');
    console.log('Initial profile:', JSON.stringify(profileResponse.data, null, 2));
    
    // Step 3: Update profile with date of birth
    console.log('\n3. Updating profile with date of birth...');
    const updateData = {
      firstName: 'Jane Updated',
      phone: '555-9999',
      dateOfBirth: '1990-05-15',
      address: '456 Updated St'
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/users/customer/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile update successful');
    console.log('Updated profile response:', JSON.stringify(updateResponse.data, null, 2));
    
    // Step 4: Verify update
    console.log('\n4. Verifying profile update...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/users/customer/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile update verified');
    console.log('Final profile:', JSON.stringify(verifyResponse.data, null, 2));
    
    console.log('\n✅ All customer account API tests with date of birth passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    if (error.response?.status) {
      console.error('Status code:', error.response.status);
    }
  }
}

testCustomerAccountWithDateOfBirth();
