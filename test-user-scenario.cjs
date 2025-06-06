const axios = require('axios');

async function testUserScenario() {
  console.log('=== Testing User Experience Scenario ===\n');
  
  const API_URL = 'http://localhost:3001/api';
  
  // Scenario: User clicks "Login" in header, modal opens with "Client" selected by default
  // User has producer credentials but doesn't notice the "Client" selection
  console.log('🔍 Scenario: User logs in with producer credentials while "Client" is selected');
  console.log('   - Modal opens with "Client" (customer) selected by default');
  console.log('   - User enters: producer@test.com / password123');
  console.log('   - User clicks "Se connecter" without changing to "Producteur"');
  console.log('');
  
  try {
    // This simulates what happens when AuthModal sends the login request
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123',
      role: 'customer'  // This is what currentUserType would be ('customer' by default)
    });
    
    console.log('❌ PROBLEM: User would be confused - login succeeded but this should fail!');
    console.log('   User expected to login as customer but backend returned:', response.data.user.role);
    
  } catch (error) {
    if (error.response?.status === 401 && error.response?.data?.message === 'Invalid credentials for this account type') {
      console.log('✅ CORRECT BEHAVIOR: Backend rejects the login');
      console.log('   Frontend shows: "Ce compte n\'est pas un compte client. Veuillez sélectionner le bon type de compte."');
      console.log('   User then realizes they need to select "Producteur" instead');
    } else {
      console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Follow-up: User realizes mistake and selects "Producteur"
  console.log('🔄 Follow-up: User clicks "Producteur" and tries again');
  console.log('   - User clicks the "Producteur" button in the modal');
  console.log('   - User enters same credentials: producer@test.com / password123');
  console.log('   - User clicks "Se connecter"');
  console.log('');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'producer@test.com',
      password: 'password123',
      role: 'producer'  // Now currentUserType is 'producer'
    });
    
    console.log('✅ SUCCESS: User successfully logs in');
    console.log('   Backend returns user with role:', response.data.user.role);
    console.log('   Frontend navigates to: /account/provider');
    
  } catch (error) {
    console.log('❌ UNEXPECTED ERROR:', error.response?.data || error.message);
  }
}

testUserScenario();
