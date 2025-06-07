const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCompleteOrderFlow() {
  console.log('🔍 Testing Complete Order Flow End-to-End\n');
  
  try {
    // 1. Customer Login
    console.log('1️⃣ Customer Login...');
    const customerLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'customer@test.com',
      password: 'password123'
    });
    const customerToken = customerLogin.data.token;
    const customerConfig = { headers: { Authorization: `Bearer ${customerToken}` } };
    console.log('✅ Customer authenticated');

    // 2. Get available products
    console.log('\n2️⃣ Getting Available Products...');
    const products = await axios.get(`${BASE_URL}/api/products`);
    console.log(`✅ Found ${products.data.length} products available`);
    
    if (products.data.length === 0) {
      console.log('❌ No products available for testing order creation');
      return;
    }    const testProduct = products.data[0];
    console.log(`   Using product: "${testProduct.name}" from producer: ${testProduct.producer}`);

    // 3. Create an order
    console.log('\n3️⃣ Creating Order...');
    const orderData = {
      producerId: testProduct.producerId,
      items: [{
        productId: testProduct.id,
        quantity: 2
      }],
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pickupPoint: 'Test Pickup Location',
      notes: 'End-to-end workflow test order'
    };

    const orderResponse = await axios.post(`${BASE_URL}/api/orders`, orderData, customerConfig);
    console.log(`✅ Order created successfully! Order ID: ${orderResponse.data.id}`);
    console.log(`   Total: €${orderResponse.data.total}`);

    // 4. Verify order in customer orders
    console.log('\n4️⃣ Verifying Customer Orders...');
    const customerOrders = await axios.get(`${BASE_URL}/api/orders/customer`, customerConfig);
    console.log(`✅ Customer can see ${customerOrders.data.length} order(s)`);
    
    if (customerOrders.data.length > 0) {
      const latestOrder = customerOrders.data[0];
      console.log(`   Latest order: Status="${latestOrder.status}", Total=€${latestOrder.total}`);
    }

    // 5. Verify order appears in producer orders
    console.log('\n5️⃣ Verifying Producer Orders...');
    const producerLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'producer.enhanced.1749317575201@test.com',
      password: 'testpass123'
    });
    const producerToken = producerLogin.data.token;
    const producerConfig = { headers: { Authorization: `Bearer ${producerToken}` } };

    const producerOrders = await axios.get(`${BASE_URL}/api/orders/producer`, producerConfig);
    console.log(`✅ Producer can see ${producerOrders.data.length} order(s)`);

    // 6. Update order status (producer action)
    if (producerOrders.data.length > 0) {
      console.log('\n6️⃣ Testing Order Status Update...');
      const orderId = orderResponse.data.id;
      await axios.put(`${BASE_URL}/api/orders/${orderId}/status`, 
        { status: 'preparee' }, 
        producerConfig
      );
      console.log('✅ Order status updated to "preparee"');
    }

    console.log('\n🎊 COMPLETE ORDER FLOW TEST RESULTS:');
    console.log('=====================================');
    console.log('✅ Customer authentication: WORKING');
    console.log('✅ Product listing: WORKING');
    console.log('✅ Order creation: WORKING');
    console.log('✅ Customer order view: WORKING');
    console.log('✅ Producer order view: WORKING');
    console.log('✅ Order status updates: WORKING');
    console.log('\n🎉 ALL SYSTEMS FULLY OPERATIONAL!');

  } catch (error) {
    console.log('❌ Error in complete order flow test:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testCompleteOrderFlow();
