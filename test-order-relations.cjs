const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testOrderQuery() {
  try {
    console.log('🔍 Testing Order Query Issue');
    
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
    const producerId = producerRegResp.data.profile.id;
    console.log('✅ Producer registered, ID:', producerId);
    
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
    
    // Test orders BEFORE creating any
    console.log('🔍 Testing orders before creation...');
    
    try {
      const customerOrdersResp = await axios.get(`${BASE_URL}/orders/customer`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('✅ Customer orders (before):', customerOrdersResp.data.length, 'orders');
    } catch (error) {
      console.log('❌ Customer orders (before) failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    try {
      const producerOrdersResp = await axios.get(`${BASE_URL}/orders/producer`, {
        headers: { Authorization: `Bearer ${producerToken}` }
      });
      console.log('✅ Producer orders (before):', producerOrdersResp.data.length, 'orders');
    } catch (error) {
      console.log('❌ Producer orders (before) failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Create an order
    const orderData = {
      producerId: producerId,
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
    
    // Test orders AFTER creating one
    console.log('🔍 Testing orders after creation...');
    
    try {
      const customerOrdersResp = await axios.get(`${BASE_URL}/orders/customer`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('✅ Customer orders (after):', customerOrdersResp.data.length, 'orders');
      if (customerOrdersResp.data.length > 0) {
        console.log('First order:', JSON.stringify(customerOrdersResp.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Customer orders (after) failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    try {
      const producerOrdersResp = await axios.get(`${BASE_URL}/orders/producer`, {
        headers: { Authorization: `Bearer ${producerToken}` }
      });
      console.log('✅ Producer orders (after):', producerOrdersResp.data.length, 'orders');
      if (producerOrdersResp.data.length > 0) {
        console.log('First order:', JSON.stringify(producerOrdersResp.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Producer orders (after) failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testOrderQuery();
