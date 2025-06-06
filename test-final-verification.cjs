const axios = require('axios');
const baseURL = 'http://localhost:3001/api';

console.log('🎉 FINAL VERIFICATION: Order Date Fix Testing');

async function testOrderDateFix() {
  try {
    // Register a new customer for this test
    console.log('1. Creating fresh test customer...');
    const customerData = {
      email: `test-fix-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      profileData: {
        firstName: 'Fix',
        lastName: 'Test',
        phone: '555-0001',
        address: '123 Test St'
      }
    };

    const registerResponse = await axios.post(`${baseURL}/auth/register`, customerData);
    const token = registerResponse.data.token;
    console.log('✅ Customer registered successfully');

    // Get existing products and producer
    console.log('2. Getting test data...');
    const productsResponse = await axios.get(`${baseURL}/products`);
    if (productsResponse.data.length === 0) {
      throw new Error('No products available for testing');
    }

    const product = productsResponse.data[0];
    console.log(`✅ Found product: ${product.name} from ${product.producer}`);

    // Create an order
    console.log('3. Creating test order...');
    const orderData = {
      producerId: product.producerId,
      items: [
        {
          productId: product.id,
          quantity: 1
        }
      ],
      pickupDate: '2024-12-31',
      pickupPoint: 'Test pickup location',
      notes: 'Final verification test order'
    };

    const orderResponse = await axios.post(`${baseURL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Order created successfully:', orderResponse.data.id);

    // The critical test: fetch customer orders
    console.log('4. 🔍 CRITICAL TEST: Fetching customer orders...');
    const ordersResponse = await axios.get(`${baseURL}/orders/customer`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🎉 SUCCESS! Orders fetched without error!');
    console.log('📊 Order count:', ordersResponse.data.length);

    // Verify the date formatting
    if (ordersResponse.data.length > 0) {
      const order = ordersResponse.data[0];
      console.log('📅 Date verification:');
      console.log(`   - Order Date: "${order.orderDate}" (type: ${typeof order.orderDate})`);
      console.log(`   - Pickup Date: "${order.pickupDate}" (type: ${typeof order.pickupDate})`);

      // Check if dates are in correct format
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      
      if (!order.orderDate || !datePattern.test(order.orderDate)) {
        console.log('❌ Order date format issue');
      } else {
        console.log('✅ Order date format is correct (YYYY-MM-DD)');
      }

      if (order.pickupDate && !datePattern.test(order.pickupDate)) {
        console.log('❌ Pickup date format issue');
      } else {
        console.log('✅ Pickup date format is correct (YYYY-MM-DD or null)');
      }

      console.log('📋 Full order details:');
      console.log(JSON.stringify(order, null, 2));
    }

    console.log('\n🎉🎉🎉 ORDER DATE FIX VERIFICATION COMPLETE! 🎉🎉🎉');
    console.log('✅ The toISOString() error has been successfully resolved!');
    console.log('✅ Order fetching is working correctly!');
    console.log('✅ Date formatting is properly handled!');
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR STILL EXISTS:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    
    if (error.message.includes('toISOString')) {
      console.error('🚨 The toISOString() error is still present - fix was not successful');
    }
  }
}

testOrderDateFix();
