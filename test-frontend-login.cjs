const axios = require('axios');

// Simulate frontend login behavior
async function testFrontendLogin() {
  console.log('=== Testing Frontend Login Behavior ===\n');
  
  const API_URL = 'http://localhost:3001/api';
  
  // Test case: User selects "Customer" but enters producer credentials
  console.log('Test: User selects "Customer" but enters producer credentials');
  console.log('Email: producer@test.com');
  console.log('Password: password123');
  console.log('Selected Role: customer');
  console.log('');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123',
      role: 'customer'  // This is what currentUserType would be
    });
    
    console.log('❌ UNEXPECTED: Login succeeded when it should have failed!');
    console.log('Backend returned user:', response.data.user);
    console.log('This means the user would be logged in as:', response.data.user.role);
    
  } catch (error) {
    if (error.response?.status === 401 && error.response?.data?.message === 'Invalid credentials for this account type') {
      console.log('✅ CORRECT: Backend rejected the login');
      console.log('Error message:', error.response.data.message);
      console.log('Frontend should display: "Ce compte n\'est pas un compte client. Veuillez sélectionner le bon type de compte."');
    } else {
      console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test case: User selects "Producer" and enters producer credentials (should work)
  console.log('Test: User selects "Producer" and enters producer credentials');
  console.log('Email: producer@test.com');
  console.log('Password: password123');
  console.log('Selected Role: producer');
  console.log('');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123',
      role: 'producer'
    });
    
    console.log('✅ CORRECT: Login succeeded');
    console.log('User role:', response.data.user.role);
    console.log('Frontend should navigate to:', response.data.user.role === 'customer' ? '/products' : '/account/provider');
    
  } catch (error) {
    console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
  }
}

testFrontendLogin();
