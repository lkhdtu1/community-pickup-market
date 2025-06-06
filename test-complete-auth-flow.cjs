const axios = require('axios');

async function testCompleteAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow\n');

  try {
    // Test 1: Role mismatch validation
    console.log('1. Testing role mismatch validation...');
    try {
      await axios.post('http://localhost:3001/api/auth/login', {
        email: 'customer@test.com',
        password: 'password123',
        role: 'producer'
      });
      console.log('❌ Role mismatch should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Role mismatch correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 2: Valid customer login
    console.log('\n2. Testing valid customer login...');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'customer@test.com',
        password: 'password123',
        role: 'customer'
      });
      if (response.data.user && response.data.user.role === 'customer') {
        console.log('✅ Customer login successful');
        console.log(`   User ID: ${response.data.user.id}`);
        console.log(`   Email: ${response.data.user.email}`);
        console.log(`   Role: ${response.data.user.role}`);
      } else {
        console.log('❌ Customer login failed:', response.data);
      }
    } catch (error) {
      console.log('❌ Customer login error:', error.response?.data);
    }

    // Test 3: Valid producer login (if producer account exists)
    console.log('\n3. Testing valid producer login...');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'producer@test.com',
        password: 'password123',
        role: 'producer'
      });
      if (response.data.user && response.data.user.role === 'producer') {
        console.log('✅ Producer login successful');
        console.log(`   User ID: ${response.data.user.id}`);
        console.log(`   Email: ${response.data.user.email}`);
        console.log(`   Role: ${response.data.user.role}`);
      } else {
        console.log('❌ Producer login failed:', response.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('ℹ️  Producer account not found or invalid credentials');
      } else {
        console.log('❌ Producer login error:', error.response?.data);
      }
    }

    // Test 4: Login without role specified (should work)
    console.log('\n4. Testing login without role specified...');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'customer@test.com',
        password: 'password123'
      });
      if (response.data.user) {
        console.log('✅ Login without role successful');
        console.log(`   Role: ${response.data.user.role}`);
      } else {
        console.log('❌ Login without role failed:', response.data);
      }
    } catch (error) {
      console.log('❌ Login without role error:', error.response?.data);
    }

    console.log('\n🎉 Authentication flow testing complete!');

  } catch (error) {
    console.error('Test suite error:', error.message);
  }
}

testCompleteAuthFlow();
