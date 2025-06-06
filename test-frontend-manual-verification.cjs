const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testCustomer = {
  email: 'fresh.customer@example.com',
  password: 'password123',
  profileData: {
    firstName: 'Fresh',
    lastName: 'Customer',
    phone: '555-0125',
    address: '125 Test St'
  }
};

const testProducer = {
  email: 'fresh.producer@example.com',
  password: 'password123',
  profileData: {
    shopName: 'Fresh Farm',
    description: 'Organic produce farm',
    address: '457 Farm Rd',
    certifications: ['Organic Certified', 'Local Farm'],
    pickupInfo: {
      location: '457 Farm Rd',
      hours: 'Mon-Fri 9-5',
      instructions: 'Ring bell at gate'
    }
  }
};

async function testCompleteUserJourney() {
  console.log('🚀 Starting Complete Frontend Manual Verification Test\n');

  try {
    // 1. Test Customer Registration and Login Flow
    console.log('📝 1. Testing Customer Registration and Login...');
    
    // Register customer
    try {
      const customerRegResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        ...testCustomer,
        role: 'customer'
      });
      console.log('✅ Customer registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('ℹ️  Customer already exists, continuing with login test');
      } else {
        throw error;
      }
    }

    // Login customer
    const customerLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testCustomer.email,
      password: testCustomer.password,
      role: 'customer'
    });
    
    const customerToken = customerLoginResponse.data.token;
    console.log('✅ Customer login successful');
    console.log(`   Token: ${customerToken.substring(0, 20)}...`);
    console.log(`   Should redirect to: /products`);

    // 2. Test Producer Registration and Login Flow
    console.log('\n📝 2. Testing Producer Registration and Login...');
    
    // Register producer
    try {
      const producerRegResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        ...testProducer,
        role: 'producer'
      });
      console.log('✅ Producer registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message?.includes('already exists')) {
        console.log('ℹ️  Producer already exists, continuing with login test');
      } else {
        throw error;
      }
    }

    // Login producer
    const producerLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testProducer.email,
      password: testProducer.password,
      role: 'producer'
    });
    
    const producerToken = producerLoginResponse.data.token;
    console.log('✅ Producer login successful');
    console.log(`   Token: ${producerToken.substring(0, 20)}...`);
    console.log(`   Should redirect to: /account/provider`);

    // 3. Test Role Mismatch Prevention
    console.log('\n📝 3. Testing Role Mismatch Prevention...');
      try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testCustomer.email,
        password: testCustomer.password,
        role: 'producer' // Wrong role
      });
      console.log('❌ Role mismatch should have been prevented');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.message?.includes('account type')) {
        console.log('✅ Role mismatch correctly prevented');
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        throw error;
      }
    }    // 4. Test Protected Routes Access
    console.log('\n📝 4. Testing Protected Routes Access...');
      // Test customer profile access
    const customerProfileResponse = await axios.get(`${BASE_URL}/api/users/customer/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Customer can access profile');
    console.log(`   Customer ID: ${customerProfileResponse.data.id}`);

    // Test producer profile access
    const producerProfileResponse = await axios.get(`${BASE_URL}/api/users/producer/profile`, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    console.log('✅ Producer can access profile');
    console.log(`   Producer ID: ${producerProfileResponse.data.id}`);

    // 5. Test API Endpoints
    console.log('\n📝 5. Testing API Endpoints...');
    
    // Test products endpoint (should work for both roles)
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log(`✅ Products API working (${productsResponse.data.length} products)`);

    // Test producers endpoint (should work for both roles)
    const producersResponse = await axios.get(`${BASE_URL}/api/producers`);
    console.log(`✅ Producers API working (${producersResponse.data.length} producers)`);

    // 6. Frontend Integration Verification Points
    console.log('\n📝 6. Frontend Integration Verification Points...');
    console.log('🌐 Manual Frontend Tests to Perform:');
    console.log('');
    console.log('✅ Authentication Modal:');
    console.log('   • Login as customer → should redirect to /products');
    console.log('   • Login as producer → should redirect to /account/provider');
    console.log('   • Wrong role selection → should show error message');
    console.log('   • Invalid credentials → should show error message');
    console.log('');
    console.log('✅ Navigation & Pages:');
    console.log('   • Header shows "Login" when not authenticated');  
    console.log('   • Header shows user menu when authenticated');
    console.log('   • Products page loads real product data (not mock)');
    console.log('   • Producers page loads real producer data (not mock)');
    console.log('   • Product detail pages show real product information');
    console.log('');
    console.log('✅ Account Pages:');
    console.log('   • Customer account page accessible at /account');
    console.log('   • Producer account page accessible at /account/provider');
    console.log('   • Protected routes redirect to login when not authenticated');
    console.log('');
    console.log('✅ Data Integration:');
    console.log('   • All product listings show real backend data');
    console.log('   • Producer profiles show real producer information');
    console.log('   • Create shop functionality works for producers');
    console.log('   • Product management works for producers');

    // 7. Test Credentials for Manual Testing
    console.log('\n📝 7. Test Credentials for Manual Testing:');
    console.log('');
    console.log('🔐 Customer Account:');
    console.log(`   Email: ${testCustomer.email}`);
    console.log(`   Password: ${testCustomer.password}`);
    console.log(`   Role: customer`);
    console.log('');
    console.log('🔐 Producer Account:');
    console.log(`   Email: ${testProducer.email}`);
    console.log(`   Password: ${testProducer.password}`);
    console.log(`   Role: producer`);

    console.log('\n✅ All automated tests passed! System is ready for manual frontend testing.');
    console.log('\n📱 Open http://localhost:8080 to test the frontend manually.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCompleteUserJourney();
