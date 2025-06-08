const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function diagnoseOrderFlow() {
  console.log('🔍 DIAGNOSING ORDER FLOW ISSUE AFTER PICKUP POINT SELECTION');
  console.log('============================================================');

  try {
    // 1. First, check if servers are running
    console.log('\n1. Checking server availability...');
    try {
      const healthCheck = await axios.get(`${API_BASE}/health`);
      console.log('✅ Backend server is running');
    } catch (error) {
      console.log('❌ Backend server not accessible. Start it with: cd server && npm run dev');
      return;
    }

    // 2. Register a test customer
    console.log('\n2. Creating test customer...');
    const customerData = {
      email: `test-customer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer'
    };
    
    const customerResponse = await axios.post(`${API_BASE}/auth/register`, customerData);
    const customerToken = customerResponse.data.token;
    console.log('✅ Customer registered');

    // 3. Register and setup a test producer with products
    console.log('\n3. Creating test producer and products...');
    const producerData = {
      email: `test-producer-${Date.now()}@example.com`,
      password: 'password123',
      role: 'producer',
      profileData: {
        shopName: 'Test Order Flow Farm',
        description: 'Testing order flow issues',
        address: '123 Test Farm Road'
      }
    };

    const producerResponse = await axios.post(`${API_BASE}/auth/register`, producerData);
    const producerToken = producerResponse.data.token;
    console.log('✅ Producer registered');

    // Get producer profile to get ID
    const producerProfileResponse = await axios.get(`${API_BASE}/users/producer/profile`, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    const producerId = producerProfileResponse.data.id;

    // Create a shop
    const shopData = {
      name: 'Order Flow Test Shop',
      description: 'Testing order flow',
      address: '123 Test Shop Address',
      phone: '555-0123',
      email: 'shop@test.com',
      specialties: ['fruits', 'vegetables']
    };

    const shopResponse = await axios.post(`${API_BASE}/shops`, shopData, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    const shopId = shopResponse.data.id;
    console.log('✅ Shop created');

    // Create a test product
    const productData = {
      name: 'Test Order Flow Apples',
      price: 3.50,
      stock: 100,
      category: 'fruits',
      unit: 'kg',
      description: 'Testing order flow',
      shopId: shopId
    };

    const productResponse = await axios.post(`${API_BASE}/products`, productData, {
      headers: { Authorization: `Bearer ${producerToken}` }
    });
    const productId = productResponse.data.id;
    console.log('✅ Product created');

    // 4. Now test the order creation flow (simulate what happens after pickup point selection)
    console.log('\n4. Testing order creation after pickup point selection...');
    
    // This simulates what should happen when handlePickupPointSelect calls handleOrderConfirm
    const orderData = {
      producerId: producerId,
      items: [
        {
          productId: productId.toString(),
          quantity: 2
        }
      ],
      pickupPoint: 'Test Pickup Point - Marché de Belleville',
      notes: 'Test order after pickup point selection',
      total: 7.00,
      paymentStatus: 'pending'
    };

    console.log('📦 Attempting to create order with data:', JSON.stringify(orderData, null, 2));

    try {
      const orderResponse = await axios.post(`${API_BASE}/orders`, orderData, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('✅ Order created successfully!');
      console.log('📄 Order details:', JSON.stringify(orderResponse.data, null, 2));
      
      // 5. Verify the order was actually created and persisted
      console.log('\n5. Verifying order persistence...');
      const customerOrdersResponse = await axios.get(`${API_BASE}/orders/customer`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      
      if (customerOrdersResponse.data.length > 0) {
        console.log('✅ Order found in customer orders');
        console.log('📊 Customer orders count:', customerOrdersResponse.data.length);
      } else {
        console.log('❌ Order not found in customer orders - POTENTIAL ISSUE!');
      }

      const producerOrdersResponse = await axios.get(`${API_BASE}/orders/producer`, {
        headers: { Authorization: `Bearer ${producerToken}` }
      });
      
      if (producerOrdersResponse.data.length > 0) {
        console.log('✅ Order found in producer orders');
        console.log('📊 Producer orders count:', producerOrdersResponse.data.length);
      } else {
        console.log('❌ Order not found in producer orders - POTENTIAL ISSUE!');
      }

    } catch (orderError) {
      console.log('❌ ORDER CREATION FAILED - THIS IS LIKELY THE ISSUE!');
      console.log('Error status:', orderError.response?.status);
      console.log('Error message:', orderError.response?.data?.message || orderError.message);
      console.log('Full error response:', JSON.stringify(orderError.response?.data, null, 2));
      
      // This is likely where the "order incomplete issue after choosing pickup point" occurs
      console.log('\n🚨 DIAGNOSIS: Order creation fails after pickup point selection');
      console.log('This explains why orders appear incomplete - they never get created in the database');
    }

    console.log('\n6. Testing frontend flow simulation...');
    // Test the exact flow that happens in the frontend
    console.log('Cart → PickupPointSelector → OrderConfirmation → handleOrderConfirm');
    console.log('Simulating Index.tsx handleOrderConfirm function...');
    
    // Simulate the frontend cart items format
    const cartItems = [
      {
        id: productId,
        name: 'Test Order Flow Apples',
        price: 3.50,
        unit: 'kg',
        quantity: 2,
        producer: 'Test Order Flow Farm',
        category: 'fruits'
      }
    ];

    // Simulate the frontend grouping by producer logic
    const itemsByProducer = cartItems.reduce((acc, item) => {
      const producerId = '1'; // This is hardcoded in Index.tsx - POTENTIAL ISSUE!
      if (!acc[producerId]) {
        acc[producerId] = [];
      }
      acc[producerId].push({
        productId: item.id.toString(),
        quantity: item.quantity
      });
      return acc;
    }, {});

    console.log('📊 Items grouped by producer:', JSON.stringify(itemsByProducer, null, 2));
    console.log('⚠️  POTENTIAL ISSUE: Producer ID is hardcoded as "1" in frontend');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.response?.data || error.message);
  }
}

// Also create a function to test the producer information management feature
async function testProducerInformationManagement() {
  console.log('\n🧪 TESTING PRODUCER INFORMATION MANAGEMENT FEATURE');
  console.log('==================================================');

  try {
    // Login as test producer
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'testproducer@shop.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in as test producer');

    // Test getting producer information
    console.log('\n1. Testing GET producer information...');
    try {
      const infoResponse = await axios.get(`${API_BASE}/users/producer/information`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Producer information retrieved successfully');
      console.log('📄 Information:', JSON.stringify(infoResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Failed to get producer information:', error.response?.data?.message || error.message);
    }

    // Test updating producer information
    console.log('\n2. Testing UPDATE producer information...');
    const updateData = {
      firstName: 'Test',
      lastName: 'Producer',
      phone: '+33123456789',
      businessName: 'Test Farm Business',
      farmName: 'Test Organic Farm',
      farmDescription: 'A test farm for organic produce',
      contactHours: '9:00-17:00',
      websiteUrl: 'https://test-farm.com',
      certifications: ['Bio', 'Local'],
      productionMethods: ['organic', 'sustainable']
    };

    try {
      const updateResponse = await axios.put(`${API_BASE}/users/producer/information`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Producer information updated successfully');
      console.log('📄 Updated information:', JSON.stringify(updateResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Failed to update producer information:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Producer information management test failed:', error.response?.data?.message || error.message);
  }
}

async function main() {
  await diagnoseOrderFlow();
  await testProducerInformationManagement();
  
  console.log('\n📋 SUMMARY OF FINDINGS:');
  console.log('========================');
  console.log('1. Check if backend server is running (npm run dev in server folder)');
  console.log('2. Order creation API needs to be tested after pickup point selection');
  console.log('3. Frontend may have hardcoded producer ID "1" causing issues');
  console.log('4. Producer information management feature can be tested with above credentials');
  console.log('5. Both frontend and backend need to be running to test the complete flow');
}

main().catch(console.error);
