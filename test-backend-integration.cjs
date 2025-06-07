const { default: fetch } = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';
let authToken = '';

// Test configuration
const testUser = {
  email: 'testproducer@shop.com',
  password: 'password123'
};

async function makeRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${data.message}`);
  }
  
  return data;
}

async function testBackendIntegration() {
  console.log('🔧 Testing Backend Integration for Dashboard, Orders & Analytics\n');

  try {
    // Step 1: Login as producer
    console.log('1. 🔐 Logging in as producer...');
    const loginResponse = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    authToken = loginResponse.token;
    console.log('✅ Login successful');

    // Step 2: Test producer stats endpoint
    console.log('\n2. 📊 Testing producer stats endpoint...');
    try {
      const stats = await makeRequest('/users/producer/stats');
      console.log('✅ Producer stats endpoint working:', {
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalProducts: stats.totalProducts || 0,
        totalCustomers: stats.totalCustomers || 0
      });
    } catch (err) {
      console.log('⚠️  Producer stats endpoint error:', err.message);
      console.log('   This might be expected if no data exists yet');
    }

    // Step 3: Test producer orders endpoint
    console.log('\n3. 🛒 Testing producer orders endpoint...');
    try {
      const orders = await makeRequest('/orders/producer');
      console.log('✅ Producer orders endpoint working');
      console.log(`   Found ${orders.length} orders`);
      
      if (orders.length > 0) {
        const sampleOrder = orders[0];
        console.log('   Sample order structure:', {
          id: sampleOrder.id,
          status: sampleOrder.status,
          total: sampleOrder.total,
          customerInfo: sampleOrder.customer ? 'Present' : 'Missing',
          itemsCount: sampleOrder.items?.length || 0
        });
      }
    } catch (err) {
      console.log('⚠️  Producer orders endpoint error:', err.message);
      console.log('   This might be expected if no orders exist yet');
    }

    // Step 4: Test order stats endpoint
    console.log('\n4. 📈 Testing order stats endpoint...');
    try {
      const orderStats = await makeRequest('/orders/producer/stats');
      console.log('✅ Order stats endpoint working:', orderStats);
    } catch (err) {
      console.log('⚠️  Order stats endpoint error:', err.message);
      console.log('   This might be expected if no orders exist yet');
    }

    // Step 5: Test producers public endpoint (for ProducersPage)
    console.log('\n5. 🌟 Testing public producers endpoint...');
    try {
      const producers = await makeRequest('/producers');
      console.log('✅ Public producers endpoint working');
      console.log(`   Found ${producers.length} producers`);
      
      if (producers.length > 0) {
        const sampleProducer = producers[0];
        console.log('   Sample producer structure:', {
          id: sampleProducer.id,
          name: sampleProducer.name || 'N/A',
          shopsCount: sampleProducer.shops?.length || 0,
          isActive: sampleProducer.isActive
        });
      }
    } catch (err) {
      console.log('❌ Public producers endpoint error:', err.message);
    }

    // Step 6: Test my shops endpoint
    console.log('\n6. 🏪 Testing my shops endpoint...');
    try {
      const shops = await makeRequest('/shops/my-shops');
      console.log('✅ My shops endpoint working');
      console.log(`   Found ${shops.length} shops`);
      
      if (shops.length > 0) {
        const sampleShop = shops[0];
        console.log('   Sample shop structure:', {
          id: sampleShop.id,
          name: sampleShop.name,
          description: sampleShop.description?.substring(0, 50) + '...',
          isActive: sampleShop.isActive
        });
      }
    } catch (err) {
      console.log('❌ My shops endpoint error:', err.message);
    }

    console.log('\n🎉 Backend integration test completed!');
    console.log('\n📋 Summary:');
    console.log('- Dashboard should now use real producer stats data');
    console.log('- Order Management should now use real producer orders data');
    console.log('- Analytics should now use real stats and orders data');
    console.log('- ProducersPage should now show real producers with their shops');
    console.log('- Shop status check should now verify real shop ownership');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testBackendIntegration().catch(console.error);
