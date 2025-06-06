#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function debugOrders() {
  console.log('🔍 Debugging Order APIs');
  
  try {
    // First register and login as producer
    const producerData = {
      email: `debug-producer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'producer',
      profileData: {
        shopName: 'Debug Farm',
        description: 'Debug farm for order testing',
        address: '123 Debug St'
      }
    };

    const producerRegResponse = await axios.post(`${API_BASE}/auth/register`, producerData);
    const producerToken = producerRegResponse.data.token;
    console.log('✅ Producer registered');

    // Get producer profile to get ID
    const producerProfileResponse = await axios({
      method: 'GET',
      url: `${API_BASE}/users/producer/profile`,
      headers: { 'Authorization': `Bearer ${producerToken}` }
    });
    const producerId = producerProfileResponse.data.id;
    console.log('✅ Producer profile retrieved, ID:', producerId);

    // Create a product
    const productData = {
      name: 'Debug Tomatoes',
      description: 'Test tomatoes',
      price: 5.99,
      stock: 50,
      category: 'vegetables',
      unit: 'lb'
    };
    
    const productResponse = await axios({
      method: 'POST',
      url: `${API_BASE}/products`,
      headers: { 'Authorization': `Bearer ${producerToken}` },
      data: productData
    });
    const productId = productResponse.data.id;
    console.log('✅ Product created, ID:', productId);

    // Register customer
    const customerData = {
      email: `debug-customer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      profileData: {
        firstName: 'Debug',
        lastName: 'Customer',
        phone: '555-1234',
        address: '789 Debug Ave'
      }
    };

    const customerRegResponse = await axios.post(`${API_BASE}/auth/register`, customerData);
    const customerToken = customerRegResponse.data.token;
    console.log('✅ Customer registered');

    // Create order
    const orderData = {
      producerId: producerId,
      items: [{
        productId: productId,
        quantity: 2
      }],
      pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      notes: 'Debug order'
    };
    
    const orderResponse = await axios({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { 'Authorization': `Bearer ${customerToken}` },
      data: orderData
    });
    console.log('✅ Order created:', orderResponse.data.id);

    // Test get customer orders
    console.log('\n🔍 Testing customer orders endpoint...');
    try {
      const customerOrdersResponse = await axios({
        method: 'GET',
        url: `${API_BASE}/orders/customer`,
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      console.log('✅ Customer orders retrieved:', customerOrdersResponse.data.length, 'orders');
    } catch (error) {
      console.log('❌ Customer orders failed:', error.response?.data?.message || error.message);
      console.log('Status:', error.response?.status);
      console.log('Response data:', error.response?.data);
    }

    // Test get producer orders
    console.log('\n🔍 Testing producer orders endpoint...');
    try {
      const producerOrdersResponse = await axios({
        method: 'GET',
        url: `${API_BASE}/orders/producer`,
        headers: { 'Authorization': `Bearer ${producerToken}` }
      });
      console.log('✅ Producer orders retrieved:', producerOrdersResponse.data.length, 'orders');
    } catch (error) {
      console.log('❌ Producer orders failed:', error.response?.data?.message || error.message);
      console.log('Status:', error.response?.status);
      console.log('Response data:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

debugOrders().catch(console.error);
