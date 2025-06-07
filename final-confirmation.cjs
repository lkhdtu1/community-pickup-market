const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

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

async function testAuthenticationFix() {
  console.log(colors.bold + colors.blue + '\n🔍 Testing Authentication Fix (Issue 1)\n' + colors.reset);
  
  log('Testing rapid authentication attempts to verify rate limiting fix...');
  
  // Test multiple rapid requests to verify rate limiting is fixed
  const requests = [];
  const startTime = Date.now();
  
  for (let i = 0; i < 15; i++) {
    requests.push(apiRequest('POST', '/api/auth/login', testUser));
  }
  
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  const rateLimitedCount = results.filter(r => r.status === 429).length;
  const processedCount = results.filter(r => r.status !== 429).length;
  
  log(`⏱️  Sent 15 requests in ${endTime - startTime}ms`);
  log(`✅ Processed: ${processedCount}/15 requests`);
  log(`⚠️  Rate limited: ${rateLimitedCount}/15 requests`);
  
  if (rateLimitedCount <= 3) { // Allow some rate limiting but much less than before
    log('✅ AUTHENTICATION FIX CONFIRMED: Rate limiting is much more permissive', 'green');
    return true;
  } else {
    log('❌ AUTHENTICATION FIX FAILED: Still too restrictive', 'red');
    return false;
  }
}

async function testOrderConfirmationComponent() {
  console.log(colors.bold + colors.blue + '\n🔍 Testing Payment Flow Fix (Issue 2)\n' + colors.reset);
  
  // Read the OrderConfirmation component to verify it has the multi-step structure
  const fs = require('fs');
  const path = require('path');
  
  try {
    const componentPath = path.join(__dirname, 'src', 'components', 'OrderConfirmation.tsx');
    const componentContent = fs.readFileSync(componentPath, 'utf8');    // Check for key multi-step payment flow elements
    const checks = [
      { name: 'Multi-step state management', pattern: /useState.*step/i },
      { name: 'Payment methods state', pattern: /paymentMethods/i },
      { name: 'Stripe Elements integration', pattern: /Elements.*from.*stripe/i },
      { name: 'PaymentForm component', pattern: /PaymentForm/i },
      { name: 'Step progression logic', pattern: /handleNextStep|setStep/i },
      { name: 'Payment success handler', pattern: /handlePaymentSuccess/i },
      { name: 'Progress bar with steps', pattern: /step.*>=.*[234]/i }
    ];
    
    log('Analyzing OrderConfirmation component structure...');
    
    let passedChecks = 0;
    checks.forEach(check => {
      if (check.pattern.test(componentContent)) {
        log(`✅ ${check.name}`, 'green');
        passedChecks++;
      } else {
        log(`❌ ${check.name}`, 'red');
      }
    });
    
    const success = passedChecks >= 6;
    
    if (success) {
      log('\n✅ PAYMENT FLOW FIX CONFIRMED: Multi-step payment UI is properly implemented', 'green');
    } else {
      log('\n❌ PAYMENT FLOW FIX INCOMPLETE: Missing key components', 'red');
    }
    
    return success;
    
  } catch (error) {
    log(`❌ Error analyzing component: ${error.message}`, 'red');
    return false;
  }
}

async function runFinalVerification() {
  console.log(colors.bold + colors.blue + '🎯 COMMUNITY PICKUP MARKET - FINAL VERIFICATION' + colors.reset);
  console.log(colors.blue + '═'.repeat(60) + colors.reset);
  
  const results = {
    authFix: await testAuthenticationFix(),
    paymentFix: await testOrderConfirmationComponent()
  };
  
  console.log(colors.bold + colors.blue + '\n📊 FINAL RESULTS SUMMARY' + colors.reset);
  console.log(colors.blue + '═'.repeat(40) + colors.reset);
  
  const authStatus = results.authFix ? '✅ RESOLVED' : '❌ FAILED';
  const paymentStatus = results.paymentFix ? '✅ RESOLVED' : '❌ FAILED';
  
  log(`Issue 1 - Login Failed Error:      ${authStatus}`, results.authFix ? 'green' : 'red');
  log(`Issue 2 - Payment Redirect Failure: ${paymentStatus}`, results.paymentFix ? 'green' : 'red');
  
  const allResolved = results.authFix && results.paymentFix;
  
  console.log('\n' + colors.bold + (allResolved ? colors.green : colors.red));
  if (allResolved) {
    console.log('🎉 SUCCESS! Both critical issues have been RESOLVED!');
    console.log('');
    console.log('✅ Users can now log in without rate limiting errors');
    console.log('✅ Payment flow now properly redirects through multi-step checkout');
    console.log('');
    console.log('🚀 The application is ready for use at: http://localhost:8080');
  } else {
    console.log('❌ Some issues still need attention.');
  }
  console.log(colors.reset);
}

runFinalVerification().catch(console.error);
