// Simple test script to verify authentication APIs
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testAuthFlow() {
  try {
    console.log('🚀 Testing authentication flow...\n');

    // Test 1: Register a new customer
    console.log('1. Testing customer registration...');
    const customerData = {
      email: `test-customer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer',
      profileData: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        address: '123 Test Street',
        preferences: []
      }
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, customerData);
    console.log('✅ Customer registration successful');
    console.log('Response:', {
      message: registerResponse.data.message,
      user: registerResponse.data.user,
      tokenExists: !!registerResponse.data.token
    });

    const customerToken = registerResponse.data.token;

    // Test 2: Login with the registered customer
    console.log('\n2. Testing customer login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: customerData.email,
      password: customerData.password
    });
    console.log('✅ Customer login successful');
    console.log('Response:', {
      message: loginResponse.data.message,
      user: loginResponse.data.user,
      tokenExists: !!loginResponse.data.token
    });

    // Test 3: Get profile with token
    console.log('\n3. Testing profile retrieval...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    console.log('✅ Profile retrieval successful');
    console.log('Profile:', profileResponse.data.user);

    // Test 4: Verify token
    console.log('\n4. Testing token verification...');
    const verifyResponse = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    console.log('✅ Token verification successful');
    console.log('Verification:', verifyResponse.data);

    // Test 5: Register a producer
    console.log('\n5. Testing producer registration...');
    const producerData = {
      email: `test-producer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'producer',
      profileData: {
        shopName: 'Test Farm',
        description: 'A test farm for testing',
        address: '456 Farm Road',
        certifications: [],
        pickupInfo: 'Available daily 9-17'
      }
    };

    const producerRegisterResponse = await axios.post(`${API_URL}/auth/register`, producerData);
    console.log('✅ Producer registration successful');
    console.log('Response:', {
      message: producerRegisterResponse.data.message,
      user: producerRegisterResponse.data.user,
      tokenExists: !!producerRegisterResponse.data.token
    });

    // Test 6: Login as producer
    console.log('\n6. Testing producer login...');
    const producerLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: producerData.email,
      password: producerData.password
    });
    console.log('✅ Producer login successful');
    console.log('Response:', {
      message: producerLoginResponse.data.message,
      user: producerLoginResponse.data.user,
      profile: producerLoginResponse.data.user.profile
    });

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthFlow();
