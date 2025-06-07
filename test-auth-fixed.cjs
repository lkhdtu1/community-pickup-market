const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🔍 Testing Authentication System...\n');

  try {
    // Test 1: Try to register a new user
    console.log('1. Testing Registration...');
    const registerData = {
      email: 'testuser@example.com',
      password: 'password123',
      role: 'customer',
      profileData: {
        firstName: 'Test',
        lastName: 'User',
        phone: '123-456-7890',
        address: '123 Test St'
      }
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData)
      .catch(err => ({ error: true, response: err.response }));

    if (registerResponse.error) {
      if (registerResponse.response?.status === 400 && 
          registerResponse.response?.data?.message?.includes('already exists')) {
        console.log('✅ User already exists, will test login');
      } else {
        console.log('❌ Registration failed:', registerResponse.response?.data?.message || 'Unknown error');
        return false;
      }
    } else {
      console.log('✅ Registration successful');
      console.log('Token received:', registerResponse.data.token?.substring(0, 20) + '...');
    }

    // Test 2: Try to login
    console.log('\n2. Testing Login...');
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123',
      role: 'customer'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('Token received:', loginResponse.data.token.substring(0, 20) + '...');
      console.log('User info:', {
        id: loginResponse.data.user.id,
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role
      });

      // Test 3: Test profile access
      console.log('\n3. Testing Profile Access...');
      const token = loginResponse.data.token;
      const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.status === 200) {
        console.log('✅ Profile access successful');
        console.log('Profile data available');
      }

      return true;
    } else {
      console.log('❌ Login failed');
      return false;
    }

  } catch (error) {
    console.error('❌ Auth test error:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test rapid requests to verify rate limiting is disabled
async function testRateLimiting() {
  console.log('\n4. Testing Rate Limiting (should be disabled)...');
  
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(
      axios.post(`${BASE_URL}/auth/login`, {
        email: 'testuser@example.com',
        password: 'wrongpassword'
      }).catch(err => err.response)
    );
  }

  const results = await Promise.all(promises);
  const rateLimited = results.filter(r => r.status === 429).length;
  const processed = results.filter(r => r.status !== 429).length;

  console.log(`✅ Processed: ${processed}/20 requests`);
  console.log(`⚠️  Rate limited: ${rateLimited}/20 requests`);

  if (rateLimited === 0) {
    console.log('✅ Rate limiting is completely disabled - authentication should work freely');
  } else {
    console.log('⚠️  Some rate limiting still active');
  }
}

async function runFullTest() {
  const authWorking = await testAuth();
  await testRateLimiting();

  console.log('\n🎯 FINAL RESULT:');
  if (authWorking) {
    console.log('✅ AUTHENTICATION IS WORKING CORRECTLY!');
    console.log('');
    console.log('You can now:');
    console.log('- Register new users');
    console.log('- Login with existing credentials');
    console.log('- Access user profiles');
    console.log('');
    console.log('🚀 Try logging in at: http://localhost:3000');
  } else {
    console.log('❌ Authentication still has issues');
  }
}

runFullTest().catch(console.error);
