const axios = require('axios');

async function checkCurrentIssues() {
  console.log('🔍 CHECKING CURRENT CRITICAL ISSUES');
  console.log('===================================\n');

  // Issue 1: Check if servers are running
  console.log('1. Checking Server Status...');
  try {
    const backendResponse = await axios.get('http://localhost:3001/api/health', { timeout: 3000 });
    console.log('✅ Backend server: RUNNING');
  } catch (error) {
    console.log('❌ Backend server: NOT RUNNING');
    console.log('   Please start with: cd server && npm run dev\n');
  }

  try {
    const frontendResponse = await axios.get('http://localhost:8080', { timeout: 3000 });
    console.log('✅ Frontend server: RUNNING');
  } catch (error) {
    console.log('❌ Frontend server: NOT RUNNING');
    console.log('   Please start with: npm run dev\n');
  }

  // Issue 2: Check if basic APIs are working
  console.log('\n2. Checking API Endpoints...');
  try {
    const productsResponse = await axios.get('http://localhost:3001/api/products', { timeout: 3000 });
    console.log('✅ Products API: WORKING');
    
    // Check if products have producer IDs
    if (productsResponse.data.length > 0) {
      const sampleProduct = productsResponse.data[0];
      if (sampleProduct.producer?.id) {
        console.log('✅ Products have producer IDs: FIXED');
      } else {
        console.log('❌ Products missing producer IDs: ISSUE');
      }
    }
  } catch (error) {
    console.log('❌ Products API: NOT ACCESSIBLE');
  }

  // Issue 3: Check producer profile endpoints
  console.log('\n3. Checking Producer Management...');
  try {
    await axios.get('http://localhost:3001/api/user/producer/information', {
      headers: { 'Authorization': 'Bearer fake-token' },
      timeout: 3000
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Producer information endpoint: EXISTS (requires auth)');
    } else if (error.response?.status === 404) {
      console.log('❌ Producer information endpoint: MISSING');
    } else {
      console.log('⚠️ Producer information endpoint: UNKNOWN STATUS');
    }
  }

  console.log('\n📋 CRITICAL ISSUES SUMMARY:');
  console.log('1. Order confirmation after adding products to cart');
  console.log('2. Producer information showing as "undefined" in orders');  
  console.log('3. Order validation in producer account failing');
  console.log('4. Producer profile information not configured');
  console.log('5. Add pickup points CRUD management for producers only');
  
  console.log('\n🚀 TO START TESTING:');
  console.log('1. Start backend: cd server && npm run dev');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Open browser: http://localhost:8080');
}

checkCurrentIssues().catch(console.error);
