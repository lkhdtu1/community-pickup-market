const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testLoginRedirect() {
  console.log('🔍 Testing Login Redirect Functionality...\n');

  try {
    // Test 1: Login as customer and verify role
    console.log('1. Testing Customer Login...');
    const customerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    });

    if (customerLogin.data.user.role === 'customer') {
      console.log('✅ Customer login successful - should redirect to /products');
      console.log(`   User role: ${customerLogin.data.user.role}`);
    } else {
      console.log('❌ Customer login returned wrong role');
    }

    // Test 2: Login as producer and verify role
    console.log('\n2. Testing Producer Login...');
    const producerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123',
      role: 'producer'
    });

    if (producerLogin.data.user.role === 'producer') {
      console.log('✅ Producer login successful - should redirect to /account/provider');
      console.log(`   User role: ${producerLogin.data.user.role}`);
    } else {
      console.log('❌ Producer login returned wrong role');
    }

    // Test 3: Test role mismatch error
    console.log('\n3. Testing Role Mismatch Error...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'customer@test.com',
        password: 'password123',
        role: 'producer' // Wrong role
      });
      console.log('❌ Role mismatch should have failed but didn\'t');
    } catch (error) {
      if (error.response?.data?.message === 'Invalid credentials for this account type') {
        console.log('✅ Role mismatch correctly rejected');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.data?.message}`);
      }
    }

    console.log('\n🎉 Login redirect tests completed!');
    console.log('\nFrontend behavior should be:');
    console.log('- Customer login → Navigate to /products');
    console.log('- Producer login → Navigate to /account/provider');
    console.log('- Wrong role selection → Show appropriate error message');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3001');
      console.log('   Run: cd server && npm start');
    }
  }
}

// Check if test users exist, if not, create them
async function setupTestUsers() {
  console.log('🔧 Setting up test users...\n');

  try {
    // Try to register test customer
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: 'customer@test.com',
        password: 'password123',
        role: 'customer',
        profileData: {
          firstName: 'Test',
          lastName: 'Customer',
          phone: '1234567890',
          address: 'Test Address',
          preferences: []
        }
      });
      console.log('✅ Test customer created');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  Test customer already exists');
      } else {
        console.log('❌ Failed to create test customer:', error.response?.data?.message);
      }
    }

    // Try to register test producer
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: 'producer@test.com',
        password: 'password123',
        role: 'producer',
        profileData: {
          shopName: 'Test Producer Shop',
          description: 'Test producer for authentication testing',
          address: 'Test Producer Address',
          certifications: [],
          pickupInfo: {
            location: 'Test Location',
            hours: '9-17',
            instructions: 'Test instructions'
          }
        }
      });
      console.log('✅ Test producer created');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  Test producer already exists');
      } else {
        console.log('❌ Failed to create test producer:', error.response?.data?.message);
      }
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
  }
}

// Run the tests
async function main() {
  await setupTestUsers();
  await testLoginRedirect();
}

main();
