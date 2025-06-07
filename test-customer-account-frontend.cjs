const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:8082';

// Test credentials
const testUser = {
  email: 'customer@test.com',
  password: 'password123'
};

async function testCustomerAccountIntegration() {
  try {
    console.log('🧪 Testing Customer Account Frontend Integration...\n');

    // Step 1: Login to get token
    console.log('📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log('✅ Login successful');    // Step 2: Get customer profile
    console.log('\n📝 Step 2: Getting customer profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Extract customer data correctly
    const userData = profileResponse.data.user;
    const customerProfile = userData.profile;
    console.log('✅ Customer profile:', {
      firstName: customerProfile.firstName,
      lastName: customerProfile.lastName,
      email: userData.email,
      phone: customerProfile.phone
    });

    // Step 3: Get payment methods
    console.log('\n📝 Step 3: Getting payment methods...');
    const paymentMethodsResponse = await axios.get(`${BASE_URL}/users/customer/payment-methods`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${paymentMethodsResponse.data.length} payment methods:`);
    paymentMethodsResponse.data.forEach((pm, index) => {
      console.log(`   ${index + 1}. ${pm.cardBrand.toUpperCase()} ****${pm.cardLastFour} (${pm.expiryMonth}) - ${pm.isDefault ? 'Default' : 'Secondary'}`);
    });

    // Step 4: Get addresses
    console.log('\n📝 Step 4: Getting addresses...');
    const addressesResponse = await axios.get(`${BASE_URL}/users/customer/addresses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${addressesResponse.data.length} addresses:`);
    addressesResponse.data.forEach((addr, index) => {
      console.log(`   ${index + 1}. ${addr.type.toUpperCase()}: ${addr.street}, ${addr.city}, ${addr.postalCode} - ${addr.isDefault ? 'Default' : 'Secondary'}`);
    });

    // Step 5: Test adding a new address
    console.log('\n📝 Step 5: Testing add new address...');
    const newAddress = {
      type: 'shipping',
      street: '789 Test Street',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France',
      firstName: 'Test',
      lastName: 'User',
      phone: '+33987654321',
      isDefault: false
    };

    const addAddressResponse = await axios.post(`${BASE_URL}/users/customer/addresses`, newAddress, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ New address added:', addAddressResponse.data.id);

    // Step 6: Test updating an address
    console.log('\n📝 Step 6: Testing update address...');
    const updatedAddressData = {
      street: '789 Updated Test Street',
      city: 'Marseille',
      postalCode: '13002'
    };

    await axios.put(`${BASE_URL}/users/customer/addresses/${addAddressResponse.data.id}`, updatedAddressData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Address updated successfully');

    // Step 7: Test deleting the address
    console.log('\n📝 Step 7: Testing delete address...');
    await axios.delete(`${BASE_URL}/users/customer/addresses/${addAddressResponse.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Address deleted successfully');

    console.log('\n🎉 All Customer Account Integration Tests Passed!');
    console.log('\n📋 What to test manually in the frontend:');
    console.log('1. Go to: ' + FRONTEND_URL);
    console.log('2. Click "Se connecter" and login with:');
    console.log('   Email: customer@test.com');
    console.log('   Password: password123');
    console.log('3. Click on the user avatar/menu and select "Mon compte"');
    console.log('4. Verify the following tabs work:');
    console.log('   ✓ Profil - shows customer info and allows editing');
    console.log('   ✓ Moyens de paiement - shows payment methods (should show test cards)');
    console.log('   ✓ Adresses - shows addresses (should show test addresses)');
    console.log('   ✓ Commandes - shows order history');
    console.log('5. Test adding/editing/deleting addresses using the UI');
    console.log('6. Test the payment method modal (currently shows mock Stripe integration)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCustomerAccountIntegration();
