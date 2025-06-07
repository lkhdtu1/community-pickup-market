const axios = require('axios');

async function debugEndpoints() {
  try {
    console.log('🔍 Debugging Failed Endpoints...\n');
    
    // Get producer token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'producer.enhanced.1749317575201@test.com', 
      password: 'testpass123'
    });
    const token = loginResponse.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    console.log('✅ Producer authentication successful\n');
    
    // Test shops endpoint
    console.log('1️⃣ Testing Shops Endpoint...');
    const shops = await axios.get('http://localhost:3001/api/shops', config);
    console.log(`Found ${shops.data.length} shops:`);
    
    shops.data.forEach((shop, index) => {
      console.log(`  ${index + 1}. ID: ${shop.id} | Name: "${shop.name}" | Status: ${shop.status || 'undefined'}`);
    });
    
    if (shops.data.length > 0) {
      const shopId = shops.data[0].id;
      console.log(`\n2️⃣ Testing Shop Products for Shop ID: ${shopId}...`);
      
      try {
        const products = await axios.get(`http://localhost:3001/api/shops/${shopId}/products`, config);
        console.log('✅ Shop products endpoint working');
        console.log(`Found ${products.data.length} products for this shop`);
      } catch (err) {
        console.log(`❌ Shop products endpoint failed: ${err.response.status} ${err.response.statusText}`);
        console.log('   This endpoint may not be implemented yet');
      }
    }
    
    // Test customer orders endpoint
    console.log('\n3️⃣ Testing Customer Orders Endpoint...');
    const customerLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'customer@test.com',
      password: 'password123'
    });
    const customerToken = customerLogin.data.token;
    const customerConfig = { headers: { Authorization: `Bearer ${customerToken}` } };
    
    try {
      const orders = await axios.get('http://localhost:3001/api/orders', customerConfig);
      console.log('✅ Orders endpoint working');
      console.log(`Found ${orders.data.length} orders for customer`);
    } catch (err) {
      console.log(`❌ Orders endpoint failed: ${err.response.status} ${err.response.statusText}`);
      console.log('   This endpoint may not be implemented yet');
    }
    
    // Test alternative endpoints
    console.log('\n4️⃣ Checking Alternative Endpoints...');
    try {
      const allProducts = await axios.get('http://localhost:3001/api/products');
      console.log(`✅ All products endpoint: ${allProducts.data.length} products`);
      
      // Check if products have shop relationships
      const sampleProduct = allProducts.data[0];
      if (sampleProduct) {
        console.log('Sample product structure:', {
          id: sampleProduct.id,
          name: sampleProduct.name,
          shopId: sampleProduct.shopId || sampleProduct.shop_id || 'not found',
          producerId: sampleProduct.producerId || sampleProduct.producer_id || 'not found'
        });
      }
    } catch (err) {
      console.log('❌ Products endpoint error:', err.message);
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugEndpoints();
