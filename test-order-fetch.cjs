const axios = require('axios');

async function testOrderFetch() {
    try {
        console.log('🚀 Testing Order Fetch');
        
        // First, register a customer to get a token
        console.log('1. Registering customer...');
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

        const registerResponse = await axios.post('http://localhost:3001/api/auth/register', customerData);
        const token = registerResponse.data.token;
        console.log('✅ Customer registered successfully, token received');        // First, we need to get a producer and their product
        console.log('2. Finding products and producer...');
        
        // Get all products first
        const productsResponse = await axios.get('http://localhost:3001/api/products');
        if (productsResponse.data.length === 0) {
            console.log('❌ No products found. Need to create test data first.');
            return;
        }
        
        const product = productsResponse.data[0];
        console.log('✅ Found product:', product.name);
        console.log('📊 Product data:', JSON.stringify(product, null, 2));
        
        // Get all producers to find the producer for this product
        const producersResponse = await axios.get('http://localhost:3001/api/producers');
        if (producersResponse.data.length === 0) {
            console.log('❌ No producers found. Need to create test data first.');
            return;
        }
        
        // Find a producer that matches the product's producer
        const producer = producersResponse.data.find(p => p.id === product.producerId) || producersResponse.data[0];
        console.log('✅ Found producer:', producer.name || producer.shopName);
        
        // Create an order
        console.log('3. Creating a test order...');
        const orderResponse = await axios.post('http://localhost:3001/api/orders', {
            producerId: producer.id,
            items: [{
                productId: product.id,
                quantity: 2
            }],
            pickupDate: "2024-12-25",
            pickupPoint: "Test pickup point",
            notes: "Test order for API testing"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
          console.log('✅ Order created successfully:', orderResponse.data.id);
        
        // Now try to fetch orders
        console.log('4. Fetching customer orders...');
        const fetchResponse = await axios.get('http://localhost:3001/api/orders/customer', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Orders fetched successfully!');
        console.log('📊 Orders:', JSON.stringify(fetchResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('Status:', error.response.status);
        }
    }
}

testOrderFetch();
