const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testOrderEndpoint() {
  try {
    console.log('🔍 Testing Order Debug');
    
    // Register producer
    const producerData = {
      email: `testproducer${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Producer',
      role: 'producer',
      shopName: 'Test Shop',
      description: 'Test description',
      location: 'Test location'
    };
    
    const producerRegResp = await axios.post(`${BASE_URL}/auth/register`, producerData);
    const producerToken = producerRegResp.data.token;
    console.log('✅ Producer registered');
    
    // Register customer
    const customerData = {
      email: `testcustomer${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer'
    };
    
    const customerRegResp = await axios.post(`${BASE_URL}/auth/register`, customerData);
    const customerToken = customerRegResp.data.token;
    console.log('✅ Customer registered');
    
    // Create product
    const productData = {
      name: 'Test Product',
      description: 'Test description',
      price: 10.99,
      category: 'Légumes',
      unit: 'kg',
      availability: true
    };
    
    const productResp = await axios.post(`${BASE_URL}/products`, productData, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    console.log('✅ Product created, ID:', productResp.data.id);
    
    // Try empty order requests first
    console.log('🔍 Testing empty orders...');
    
    try {
      const customerOrdersResp = await axios.get(`${BASE_URL}/orders/customer`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('✅ Customer orders (empty):', customerOrdersResp.data.length, 'orders');
    } catch (error) {
      console.log('❌ Customer orders (empty) failed:', error.response?.data?.message || error.message);
    }
    
    try {
      const producerOrdersResp = await axios.get(`${BASE_URL}/orders/producer`, {
        headers: { Authorization: `Bearer ${producerToken}` }
      });
      console.log('✅ Producer orders (empty):', producerOrdersResp.data.length, 'orders');
    } catch (error) {
      console.log('❌ Producer orders (empty) failed:', error.response?.data?.message || error.message);
    }
    
    // Now create an order and test again
    const orderData = {
      producerId: producerRegResp.data.profile.id,
      items: [{
        productId: productResp.data.id,
        quantity: 2
      }],
      pickupDate: '2025-06-10',
      pickupPoint: 'Test location',
      notes: 'Test order'
    };
    
    const orderResp = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Order created:', orderResp.data.id);
    
    // Test with orders present
    console.log('🔍 Testing with orders present...');
    
    try {
      const customerOrdersResp = await axios.get(`${BASE_URL}/orders/customer`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('✅ Customer orders (with data):', customerOrdersResp.data.length, 'orders');
    } catch (error) {
      console.log('❌ Customer orders (with data) failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    try {
      const producerOrdersResp = await axios.get(`${BASE_URL}/orders/producer`, {
        headers: { Authorization: `Bearer ${producerToken}` }
      });
      console.log('✅ Producer orders (with data):', producerOrdersResp.data.length, 'orders');
    } catch (error) {
      console.log('❌ Producer orders (with data) failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testOrderEndpoint();
