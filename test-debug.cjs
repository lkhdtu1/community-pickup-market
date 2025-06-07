#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testEnhancedOrderFlowDebug() {
  console.log('🚀 Testing Enhanced Order Flow with Email Notifications (Debug Version)');
  
  try {
    // Test connection first
    console.log('Testing connection...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Server is running:', healthResponse.data);

    // 1. Register producer
    console.log('1. Registering producer...');
    const producerData = {
      email: `enhanced-producer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'producer',
      profileData: {
        shopName: 'Enhanced Test Farm',
        description: 'Testing enhanced order flow',
        address: '123 Enhanced St'
      }
    };

    console.log('  Sending producer registration request...');
    const producerRegResponse = await axios.post(`${API_BASE}/auth/register`, producerData);
    const producerToken = producerRegResponse.data.token;
    console.log('✅ Producer registered, token received');

    // 2. Get producer profile to get ID
    console.log('2. Getting producer profile...');
    const producerProfileResponse = await axios.get(`${API_BASE}/users/producer/profile`, {
      headers: { 'Authorization': `Bearer ${producerToken}` }
    });
    const producerId = producerProfileResponse.data.id;
    console.log('✅ Producer ID obtained:', producerId);    // 3. Create a shop first
    console.log('3. Creating shop...');
    const shopData = {
      name: 'Enhanced Test Farm Shop',
      description: 'Testing enhanced order flow',
      address: '123 Enhanced Farm Rd',
      phone: '555-0123',
      email: 'shop@enhanced-farm.com',
      specialties: ['fruits', 'vegetables'],
      pickupInfo: {
        location: '123 Enhanced Farm Rd',
        hours: 'Mon-Fri: 9am-5pm',
        instructions: 'Ring doorbell'
      }
    };
    
    const shopResponse = await axios.post(`${API_BASE}/shops`, shopData, {
      headers: { 'Authorization': `Bearer ${producerToken}` }
    });
    const shopId = shopResponse.data.id;
    console.log('✅ Shop created:', shopId);

    // 4. Create a product
    console.log('4. Creating product...');
    const productData = {
      name: 'Enhanced Test Apples',
      description: 'Testing enhanced order flow',
      price: 4.99,
      stock: 100,
      category: 'fruits',
      unit: 'kg',
      shopId: shopId
    };
    
    const productResponse = await axios.post(`${API_BASE}/products`, productData, {
      headers: { 'Authorization': `Bearer ${producerToken}` }
    });
    const productId = productResponse.data.id;
    console.log('✅ Product created:', productId);    // 5. Register customer
    console.log('5. Registering customer...');
    const customerData = {
      email: `enhanced-customer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      profileData: {
        firstName: 'Enhanced',
        lastName: 'Customer',
        phone: '555-1234',
        address: '789 Enhanced Ave'
      }
    };

    const customerRegResponse = await axios.post(`${API_BASE}/auth/register`, customerData);
    const customerToken = customerRegResponse.data.token;
    console.log('✅ Customer registered');

    // 6. Create order
    console.log('6. Creating order (will trigger emails)...');
    const orderData = {
      producerId: producerId,
      items: [{
        productId: productId,
        quantity: 2
      }],
      pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      pickupPoint: 'Enhanced Test Market',
      notes: 'Enhanced order flow test',
      paymentMethodId: 'pm_test_card',
      paymentIntentId: 'pi_test_intent',
      paymentStatus: 'paid'
    };
    
    console.log('  Sending order creation request...');
    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const orderId = orderResponse.data.id;
    console.log('✅ Order created:', orderId);
    console.log('📧 Email notifications should have been sent');

    console.log('✅ Test completed successfully up to order creation!');
      // Test status update (just one)
    console.log('7. Testing status update...');
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/status`, {
        status: 'preparee'
      }, {
        headers: { 'Authorization': `Bearer ${producerToken}` }
      });
      console.log('✅ Status update successful');
    } catch (statusError) {
      console.log('⚠️  Status update failed:', statusError.response?.data?.message || statusError.message);
    }

    console.log('🎉 Enhanced Order Flow Test COMPLETED!');

  } catch (error) {
    console.error('❌ Enhanced order flow test failed at step:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('URL:', error.config?.url);
    }
    console.log('Full error:', error.stack);
  }
}

testEnhancedOrderFlowDebug();
