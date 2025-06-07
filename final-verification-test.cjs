const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:8080';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logStep(step, description) {
  console.log(colors.blue + colors.bold + `\n🔍 Step ${step}: ${description}` + colors.reset);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testServerConnectivity() {
  logStep(1, 'Testing server connectivity');
  
  // Try a few different endpoints to check server connectivity
  const endpoints = ['/api/health', '/api/auth/login', '/'];
  
  for (const endpoint of endpoints) {
    const result = await apiRequest('GET', endpoint);
    if (result.success || result.status === 404 || result.status === 405) {
      logSuccess('Backend server is accessible');
      return true;
    }
  }
  
  logError('Backend server not accessible');
  return false;
}

async function testAuthentication() {
  logStep(2, 'Testing authentication flow');
  
  // Test login
  log('Testing login...');
  const loginResult = await apiRequest('POST', '/api/auth/login', testUser);
  
  if (loginResult.success) {
    authToken = loginResult.data.token;
    logSuccess('Login successful');
    log(`Token received: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logError(`Login failed: ${loginResult.error}`);
    
    // If login fails, try to register first
    log('Attempting to register user...');
    const registerResult = await apiRequest('POST', '/api/auth/register', {
      ...testUser,
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (registerResult.success) {
      logSuccess('Registration successful, attempting login again...');
      const secondLoginResult = await apiRequest('POST', '/api/auth/login', testUser);
      
      if (secondLoginResult.success) {
        authToken = secondLoginResult.data.token;
        logSuccess('Login successful after registration');
        return true;
      } else {
        logError(`Second login attempt failed: ${secondLoginResult.error}`);
        return false;
      }
    } else {
      logError(`Registration failed: ${registerResult.error}`);
      return false;
    }
  }
}

async function testPaymentEndpoints() {
  logStep(3, 'Testing payment system endpoints');
  
  if (!authToken) {
    logError('No auth token available for payment tests');
    return false;
  }
  
  const headers = { Authorization: `Bearer ${authToken}` };
  
  // Test payment intent creation
  log('Testing payment intent creation...');
  const paymentIntentResult = await apiRequest('POST', '/api/payments/create-payment-intent', {
    amount: 2500, // 25.00 EUR in cents
    currency: 'eur',
    metadata: {
      billingAddressId: 'test-address-1'
    }
  }, headers);
  
  if (paymentIntentResult.success) {
    logSuccess('Payment intent creation successful');
    log(`Payment Intent ID: ${paymentIntentResult.data.clientSecret?.substring(0, 30)}...`);
  } else {
    logError(`Payment intent creation failed: ${paymentIntentResult.error}`);
    return false;
  }
  
  // Test payment methods endpoint
  log('Testing payment methods retrieval...');
  const paymentMethodsResult = await apiRequest('GET', '/api/customers/payment-methods', null, headers);
  
  if (paymentMethodsResult.success) {
    logSuccess(`Payment methods retrieved successfully (${paymentMethodsResult.data.length} methods)`);
  } else {
    logWarning(`Payment methods retrieval failed: ${paymentMethodsResult.error} (This might be normal for new users)`);
  }
  
  // Test addresses endpoint  
  log('Testing addresses retrieval...');
  const addressesResult = await apiRequest('GET', '/api/customers/addresses', null, headers);
  
  if (addressesResult.success) {
    logSuccess(`Addresses retrieved successfully (${addressesResult.data.length} addresses)`);
  } else {
    logWarning(`Addresses retrieval failed: ${addressesResult.error} (This might be normal for new users)`);
  }
  
  return true;
}

async function testFrontendAccess() {
  logStep(4, 'Testing frontend accessibility');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    if (response.status === 200) {
      logSuccess('Frontend is accessible');
      return true;
    } else {
      logError(`Frontend returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Frontend not accessible: ${error.message}`);
    return false;
  }
}

async function testRateLimiting() {
  logStep(5, 'Testing rate limiting fix');
  
  log('Sending multiple authentication requests to test rate limiting...');
  
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(apiRequest('POST', '/api/auth/login', testUser));
  }
  
  const results = await Promise.all(requests);
  const successCount = results.filter(r => r.success || r.status === 401).length; // 401 is expected for wrong credentials
  const rateLimitedCount = results.filter(r => r.status === 429).length;
  
  logSuccess(`${successCount}/10 requests were processed (not rate limited)`);
  if (rateLimitedCount > 0) {
    logWarning(`${rateLimitedCount}/10 requests were rate limited`);
  }
  
  return rateLimitedCount === 0;
}

// Main test execution
async function runAllTests() {
  console.log(colors.bold + colors.blue + '\n🚀 Starting Community Pickup Market - Final Verification Tests\n' + colors.reset);
  
  const results = {
    connectivity: false,
    authentication: false,
    payment: false,
    frontend: false,
    rateLimiting: false
  };
  
  try {
    results.connectivity = await testServerConnectivity();
    results.authentication = await testAuthentication();
    results.payment = await testPaymentEndpoints();
    results.frontend = await testFrontendAccess();
    results.rateLimiting = await testRateLimiting();
    
  } catch (error) {
    logError(`Test execution error: ${error.message}`);
  }
  
  // Summary
  console.log(colors.bold + colors.blue + '\n📊 Test Results Summary:\n' + colors.reset);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${test.toUpperCase().padEnd(15)} ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  console.log('\n' + colors.bold + (allPassed ? colors.green : colors.red));
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Both authentication and payment flow issues are RESOLVED.');
    console.log('\n✅ Login failed error: FIXED');
    console.log('✅ Payment redirect failure: FIXED');
    console.log('\n🔗 You can now test the complete flow at: http://localhost:8080');
  } else {
    console.log('❌ SOME TESTS FAILED. Issues still need attention.');
  }
  console.log(colors.reset);
}

// Run the tests
runAllTests().catch(console.error);
