import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testLoginRoleValidation() {
  try {
    console.log('Testing login role validation...');
    
    // First test: Try to login as customer with producer credentials
    console.log('\n1. Testing producer account trying to login as customer...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'test-producer@example.com',
        password: 'password123',
        role: 'customer' // This should fail
      });
      console.log('❌ ERROR: Producer was able to login as customer!');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ SUCCESS: Login correctly rejected with role mismatch');
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Second test: Login with correct role
    console.log('\n2. Testing producer account with correct role...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'test-producer@example.com',
        password: 'password123',
        role: 'producer' // This should work
      });
      console.log('✅ SUCCESS: Producer can login as producer');
      console.log('User role:', response.data.user.role);
    } catch (error) {
      console.log('❌ ERROR: Producer cannot login as producer');
      console.log('Error:', error.response?.data || error.message);
    }

    // Third test: Login without specifying role (should work)
    console.log('\n3. Testing producer account without specifying role...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'test-producer@example.com',
        password: 'password123'
        // No role specified
      });
      console.log('✅ SUCCESS: Producer can login without specifying role');
      console.log('User role:', response.data.user.role);
    } catch (error) {
      console.log('❌ ERROR: Producer cannot login without role');
      console.log('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test setup error:', error.message);
  }
}

// Run the test
testLoginRoleValidation()
  .then(() => {
    console.log('\n🔍 Role validation test completed');
    process.exit(0);
  })
  .catch(() => {
    console.log('\n💥 Test failed');
    process.exit(1);
  });
