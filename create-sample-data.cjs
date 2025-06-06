const axios = require('axios');

async function createSampleData() {
  try {
    console.log('Creating sample data for analytics testing...');
    
    // Login as producer to get token
    const producerLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-producer-1749250564798@example.com',
      password: 'password123'
    });
    
    const producerToken = producerLogin.data.token;
    console.log('Producer login successful');

    // Create some products first
    const products = [
      { name: 'Tomates bio', description: 'Tomates biologiques', price: 4.50, category: 'Légumes', unit: 'kg' },
      { name: 'Miel de lavande', description: 'Miel artisanal', price: 12.00, category: 'Épicerie', unit: 'pot' },
      { name: 'Salade', description: 'Salade fraîche', price: 3.00, category: 'Légumes', unit: 'pièce' }
    ];

    console.log('Creating products...');
    for (const product of products) {
      try {
        await axios.post('http://localhost:3001/api/products', product, {
          headers: { 'Authorization': `Bearer ${producerToken}` }
        });
        console.log(`✅ Created product: ${product.name}`);
      } catch (error) {
        console.log(`Product ${product.name} may already exist`);
      }
    }

    // Login as customer
    const customerLogin = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test-customer-1749250564414@example.com',
      password: 'password123'
    });
    
    const customerToken = customerLogin.data.token;
    console.log('Customer login successful');

    // Get producer info to create orders
    const producerProfile = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${producerToken}` }
    });    const producerId = producerProfile.data.user?.profile?.id;
    if (!producerId) {
      console.error('Producer ID not found');
      console.log('Producer profile structure:', JSON.stringify(producerProfile.data, null, 2));
      return;
    }

    // Create sample orders
    const orders = [
      {
        producerId: producerId,
        items: [
          { productName: 'Tomates bio', quantity: 2, unitPrice: 4.50 },
          { productName: 'Miel de lavande', quantity: 1, unitPrice: 12.00 }
        ],
        pickupDate: '2025-06-10',
        pickupPoint: 'Marché central',
        notes: 'Test order 1'
      },
      {
        producerId: producerId,
        items: [
          { productName: 'Salade', quantity: 3, unitPrice: 3.00 },
          { productName: 'Tomates bio', quantity: 1, unitPrice: 4.50 }
        ],
        pickupDate: '2025-06-08',
        pickupPoint: 'Marché central',
        notes: 'Test order 2'
      }
    ];

    console.log('Creating sample orders...');
    for (let i = 0; i < orders.length; i++) {
      try {
        const response = await axios.post('http://localhost:3001/api/orders', orders[i], {
          headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        console.log(`✅ Created order ${i + 1}: ID ${response.data.id}`);        // Update order status to PICKED_UP for analytics
        await axios.put(`http://localhost:3001/api/orders/${response.data.id}/status`, {
          status: 'retiree'
        }, {
          headers: { 'Authorization': `Bearer ${producerToken}` }
        });
        console.log(`✅ Updated order ${i + 1} status to PICKED_UP`);
      } catch (error) {
        console.error(`Error creating order ${i + 1}:`, error.response?.data || error.message);
      }
    }

    // Test analytics again
    console.log('\nTesting analytics with sample data...');
    const analyticsResponse = await axios.get('http://localhost:3001/api/orders/producer/stats', {
      headers: { 'Authorization': `Bearer ${producerToken}` }
    });
    
    console.log('Updated analytics data:');
    console.log(JSON.stringify(analyticsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error creating sample data:', error.response?.data || error.message);
  }
}

createSampleData();
