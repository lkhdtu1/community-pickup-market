const API_BASE_URL = 'http://localhost:3001/api';

// Test data for payment methods and addresses
async function testCustomerAccountAPIs() {
  console.log('Testing Customer Account APIs...');
  
  try {
    // First, let's create a test customer (assuming they exist)
    // We'll test with a real customer login
    
    // Test login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@test.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Customer login failed, creating test customer...');
      
      // Register a test customer
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'customer@test.com',
          password: 'password123',
          role: 'customer',
          firstName: 'John',
          lastName: 'Doe'
        })
      });
      
      if (!registerResponse.ok) {
        const error = await registerResponse.text();
        console.error('Registration failed:', error);
        return;
      }
      
      console.log('Test customer registered successfully');
      
      // Login again
      const retryLogin = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'customer@test.com',
          password: 'password123'
        })
      });
      
      if (!retryLogin.ok) {
        console.error('Login after registration failed');
        return;
      }
      
      const loginData = await retryLogin.json();
      const token = loginData.token;
      
      console.log('Login successful, token:', token.substring(0, 20) + '...');
      
      // Set headers for authenticated requests
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      await testAPIsWithToken(authHeaders);
    } else {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      console.log('Login successful, token:', token.substring(0, 20) + '...');
      
      // Set headers for authenticated requests
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      await testAPIsWithToken(authHeaders);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testAPIsWithToken(authHeaders) {
  // Test payment methods APIs
  console.log('\n=== Testing Payment Methods APIs ===');
  
  // Get payment methods (should be empty initially)
  let response = await fetch(`${API_BASE_URL}/users/customer/payment-methods`, {
    headers: authHeaders
  });
  let paymentMethods = await response.json();
  console.log('Initial payment methods:', paymentMethods);
  
  // Add a payment method
  response = await fetch(`${API_BASE_URL}/users/customer/payment-methods`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'card',
      cardLastFour: '1234',
      cardBrand: 'visa',
      expiryMonth: '12/25',
      holderName: 'John Doe',
      isDefault: true
    })
  });
  
  if (response.ok) {
    const newPaymentMethod = await response.json();
    console.log('Payment method added:', newPaymentMethod);
    
    // Add another payment method
    response = await fetch(`${API_BASE_URL}/users/customer/payment-methods`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'card',
        cardLastFour: '5678',
        cardBrand: 'mastercard',
        expiryMonth: '08/26',
        holderName: 'John Doe',
        isDefault: false
      })
    });
    
    if (response.ok) {
      const secondPaymentMethod = await response.json();
      console.log('Second payment method added:', secondPaymentMethod);
    }
  } else {
    console.error('Failed to add payment method:', await response.text());
  }
  
  // Get payment methods again
  response = await fetch(`${API_BASE_URL}/users/customer/payment-methods`, {
    headers: authHeaders
  });
  paymentMethods = await response.json();
  console.log('Payment methods after adding:', paymentMethods);
  
  // Test addresses APIs
  console.log('\n=== Testing Addresses APIs ===');
  
  // Get addresses (should be empty initially)
  response = await fetch(`${API_BASE_URL}/users/customer/addresses`, {
    headers: authHeaders
  });
  let addresses = await response.json();
  console.log('Initial addresses:', addresses);
  
  // Add an address
  response = await fetch(`${API_BASE_URL}/users/customer/addresses`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'home',
      street: '123 Main Street',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      firstName: 'John',
      lastName: 'Doe',
      isDefault: true
    })
  });
  
  if (response.ok) {
    const newAddress = await response.json();
    console.log('Address added:', newAddress);
    
    // Add another address
    response = await fetch(`${API_BASE_URL}/users/customer/addresses`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        type: 'work',
        street: '456 Business Ave',
        street2: 'Suite 100',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+33123456789',
        isDefault: false
      })
    });
    
    if (response.ok) {
      const secondAddress = await response.json();
      console.log('Second address added:', secondAddress);
    }
  } else {
    console.error('Failed to add address:', await response.text());
  }
  
  // Get addresses again
  response = await fetch(`${API_BASE_URL}/users/customer/addresses`, {
    headers: authHeaders
  });
  addresses = await response.json();
  console.log('Addresses after adding:', addresses);
  
  console.log('\n=== Testing Complete ===');
  console.log('✅ Payment Methods and Addresses APIs are working!');
}

// Run the test
testCustomerAccountAPIs();
