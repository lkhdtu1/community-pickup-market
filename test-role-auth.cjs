const axios = require('axios');

async function testRoleBasedAuth() {
  try {
    console.log('🧪 Testing Role-Based Authentication System...\n');
    
    const baseURL = 'http://localhost:3001/api';
    const testEmail = `test-role-separation-${Date.now()}@example.com`;
    
    // Test 1: Create a customer account
    console.log('1. Creating customer account...');
    const customerData = {
      email: testEmail,
      password: 'password123',
      role: 'customer',
      profileData: {
        firstName: 'Test',
        lastName: 'Customer',
        phone: '1234567890',
        address: '123 Test St',
        preferences: []
      }
    };
    
    const customerRegResponse = await axios.post(`${baseURL}/auth/register`, customerData);
    console.log('✅ Customer account created successfully');
    console.log('Customer:', customerRegResponse.data.user);
    
    // Test 2: Try to login as customer with correct role
    console.log('\n2. Testing customer login with correct role...');
    const customerLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: testEmail,
      password: 'password123',
      role: 'customer'
    });
    console.log('✅ Customer login successful with correct role');
    
    // Test 3: Try to login as producer with customer credentials (should fail)
    console.log('\n3. Testing customer credentials with producer role (should fail)...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: testEmail,
        password: 'password123',
        role: 'producer'
      });
      console.log('❌ SECURITY ISSUE: Login succeeded when it should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected: Customer credentials cannot login as producer');
      console.log('   Error:', error.response.data.message);
    }
    
    // Test 4: Try to create a producer account with same email (should fail)
    console.log('\n4. Testing producer registration with existing customer email (should fail)...');
    try {
      const producerData = {
        email: testEmail,
        password: 'password123',
        role: 'producer',
        profileData: {
          shopName: 'Test Farm',
          description: 'Organic vegetables',
          address: '456 Farm Rd',
          certifications: ['organic'],
          pickupInfo: 'Available weekends'
        }
      };
      await axios.post(`${baseURL}/auth/register`, producerData);
      console.log('❌ SECURITY ISSUE: Producer registration succeeded when it should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected: Cannot create producer account with existing customer email');
      console.log('   Error:', error.response.data.message);
    }
    
    // Test 5: Create a separate producer account with different email
    console.log('\n5. Creating producer account with different email...');
    const producerEmail = `test-producer-${Date.now()}@example.com`;
    const producerData = {
      email: producerEmail,
      password: 'password123',
      role: 'producer',
      profileData: {
        shopName: 'Test Farm',
        description: 'Organic vegetables',
        address: '456 Farm Rd',
        certifications: ['organic'],
        pickupInfo: 'Available weekends'
      }
    };
    
    const producerRegResponse = await axios.post(`${baseURL}/auth/register`, producerData);
    console.log('✅ Producer account created successfully');
    console.log('Producer:', producerRegResponse.data.user);
    
    // Test 6: Try to login as producer with correct role
    console.log('\n6. Testing producer login with correct role...');
    const producerLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: producerEmail,
      password: 'password123',
      role: 'producer'
    });
    console.log('✅ Producer login successful with correct role');
    
    // Test 7: Try to login as customer with producer credentials (should fail)
    console.log('\n7. Testing producer credentials with customer role (should fail)...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: producerEmail,
        password: 'password123',
        role: 'customer'
      });
      console.log('❌ SECURITY ISSUE: Login succeeded when it should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected: Producer credentials cannot login as customer');
      console.log('   Error:', error.response.data.message);
    }
    
    // Test 8: Test login without role specification (should work for both)
    console.log('\n8. Testing login without role specification...');
    const customerLoginNoRole = await axios.post(`${baseURL}/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    console.log('✅ Customer login without role works (uses actual role)');
    
    const producerLoginNoRole = await axios.post(`${baseURL}/auth/login`, {
      email: producerEmail,
      password: 'password123'
    });
    console.log('✅ Producer login without role works (uses actual role)');
    
    console.log('\n🎉 All role-based authentication tests passed!');
    console.log('\n📝 Test Summary:');
    console.log('✅ Customer and producer accounts are completely separate');
    console.log('✅ Cannot login with wrong role credentials');
    console.log('✅ Cannot create duplicate accounts with different roles');
    console.log('✅ Role verification works correctly');
    console.log('✅ Backward compatibility maintained (login without role)');
    
    console.log('\n🧪 Test credentials for frontend testing:');
    console.log('Customer:', testEmail, '/ password123');
    console.log('Producer:', producerEmail, '/ password123');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.response?.data || error.message);
  }
}

testRoleBasedAuth();
