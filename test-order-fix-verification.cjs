const axios = require('axios');
const baseURL = 'http://localhost:3001/api';

console.log('🚀 Testing Order Fix Verification');

async function testOrderEndpoints() {
  try {
    // 1. Register customer
    console.log('1. Registering customer...');
    const customerData = {
      email: `customer${Date.now()}@test.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '1234567890',
      role: 'customer'
    };

    const customerResponse = await axios.post(`${baseURL}/auth/register`, customerData);
    const customerToken = customerResponse.data.token;
    console.log('✅ Customer registered successfully');

    // 2. Register producer
    console.log('2. Registering producer...');
    const producerData = {
      email: `producer${Date.now()}@test.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'Producer',
      phone: '1234567890',
      role: 'producer'
    };

    const producerResponse = await axios.post(`${baseURL}/auth/register`, producerData);
    const producerToken = producerResponse.data.token;
    console.log('✅ Producer registered successfully');

    // 3. Create producer profile
    console.log('3. Creating producer profile...');
    const profileData = {
      shopName: 'Test Fix Farm',
      description: 'Testing order fix',
      location: 'Test Location',
      pickupInfo: { location: 'Test pickup point' }
    };

    await axios.post(`${baseURL}/producers/profile`, profileData, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    console.log('✅ Producer profile created');

    // 4. Create a product
    console.log('4. Creating product...');
    const productData = {
      name: 'Fix Test Apples',
      price: 3.50,
      unit: 'lb',
      category: 'fruits',
      description: 'Testing order fix functionality',
      stock: 100
    };

    const productResponse = await axios.post(`${baseURL}/products`, productData, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    console.log('✅ Product created successfully');

    // 5. Get producer info to get producerId
    const producersResponse = await axios.get(`${baseURL}/producers`);
    const testProducer = producersResponse.data.find(p => p.shopName === 'Test Fix Farm');
    
    if (!testProducer) {
      throw new Error('Test producer not found');
    }

    // 6. Create order
    console.log('5. Creating test order...');
    const orderData = {
      producerId: testProducer.id,
      items: [
        {
          productId: productResponse.data.product.id,
          quantity: 3
        }
      ],
      pickupDate: '2024-12-30',
      pickupPoint: 'Test pickup location',
      notes: 'Order fix verification test'
    };

    const orderResponse = await axios.post(`${baseURL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Order created successfully:', orderResponse.data.id);

    // 7. Test customer orders endpoint
    console.log('6. Testing customer orders endpoint...');
    const customerOrdersResponse = await axios.get(`${baseURL}/orders/customer`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    console.log('✅ Customer orders fetched successfully!');
    console.log('📊 Customer order count:', customerOrdersResponse.data.length);
    console.log('📊 Sample customer order:', JSON.stringify(customerOrdersResponse.data[0], null, 2));

    // 8. Test producer orders endpoint
    console.log('7. Testing producer orders endpoint...');
    const producerOrdersResponse = await axios.get(`${baseURL}/orders/producer`, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    
    console.log('✅ Producer orders fetched successfully!');
    console.log('📊 Producer order count:', producerOrdersResponse.data.length);
    console.log('📊 Sample producer order:', JSON.stringify(producerOrdersResponse.data[0], null, 2));

    // 9. Verify date formatting
    const customerOrder = customerOrdersResponse.data[0];
    const producerOrder = producerOrdersResponse.data[0];
    
    console.log('8. Verifying date formatting...');
    console.log('✅ Customer order date formats:');
    console.log(`   - orderDate: ${customerOrder.orderDate} (${typeof customerOrder.orderDate})`);
    console.log(`   - pickupDate: ${customerOrder.pickupDate} (${typeof customerOrder.pickupDate})`);
    
    console.log('✅ Producer order date formats:');
    console.log(`   - orderDate: ${producerOrder.orderDate} (${typeof producerOrder.orderDate})`);
    console.log(`   - pickupDate: ${producerOrder.pickupDate} (${typeof producerOrder.pickupDate})`);

    // Verify date format is YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (customerOrder.orderDate && !datePattern.test(customerOrder.orderDate)) {
      throw new Error(`Invalid orderDate format: ${customerOrder.orderDate}`);
    }
    if (customerOrder.pickupDate && !datePattern.test(customerOrder.pickupDate)) {
      throw new Error(`Invalid pickupDate format: ${customerOrder.pickupDate}`);
    }

    console.log('🎉 ALL TESTS PASSED! Order fix verification successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testOrderEndpoints();
