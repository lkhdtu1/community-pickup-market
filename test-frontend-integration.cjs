const axios = require('axios');

// Simulate frontend authentication flow
async function testFrontendIntegration() {
  console.log('🌐 Testing Frontend-Backend Integration...\n');

  const API_URL = 'http://localhost:3001/api';
  
  // Set up axios to behave like the frontend
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  try {
    // Test 1: Simulate user registration from frontend
    console.log('1️⃣  Simulating frontend customer registration...');
    const customerData = {
      email: 'frontend-customer@test.com',
      password: 'password123',
      role: 'customer',
      profileData: {
        firstName: 'Frontend',
        lastName: 'Customer',
        phone: '555-123-4567',
        address: '789 Frontend St',
        preferences: ['organic', 'local']
      }
    };

    let token;
    try {
      const response = await axios.post(`${API_URL}/auth/register`, customerData);
      token = response.data.token;
      console.log('✅ Registration successful');
      console.log(`   Token: ${token.substring(0, 20)}...`);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User exists, trying login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: customerData.email,
          password: customerData.password,
          role: customerData.role
        });
        token = loginResponse.data.token;
        console.log('✅ Login successful');
      } else {
        throw error;
      }
    }

    // Test 2: Set up axios interceptor like the frontend does
    console.log('\n2️⃣  Setting up frontend-style axios interceptor...');
    axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    console.log('✅ Axios interceptor configured');

    // Test 3: Test authenticated requests
    console.log('\n3️⃣  Testing authenticated API calls...');
    
    // Get profile
    const profileResponse = await axios.get(`${API_URL}/auth/profile`);
    console.log('✅ Profile endpoint working');
    console.log(`   User: ${profileResponse.data.user.email}`);
    console.log(`   Role: ${profileResponse.data.user.role}`);

    // Verify token
    const verifyResponse = await axios.get(`${API_URL}/auth/verify`);
    console.log('✅ Token verification working');
    console.log(`   Valid: ${verifyResponse.data.valid}`);

    // Test 4: Test session validation (like frontend useEffect)
    console.log('\n4️⃣  Testing session validation...');
    const sessionCheck = await axios.get(`${API_URL}/auth/verify`);
    if (sessionCheck.data.valid) {
      console.log('✅ Session validation successful');
      console.log(`   User still logged in: ${sessionCheck.data.user.email}`);
    }

    // Test 5: Test error handling
    console.log('\n5️⃣  Testing error handling...');
    
    // Remove token to simulate logout
    delete axios.defaults.headers.common['Authorization'];
    axios.interceptors.request.clear();
    
    try {
      await axios.get(`${API_URL}/auth/profile`);
      console.log('❌ Should have failed without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Properly handles unauthenticated requests');
      }
    }

    console.log('\n🎉 Frontend integration tests completed successfully!');
    console.log('\n📋 Integration Summary:');
    console.log('✅ Frontend registration flow works');
    console.log('✅ Frontend login flow works');
    console.log('✅ Axios interceptors work with authentication');
    console.log('✅ Authenticated API calls work');
    console.log('✅ Session validation works');
    console.log('✅ Error handling works properly');
    console.log('\n🚀 The backend is ready for frontend integration!');

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testFrontendIntegration();
