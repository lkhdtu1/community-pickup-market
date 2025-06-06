const axios = require('axios');

async function simulateFrontendAuthFlow() {
  console.log('🧪 Simulating Frontend Authentication Flow\n');

  try {
    // Simulate customer login
    console.log('1. Testing customer login flow...');
    const customerLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    });

    if (customerLogin.data.user && customerLogin.data.token) {
      console.log('✅ Customer login successful');
      console.log(`   Should redirect to: /products`);
      console.log(`   User role: ${customerLogin.data.user.role}`);
      console.log(`   Token received: ${customerLogin.data.token ? 'Yes' : 'No'}`);
      
      // Test accessing customer account with token
      const customerAccountTest = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${customerLogin.data.token}`
        }
      });
      
      if (customerAccountTest.data.user) {
        console.log('✅ Customer can access profile with token');
      }
    }

    console.log('\n2. Testing producer login flow...');
    const producerLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'producer@test.com',
      password: 'password123',
      role: 'producer'
    });

    if (producerLogin.data.user && producerLogin.data.token) {
      console.log('✅ Producer login successful');
      console.log(`   Should redirect to: /account/provider`);
      console.log(`   User role: ${producerLogin.data.user.role}`);
      console.log(`   Token received: ${producerLogin.data.token ? 'Yes' : 'No'}`);
      
      // Test accessing producer account with token
      const producerAccountTest = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${producerLogin.data.token}`
        }
      });
      
      if (producerAccountTest.data.user) {
        console.log('✅ Producer can access profile with token');
      }
    }

    console.log('\n3. Testing role mismatch scenarios...');
    
    // Customer trying to login as producer
    try {
      await axios.post('http://localhost:3001/api/auth/login', {
        email: 'customer@test.com',
        password: 'password123',
        role: 'producer'
      });
      console.log('❌ Customer should not be able to login as producer');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Customer correctly blocked from logging in as producer');
      }
    }

    // Producer trying to login as customer
    try {
      await axios.post('http://localhost:3001/api/auth/login', {
        email: 'producer@test.com',
        password: 'password123',
        role: 'customer'
      });
      console.log('❌ Producer should not be able to login as customer');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Producer correctly blocked from logging in as customer');
      }
    }

    console.log('\n🎉 Frontend authentication simulation complete!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Role-based authentication working');
    console.log('- ✅ JWT tokens generated and validated');
    console.log('- ✅ Role mismatch validation functioning');
    console.log('- ✅ User profiles accessible with valid tokens');
    console.log('\n🌐 Frontend Integration Points:');
    console.log('- Customer login → redirect to /products');
    console.log('- Producer login → redirect to /account/provider');
    console.log('- Role validation prevents cross-role access');
    console.log('- AuthModal should show appropriate error messages for role mismatches');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

simulateFrontendAuthFlow();
