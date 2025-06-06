const axios = require('axios');

async function testOrderFetch() {
    try {
        console.log('🚀 Testing Order Fetch');
        
        // First, login to get a token
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'test-customer-1749247707380@example.com',
            password: 'testpass123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token received');
        
        // Create an order first
        console.log('2. Creating a test order...');
        const orderResponse = await axios.post('http://localhost:3001/api/orders', {
            items: [{
                productId: "d0f1bd52-73e5-4105-bda9-bab003df4d82",
                quantity: 2
            }],
            pickupDate: "2024-12-25"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Order created successfully:', orderResponse.data.orderId);
        
        // Now try to fetch orders
        console.log('3. Fetching customer orders...');
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
