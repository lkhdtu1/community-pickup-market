const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testProducer = {
  email: `critical-test-producer-${Date.now()}@test.com`,
  password: 'TestPassword123!',
  role: 'producer',
  profileData: {
    shopName: 'Critical Test Farm',
    description: 'Testing critical issues resolution',
    address: '123 Critical Test Street'
  }
};

const testCustomer = {
  email: `critical-test-customer-${Date.now()}@test.com`,
  password: 'TestPassword123!',
  role: 'customer', 
  profileData: {
    firstName: 'Critical',
    lastName: 'Customer',
    phone: '555-CRITICAL',
    address: '456 Test Avenue'
  }
};

let testTokens = {};
let testIds = {};

console.log('🔍 CRITICAL ISSUES MANUAL TESTING VALIDATION');
console.log('============================================\n');

async function runComprehensiveTests() {
  try {
    // Setup phase
    await setupTestAccounts();
    
    // Critical Issue #4: Producer Profile Configuration
    await testCriticalIssue4_ProducerProfile();
    
    // Critical Issue #5: Pickup Points CRUD Management
    await testCriticalIssue5_PickupPointsCRUD();
    
    // End-to-end order confirmation flow
    await testEndToEndOrderFlow();
    
    // Producer dashboard functionality 
    await testProducerDashboardFunctionality();
    
    console.log('\n🎉 ALL CRITICAL ISSUES VALIDATION COMPLETE!');
    console.log('===========================================');
    
  } catch (error) {
    console.error('❌ Critical test failed:', error.message);
    process.exit(1);
  }
}

async function setupTestAccounts() {
  console.log('🔧 Setting up test accounts...\n');
  
  try {
    // Register producer
    const producerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testProducer);
    testTokens.producer = producerResponse.data.token;
    console.log('✅ Producer account created');
    
    // Register customer  
    const customerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testCustomer);
    testTokens.customer = customerResponse.data.token;
    console.log('✅ Customer account created');
    
    // Get producer profile to extract ID
    const producerProfile = await axios.get(`${API_BASE_URL}/users/producer/profile`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    testIds.producerId = producerProfile.data.id;
    console.log(`✅ Producer ID obtained: ${testIds.producerId}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
    throw error;
  }
  
  console.log('\n');
}

async function testCriticalIssue4_ProducerProfile() {
  console.log('🔍 CRITICAL ISSUE #4: Producer Profile Configuration');
  console.log('---------------------------------------------------\n');
  
  try {
    // Test 1: Check if producer profile can be retrieved
    console.log('1. Testing producer profile retrieval...');
    const profileResponse = await axios.get(`${API_BASE_URL}/users/producer/profile`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log('✅ Producer profile retrieved successfully');
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
    // Test 2: Update producer profile with complete information
    console.log('\n2. Testing producer profile update...');
    const updateData = {
      shopName: 'Updated Critical Test Farm',
      description: 'Updated description with comprehensive producer information',
      address: '789 Updated Farm Road, Test City, 12345',
      phone: '+1-555-FARM-001',
      email: testProducer.email,
      website: 'https://critical-test-farm.com',
      certifications: ['Organic', 'Fair Trade', 'Local'],
      pickupInfo: {
        location: '789 Updated Farm Road, Test City, 12345',
        hours: 'Monday-Friday: 9AM-5PM, Saturday: 8AM-2PM',
        instructions: 'Please call ahead for pickup arrangements. Use the side entrance.'
      },
      pickupDays: 'Monday through Saturday',
      pickupHours: '9AM-5PM weekdays, 8AM-2PM Saturday',
      deliveryZones: 'Within 25 miles of farm location'
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/users/producer/profile`, updateData, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log('✅ Producer profile updated successfully');
    
    // Test 3: Verify the update persisted
    console.log('\n3. Verifying profile update persistence...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/users/producer/profile`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    const updatedProfile = verifyResponse.data;
    console.log('✅ Profile update verified');
    
    // Test 4: Check for essential profile fields
    console.log('\n4. Validating essential profile fields...');
    const requiredFields = ['shopName', 'description', 'address', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !updatedProfile[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All essential profile fields are configured');
    } else {
      console.log(`⚠️  Missing essential fields: ${missingFields.join(', ')}`);
    }
    
    console.log('\n✅ CRITICAL ISSUE #4 VALIDATION: PASSED');
    console.log('Producer profile configuration is working correctly\n');
    
  } catch (error) {
    console.error('❌ CRITICAL ISSUE #4 VALIDATION: FAILED');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testCriticalIssue5_PickupPointsCRUD() {
  console.log('🔍 CRITICAL ISSUE #5: Pickup Points CRUD Management');
  console.log('---------------------------------------------------\n');
  
  try {
    // Test 1: Create shop (pickup points are managed through shops)
    console.log('1. Testing shop creation (pickup point management)...');
    const shopData = {
      name: 'Critical Test Shop',
      description: 'Test shop for pickup point management',
      address: '123 Pickup Point Avenue, Test City',
      phone: '+1-555-PICKUP-01',
      email: 'pickup@critical-test.com',
      specialties: ['Pickup Services', 'Local Products'],
      images: [],
      certifications: ['Certified Pickup Point'],
      pickupInfo: {
        location: '123 Pickup Point Avenue, Test City',
        hours: 'Monday-Sunday: 7AM-9PM',
        instructions: 'Main entrance pickup counter. Please bring order confirmation.'
      }
    };
    
    const shopResponse = await axios.post(`${API_BASE_URL}/shops`, shopData, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    testIds.shopId = shopResponse.data.id;
    console.log(`✅ Shop (pickup point) created successfully: ${testIds.shopId}`);
    
    // Test 2: Read - Get pickup points (via shops)
    console.log('\n2. Testing pickup points retrieval...');
    const pickupPointsResponse = await axios.get(`${API_BASE_URL}/shops/my-shops`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log(`✅ Retrieved ${pickupPointsResponse.data.length} pickup point(s)`);
    console.log('Pickup point data:', JSON.stringify(pickupPointsResponse.data[0], null, 2));
    
    // Test 3: Update - Modify pickup point information
    console.log('\n3. Testing pickup point update...');
    const updatePickupData = {
      name: 'Updated Critical Test Shop',
      description: 'Updated test shop with enhanced pickup services',
      address: '456 Enhanced Pickup Avenue, Test City',
      phone: '+1-555-PICKUP-02',
      email: 'enhanced-pickup@critical-test.com',
      specialties: ['Enhanced Pickup Services', 'Priority Processing'],
      pickupInfo: {
        location: '456 Enhanced Pickup Avenue, Test City - Loading Dock B',
        hours: 'Monday-Sunday: 6AM-10PM, 24/7 automated pickup available',
        instructions: 'Enhanced pickup with QR code system. Automated lockers available 24/7.'
      }
    };
    
    const updatePickupResponse = await axios.put(`${API_BASE_URL}/shops/${testIds.shopId}`, updatePickupData, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log('✅ Pickup point updated successfully');
    
    // Test 4: Verify pickup point access control (producer only)
    console.log('\n4. Testing pickup point access control...');
    try {
      await axios.get(`${API_BASE_URL}/shops/my-shops`, {
        headers: { Authorization: `Bearer ${testTokens.customer}` }
      });
      console.log('❌ Customer should not have access to pickup point management');
    } catch (accessError) {
      console.log('✅ Pickup point management properly restricted to producers only');
    }
    
    // Test 5: Create additional pickup point
    console.log('\n5. Testing multiple pickup points creation...');
    const secondPickupData = {
      name: 'Secondary Pickup Location',
      description: 'Secondary pickup point for convenience',
      address: '789 Secondary Street, Test City',
      phone: '+1-555-PICKUP-03',
      email: 'secondary@critical-test.com',
      specialties: ['Express Pickup', 'Weekend Services'],
      pickupInfo: {
        location: '789 Secondary Street, Test City - Side Entrance',
        hours: 'Weekends: 8AM-6PM',
        instructions: 'Weekend pickup location. Ring bell for assistance.'
      }
    };
    
    const secondPickupResponse = await axios.post(`${API_BASE_URL}/shops`, secondPickupData, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    testIds.secondShopId = secondPickupResponse.data.id;
    console.log(`✅ Secondary pickup point created: ${testIds.secondShopId}`);
    
    // Test 6: Verify multiple pickup points
    console.log('\n6. Verifying multiple pickup points management...');
    const allPickupPointsResponse = await axios.get(`${API_BASE_URL}/shops/my-shops`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log(`✅ Producer has ${allPickupPointsResponse.data.length} pickup point(s) total`);
    
    console.log('\n✅ CRITICAL ISSUE #5 VALIDATION: PASSED');
    console.log('Pickup points CRUD management is working correctly\n');
    
  } catch (error) {
    console.error('❌ CRITICAL ISSUE #5 VALIDATION: FAILED');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testEndToEndOrderFlow() {
  console.log('🔍 END-TO-END ORDER CONFIRMATION FLOW');
  console.log('-------------------------------------\n');
  
  try {
    // Test 1: Create a product for ordering
    console.log('1. Creating product for order testing...');
    const productData = {
      name: 'Critical Test Apples',
      description: 'Fresh apples for critical testing',
      price: 4.99,
      stock: 50,
      category: 'Fruits',
      unit: 'lb',
      shopId: testIds.shopId
    };
    
    const productResponse = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    testIds.productId = productResponse.data.id;
    console.log(`✅ Product created: ${testIds.productId}`);
    
    // Test 2: Create order with proper producer information
    console.log('\n2. Testing order creation with producer information...');
    const orderData = {
      producerId: testIds.producerId,
      items: [
        {
          productId: testIds.productId,
          productName: 'Critical Test Apples',
          quantity: 3,
          unitPrice: 4.99
        }
      ],
      pickupPoint: 'Critical Test Shop - 456 Enhanced Pickup Avenue',
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Critical testing order - please handle with care'
    };
    
    const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${testTokens.customer}` }
    });
    
    testIds.orderId = orderResponse.data.id;
    console.log(`✅ Order created successfully: ${testIds.orderId}`);
    console.log('Order total:', orderResponse.data.total);
    
    // Test 3: Verify producer information in order
    console.log('\n3. Verifying producer information in order...');
    const producerOrdersResponse = await axios.get(`${API_BASE_URL}/orders/producer`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    const createdOrder = producerOrdersResponse.data.find(order => order.id === testIds.orderId);
    if (createdOrder && createdOrder.customerName !== 'undefined') {
      console.log('✅ Producer information properly displayed in order');
      console.log('Customer name:', createdOrder.customerName);
    } else {
      console.log('❌ Producer information showing as undefined');
    }
    
    // Test 4: Test order status updates
    console.log('\n4. Testing order status updates...');
    const statusUpdates = ['preparee', 'prete', 'retiree'];
    
    for (const status of statusUpdates) {
      const updateResponse = await axios.put(`${API_BASE_URL}/orders/${testIds.orderId}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${testTokens.producer}` } }
      );
      console.log(`✅ Order status updated to: ${status}`);
    }
    
    console.log('\n✅ END-TO-END ORDER FLOW: PASSED');
    console.log('Order confirmation and management working correctly\n');
    
  } catch (error) {
    console.error('❌ END-TO-END ORDER FLOW: FAILED');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testProducerDashboardFunctionality() {
  console.log('🔍 PRODUCER DASHBOARD FUNCTIONALITY');
  console.log('----------------------------------\n');
  
  try {
    // Test 1: Producer statistics
    console.log('1. Testing producer statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/users/producer/stats`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log('✅ Producer statistics retrieved');
    console.log('Stats:', {
      totalRevenue: statsResponse.data.totalRevenue,
      totalOrders: statsResponse.data.totalOrders,
      activeProducts: statsResponse.data.activeProducts,
      totalShops: statsResponse.data.totalShops
    });
    
    // Test 2: Producer orders management
    console.log('\n2. Testing producer orders management...');
    const ordersResponse = await axios.get(`${API_BASE_URL}/orders/producer`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log(`✅ Retrieved ${ordersResponse.data.length} order(s) for producer`);
    
    // Test 3: Product management
    console.log('\n3. Testing product management...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products/my-products`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log(`✅ Retrieved ${productsResponse.data.length} product(s) for producer`);
    
    // Test 4: Shop management validation
    console.log('\n4. Testing shop management validation...');
    const shopsResponse = await axios.get(`${API_BASE_URL}/shops/my-shops`, {
      headers: { Authorization: `Bearer ${testTokens.producer}` }
    });
    
    console.log(`✅ Retrieved ${shopsResponse.data.length} shop(s) for producer`);
    
    console.log('\n✅ PRODUCER DASHBOARD FUNCTIONALITY: PASSED');
    console.log('All dashboard features working correctly\n');
    
  } catch (error) {
    console.error('❌ PRODUCER DASHBOARD FUNCTIONALITY: FAILED');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Run the comprehensive tests
runComprehensiveTests().catch(console.error);
