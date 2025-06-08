import axios from 'axios';

async function testCustomerAPI() {
  try {
    console.log('🧪 Testing Customer API...');
    
    // Test login with known customer credentials
    console.log('1. Testing customer login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'customer@test.com',
      password: 'password123'
    });
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Test customer profile
    console.log('2. Testing customer profile...');
    const profileResponse = await axios.get('http://localhost:3001/api/users/customer/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Customer profile loaded:');
    console.log(JSON.stringify(profileResponse.data, null, 2));
    
    // Test payment methods
    console.log('3. Testing payment methods...');
    const paymentResponse = await axios.get('http://localhost:3001/api/users/customer/payment-methods', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Payment methods: ${paymentResponse.data.length} found`);
    
    // Test addresses
    console.log('4. Testing addresses...');
    const addressResponse = await axios.get('http://localhost:3001/api/users/customer/addresses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Addresses: ${addressResponse.data.length} found`);
    
    console.log('\n🎉 All customer API tests passed!');
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testCustomerAPI();
