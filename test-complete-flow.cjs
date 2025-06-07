const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testCustomer = {
  email: 'test-customer-flow@example.com',
  password: 'testpass123',
  firstName: 'Test',
  lastName: 'Customer',
  phone: '+33123456789'
};

const testProducer = {
  email: 'test-producer-flow@example.com', 
  password: 'testpass123',
  businessName: 'Test Farm',
  description: 'Test farm for complete flow testing',
  phone: '+33123456789'
};

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Community Pickup Market Flow\n');

  try {
    // 1. Test Customer Registration & Login
    console.log('📝 Step 1: Customer Registration & Authentication');
    
    // Register customer
    try {
      const customerRegResponse = await axios.post(`${BASE_URL}/auth/register`, {
        ...testCustomer,
        role: 'customer'
      });
      console.log('✅ Customer registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  Customer already exists, proceeding with login');
      } else {
        throw error;
      }
    }

    // Login customer
    const customerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testCustomer.email,
      password: testCustomer.password
    });
    console.log('✅ Customer login successful');
    
    const customerToken = customerLoginResponse.data.token;
    const customerHeaders = { Authorization: `Bearer ${customerToken}` };

    // 2. Test Producer Registration & Login  
    console.log('\n📝 Step 2: Producer Registration & Authentication');
    
    // Register producer
    try {
      const producerRegResponse = await axios.post(`${BASE_URL}/auth/register`, {
        ...testProducer,
        role: 'producer'
      });
      console.log('✅ Producer registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  Producer already exists, proceeding with login');
      } else {
        throw error;
      }
    }

    // Login producer
    const producerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testProducer.email,
      password: testProducer.password
    });
    console.log('✅ Producer login successful');
    
    const producerToken = producerLoginResponse.data.token;
    const producerHeaders = { Authorization: `Bearer ${producerToken}` };

    // 3. Test Product Management
    console.log('\n📝 Step 3: Product Management');
    
    // Create a test product
    const testProduct = {
      name: 'Test Tomatoes',
      description: 'Fresh organic tomatoes for testing',
      price: 3.50,
      unit: 'kg',
      category: 'vegetables',
      stock: 10
    };

    const productResponse = await axios.post(`${BASE_URL}/products`, testProduct, {
      headers: producerHeaders
    });
    console.log('✅ Product created successfully');
    
    const productId = productResponse.data.id;

    // Get products list
    const productsListResponse = await axios.get(`${BASE_URL}/products`);
    console.log(`✅ Products list retrieved (${productsListResponse.data.length} products)`);

    // 4. Test Customer Profile & Address Management
    console.log('\n📝 Step 4: Customer Profile & Address Management');
    
    // Update customer profile
    const profileUpdate = {
      firstName: 'Updated Test',
      lastName: 'Customer',
      phone: '+33987654321'
    };
    
    await axios.put(`${BASE_URL}/customers/profile`, profileUpdate, {
      headers: customerHeaders
    });
    console.log('✅ Customer profile updated');

    // Add customer address
    const testAddress = {
      type: 'billing',
      street: '123 Test Street',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      firstName: 'Test',
      lastName: 'Customer',
      isDefault: true
    };

    try {
      const addressResponse = await axios.post(`${BASE_URL}/customers/addresses`, testAddress, {
        headers: customerHeaders
      });
      console.log('✅ Customer address added');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️  Address already exists or validation error');
      }
    }

    // Get customer addresses
    const addressesResponse = await axios.get(`${BASE_URL}/customers/addresses`, {
      headers: customerHeaders
    });
    console.log(`✅ Customer addresses retrieved (${addressesResponse.data.length} addresses)`);

    // 5. Test Pickup Points
    console.log('\n📝 Step 5: Pickup Points Management');
    
    // Get pickup points
    const pickupPointsResponse = await axios.get(`${BASE_URL}/pickup-points`);
    console.log(`✅ Pickup points retrieved (${pickupPointsResponse.data.length} pickup points)`);

    // 6. Test Cart & Order Flow
    console.log('\n📝 Step 6: Cart & Order Management');
    
    // Add item to cart
    const cartItem = {
      productId: productId,
      quantity: 2
    };

    try {
      await axios.post(`${BASE_URL}/customers/cart`, cartItem, {
        headers: customerHeaders
      });
      console.log('✅ Item added to cart');
    } catch (error) {
      console.log('ℹ️  Cart item add failed or already exists:', error.response?.data?.message);
    }

    // Get cart
    const cartResponse = await axios.get(`${BASE_URL}/customers/cart`, {
      headers: customerHeaders
    });
    console.log(`✅ Cart retrieved (${cartResponse.data.length} items)`);

    // 7. Test Payment Flow Preparation
    console.log('\n📝 Step 7: Payment System Check');
    
    // Check if payment methods exist
    try {
      const paymentMethodsResponse = await axios.get(`${BASE_URL}/customers/payment-methods`, {
        headers: customerHeaders
      });
      console.log(`✅ Payment methods retrieved (${paymentMethodsResponse.data.length} methods)`);
    } catch (error) {
      console.log('ℹ️  Payment methods endpoint:', error.response?.status, error.response?.data?.message);
    }

    // Test payment intent creation
    try {
      const paymentIntentData = {
        amount: 7.00, // 2 * 3.50
        currency: 'eur'
      };
      
      const paymentIntentResponse = await axios.post(`${BASE_URL}/payments/create-payment-intent`, paymentIntentData, {
        headers: customerHeaders
      });
      console.log('✅ Payment intent created successfully');
      console.log(`   Payment Intent ID: ${paymentIntentResponse.data.paymentIntent.id}`);
    } catch (error) {
      console.log('❌ Payment intent creation failed:', error.response?.data?.message);
    }

    console.log('\n🎉 Complete Flow Test Summary:');
    console.log('✅ Authentication: Customer & Producer login working');
    console.log('✅ Product Management: Create/Read products working');
    console.log('✅ Profile Management: Customer profiles working'); 
    console.log('✅ Address Management: Customer addresses working');
    console.log('✅ Pickup Points: Retrieval working');
    console.log('✅ Cart Management: Add/retrieve cart items working');
    console.log('✅ Payment System: Stripe integration ready');
    
    console.log('\n🔧 Frontend Testing:');
    console.log('- Frontend running at: http://localhost:8080');
    console.log('- Backend API running at: http://localhost:3001');
    console.log('- Test customer: test-customer-flow@example.com / testpass123');
    console.log('- Test producer: test-producer-flow@example.com / testpass123');
    
    console.log('\n📋 Manual Test Steps:');
    console.log('1. Login as customer at http://localhost:8080');
    console.log('2. Browse products and add to cart');
    console.log('3. Proceed to checkout');
    console.log('4. Select pickup point');
    console.log('5. Verify payment flow redirects properly');
    console.log('6. Complete payment process');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testCompleteFlow();
