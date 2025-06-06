const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testOrderRelations() {
  try {
    console.log('🔍 Testing Order Relations Loading Issue');
    
    // Login as producer first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'producer1@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test producer orders endpoint with detailed error logging
    try {
      console.log('📋 Testing producer orders endpoint...');
      const ordersResponse = await axios.get(`${API_BASE}/orders/producer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Producer orders retrieved successfully');
      console.log(`📊 Found ${ordersResponse.data.length} orders`);
      
      if (ordersResponse.data.length > 0) {
        const firstOrder = ordersResponse.data[0];
        console.log('📦 First order details:');
        console.log(`   Customer: ${firstOrder.customerName}`);
        console.log(`   Email: ${firstOrder.customerEmail}`);
        console.log(`   Items: ${firstOrder.items.length} items`);
        console.log(`   Total: €${firstOrder.total}`);
        console.log(`   Status: ${firstOrder.status}`);
        
        if (firstOrder.items.length > 0) {
          console.log('   First item:', firstOrder.items[0]);
        }
      }
      
    } catch (orderError) {
      console.error('❌ Producer orders failed:', orderError.response?.data || orderError.message);
      if (orderError.response?.status) {
        console.error(`   Status: ${orderError.response.status}`);
      }
    }
    
    // Also test customer orders
    try {
      console.log('📋 Testing customer orders endpoint...');
      
      // Login as customer
      const customerLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'customer1@test.com',
        password: 'password123'
      });
      
      const customerToken = customerLoginResponse.data.token;
      console.log('✅ Customer login successful');
      
      const customerOrdersResponse = await axios.get(`${API_BASE}/orders/customer`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      
      console.log('✅ Customer orders retrieved successfully');
      console.log(`📊 Found ${customerOrdersResponse.data.length} customer orders`);
      
      if (customerOrdersResponse.data.length > 0) {
        const firstOrder = customerOrdersResponse.data[0];
        console.log('📦 First customer order details:');
        console.log(`   Producer: ${firstOrder.producerName}`);
        console.log(`   Items: ${firstOrder.items.length} items`);
        console.log(`   Total: €${firstOrder.total}`);
        console.log(`   Status: ${firstOrder.status}`);
      }
      
    } catch (customerOrderError) {
      console.error('❌ Customer orders failed:', customerOrderError.response?.data || customerOrderError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testOrderRelations();
