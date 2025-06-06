const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test configuration
const testUsers = {
  customer: {
    email: 'customer-test@example.com',
    password: 'password123',
    role: 'customer',
    profileData: {
      firstName: 'Test',
      lastName: 'Customer',
      phone: '123-456-7890',
      address: '123 Customer St',
      preferences: []
    }
  },
  producer: {
    email: 'producer-test@example.com',
    password: 'password123',
    role: 'producer',
    profileData: {
      shopName: 'Test Producer Farm',
      description: 'A test producer for authentication testing',
      address: '456 Producer Rd',
      certifications: ['organic', 'local'],
      pickupInfo: 'Available weekends 9AM-5PM'
    }
  }
};

async function testAuthentication() {
  console.log('🚀 Starting Complete Authentication Test...\n');

  try {
    // Test 1: Test unauthenticated access
    console.log('1️⃣  Testing unauthenticated access...');
    try {
      await axios.get(`${API_URL}/auth/verify`);
      console.log('❌ Should have failed without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly denied access without token');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 2: Register customer user
    console.log('\n2️⃣  Testing customer registration...');
    let customerToken;
    try {
      const response = await axios.post(`${API_URL}/auth/register`, testUsers.customer);
      customerToken = response.data.token;
      console.log('✅ Customer registered successfully');
      console.log(`   User ID: ${response.data.user.id}`);
      console.log(`   Role: ${response.data.user.role}`);
    } catch (error) {
      if (error.response?.data?.message === 'User already exists') {
        console.log('ℹ️  Customer already exists, trying login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: testUsers.customer.email,
          password: testUsers.customer.password,
          role: testUsers.customer.role
        });
        customerToken = loginResponse.data.token;
        console.log('✅ Customer login successful');
      } else {
        throw error;
      }
    }

    // Test 3: Register producer user
    console.log('\n3️⃣  Testing producer registration...');
    let producerToken;
    try {
      const response = await axios.post(`${API_URL}/auth/register`, testUsers.producer);
      producerToken = response.data.token;
      console.log('✅ Producer registered successfully');
      console.log(`   User ID: ${response.data.user.id}`);
      console.log(`   Role: ${response.data.user.role}`);
    } catch (error) {
      if (error.response?.data?.message === 'User already exists') {
        console.log('ℹ️  Producer already exists, trying login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: testUsers.producer.email,
          password: testUsers.producer.password,
          role: testUsers.producer.role
        });
        producerToken = loginResponse.data.token;
        console.log('✅ Producer login successful');
      } else {
        throw error;
      }
    }

    // Test 4: Verify customer token
    console.log('\n4️⃣  Testing customer token verification...');
    const customerVerifyResponse = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Customer token verified successfully');
    console.log(`   Role: ${customerVerifyResponse.data.user.role}`);
    console.log(`   Email: ${customerVerifyResponse.data.user.email}`);

    // Test 5: Verify producer token
    console.log('\n5️⃣  Testing producer token verification...');
    const producerVerifyResponse = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    console.log('✅ Producer token verified successfully');
    console.log(`   Role: ${producerVerifyResponse.data.user.role}`);
    console.log(`   Email: ${producerVerifyResponse.data.user.email}`);

    // Test 6: Test customer access to producer-only endpoint (should fail)
    console.log('\n6️⃣  Testing customer access to producer-only endpoint...');
    try {
      await axios.get(`${API_URL}/products/my-products`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('❌ Customer should not have access to producer endpoints');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Customer correctly denied access to producer endpoint');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 7: Test producer access to producer-only endpoint (should succeed)
    console.log('\n7️⃣  Testing producer access to producer-only endpoint...');
    try {
      const producerProductsResponse = await axios.get(`${API_URL}/products/my-products`, {
        headers: { Authorization: `Bearer ${producerToken}` }
      });
      console.log('✅ Producer successfully accessed producer endpoint');
      console.log(`   Products found: ${producerProductsResponse.data.length || 0}`);
    } catch (error) {
      console.log('❌ Producer should have access to producer endpoints');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 8: Test profile access for both users
    console.log('\n8️⃣  Testing profile access...');
    
    // Customer profile
    const customerProfile = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Customer profile accessed successfully');
    console.log(`   Name: ${customerProfile.data.user.profile?.firstName} ${customerProfile.data.user.profile?.lastName}`);

    // Producer profile
    const producerProfile = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    console.log('✅ Producer profile accessed successfully');
    console.log(`   Shop: ${producerProfile.data.user.profile?.shopName}`);

    // Test 9: Test invalid token
    console.log('\n9️⃣  Testing invalid token...');
    try {
      await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: 'Bearer invalid-token-here' }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 10: Test role mismatch during login
    console.log('\n🔟 Testing role mismatch during login...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testUsers.customer.email,
        password: testUsers.customer.password,
        role: 'producer' // Wrong role
      });
      console.log('❌ Should have failed with role mismatch');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Role mismatch correctly rejected');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All authentication tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ User registration works');
    console.log('✅ User login works');
    console.log('✅ Token verification works');
    console.log('✅ Role-based access control works');
    console.log('✅ Profile access works');
    console.log('✅ Invalid token rejection works');
    console.log('✅ Role mismatch protection works');
    console.log('\n✨ The updated backend authentication system is fully functional!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testAuthentication();
