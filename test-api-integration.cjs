#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';
let testUserId = '';
let testProducerId = '';
let testProductId = '';
let testOrderId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n🧪 Testing: ${testName}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Helper function to make authenticated requests
const authRequest = (config) => {
  return axios({
    ...config,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...config.headers
    }
  });
};

async function testAuth() {
  logTest('Authentication System');
  
  try {
    // Test registration
    const registerData = {
      email: `test-producer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'producer',
      profileData: {
        shopName: 'Test Farm',
        description: 'Test farm for API integration',
        address: '123 Test St'
      }
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    logSuccess('Producer registration successful');
    
    testUserId = registerResponse.data.user.id;
    authToken = registerResponse.data.token;
    
    // Test login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    
    authToken = loginResponse.data.token;
    logSuccess('Login successful');
    logInfo(`Token received: ${authToken.substring(0, 20)}...`);
    
    return true;
  } catch (error) {
    logError(`Auth test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testProducerAPI() {
  logTest('Producer API');
  
  try {    // Test get producer profile
    const profileResponse = await authRequest({
      method: 'GET',
      url: `${API_BASE}/users/producer/profile`
    });
    testProducerId = profileResponse.data.id;
    logSuccess('Get producer profile successful');
    
    // Test update producer profile
    const updateData = {
      description: 'Updated farm description',
      address: '456 Updated St',
      certifications: ['Organic', 'Non-GMO'],
      pickupInfo: {
        location: 'Farm Stand',
        hours: '9am-5pm',
        instructions: 'Ring bell at gate'
      }
    };
    
    await authRequest({
      method: 'PUT',
      url: `${API_BASE}/users/producer/profile`,
      data: updateData
    });
    logSuccess('Update producer profile successful');
    
    // Test get producer stats
    await authRequest({
      method: 'GET',
      url: `${API_BASE}/users/producer/stats`
    });
    logSuccess('Get producer stats successful');
    
    return true;
  } catch (error) {
    logError(`Producer API test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testProductAPI() {
  logTest('Product API');
  
  try {
    // Test create product
    const productData = {
      name: 'Test Tomatoes',
      description: 'Fresh organic tomatoes',
      price: 5.99,
      stock: 50,
      category: 'vegetables',
      unit: 'lb'
    };
    
    const createResponse = await authRequest({
      method: 'POST',
      url: `${API_BASE}/products`,
      data: productData
    });
    
    testProductId = createResponse.data.id;
    logSuccess('Create product successful');
    logInfo(`Product ID: ${testProductId}`);
    
    // Test get all products (public)
    const allProductsResponse = await axios.get(`${API_BASE}/products`);
    logSuccess(`Get all products successful (${allProductsResponse.data.length} products)`);
    
    // Test get specific product
    await axios.get(`${API_BASE}/products/${testProductId}`);
    logSuccess('Get product by ID successful');
    
    // Test get producer's products
    const myProductsResponse = await authRequest({
      method: 'GET',
      url: `${API_BASE}/products/my-products`
    });
    logSuccess(`Get my products successful (${myProductsResponse.data.length} products)`);
    
    // Test update product
    const updateData = {
      price: 6.99,
      stock: 45,
      description: 'Premium organic tomatoes'
    };
    
    await authRequest({
      method: 'PUT',
      url: `${API_BASE}/products/${testProductId}`,
      data: updateData
    });
    logSuccess('Update product successful');
    
    return true;
  } catch (error) {
    logError(`Product API test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCustomerFlow() {
  logTest('Customer Registration and API');
  
  try {
    // Register customer
    const customerData = {
      email: `test-customer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      profileData: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        address: '789 Customer Ave'
      }
    };

    const customerRegResponse = await axios.post(`${API_BASE}/auth/register`, customerData);
    const customerToken = customerRegResponse.data.token;
    logSuccess('Customer registration successful');
    
    // Test customer profile endpoints
    const customerProfileResponse = await axios({
      method: 'GET',
      url: `${API_BASE}/users/customer/profile`,
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    logSuccess('Get customer profile successful');
    
    // Test update customer profile
    await axios({
      method: 'PUT',
      url: `${API_BASE}/users/customer/profile`,
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        phone: '555-5678',
        address: '999 Updated Customer Ave'
      }
    });
    logSuccess('Update customer profile successful');
    
    return customerToken;
  } catch (error) {
    logError(`Customer API test failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testOrderAPI(customerToken) {
  logTest('Order API');
  
  try {
    if (!customerToken || !testProductId) {
      logError('Missing required data for order test');
      return false;
    }
      // Test create order (as customer)
    const orderData = {
      producerId: testProducerId,
      items: [{
        productId: testProductId,
        quantity: 2
      }],
      pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      notes: 'Test order'
    };
    
    const createOrderResponse = await axios({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      },
      data: orderData
    });
    
    testOrderId = createOrderResponse.data.id;
    logSuccess('Create order successful');
    logInfo(`Order ID: ${testOrderId}`);
    
    // Test get customer orders
    const customerOrdersResponse = await axios({
      method: 'GET',
      url: `${API_BASE}/orders/customer`,
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    logSuccess(`Get customer orders successful (${customerOrdersResponse.data.length} orders)`);
    
    // Test get producer orders (as producer)
    const producerOrdersResponse = await authRequest({
      method: 'GET',
      url: `${API_BASE}/orders/producer`
    });
    logSuccess(`Get producer orders successful (${producerOrdersResponse.data.length} orders)`);
    
    // Test update order status (as producer)
    if (testOrderId) {
      await authRequest({
        method: 'PUT',
        url: `${API_BASE}/orders/${testOrderId}/status`,
        data: { status: 'preparee' }
      });
      logSuccess('Update order status successful');
    }
    
    return true;
  } catch (error) {
    logError(`Order API test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testPublicEndpoints() {
  logTest('Public Endpoints');
  
  try {
    // Test get all producers
    const producersResponse = await axios.get(`${API_BASE}/producers`);
    logSuccess(`Get all producers successful (${producersResponse.data.length} producers)`);
    
    // Test health check
    const healthResponse = await axios.get('http://localhost:3001/health');
    logSuccess('Health check successful');
    
    return true;
  } catch (error) {
    logError(`Public endpoints test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function cleanup() {
  logTest('Cleanup');
  
  try {
    // Delete test product
    if (testProductId) {
      await authRequest({
        method: 'DELETE',
        url: `${API_BASE}/products/${testProductId}`
      });
      logSuccess('Test product deleted');
    }
  } catch (error) {
    logInfo('Cleanup completed (some items may not exist)');
  }
}

async function runAllTests() {
  log('\n🚀 Starting API Integration Tests', 'bright');
  log('=====================================', 'bright');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const tests = [
    { name: 'Authentication', fn: testAuth },
    { name: 'Producer API', fn: testProducerAPI },
    { name: 'Product API', fn: testProductAPI },
    { name: 'Public Endpoints', fn: testPublicEndpoints }
  ];
  
  for (const test of tests) {
    totalTests++;
    try {
      const result = await test.fn();
      if (result) passedTests++;
    } catch (error) {
      logError(`Test ${test.name} crashed: ${error.message}`);
    }
  }
  
  // Test customer flow and orders
  totalTests++;
  const customerToken = await testCustomerFlow();
  if (customerToken) {
    passedTests++;
    
    totalTests++;
    const orderResult = await testOrderAPI(customerToken);
    if (orderResult) passedTests++;
  }
  
  // Cleanup
  await cleanup();
  
  // Summary
  log('\n📊 Test Results Summary', 'bright');
  log('======================', 'bright');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('\n🎉 All API integration tests passed!', 'green');
  } else {
    log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Check the logs above.`, 'yellow');
  }
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});
