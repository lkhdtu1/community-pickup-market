const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001/api';

async function diagnoseAllIssues() {
    console.log('🔍 COMMUNITY PICKUP MARKET - CRITICAL ISSUES DIAGNOSIS');
    console.log('==================================================\n');

    const results = {
        backendConnectivity: false,
        frontendConnectivity: false,
        dataLoading: false,
        authSystem: false,
        cartPersistence: false,
        shopManagement: false,
        orderProcessing: false,
        criticalErrors: []
    };

    // 1. Test Backend Connectivity
    console.log('1️⃣  Testing Backend Connectivity...');
    try {
        const healthResponse = await axios.get('http://localhost:3001/health');
        console.log('✅ Backend is accessible');
        results.backendConnectivity = true;
    } catch (error) {
        console.log('❌ Backend connectivity failed:', error.message);
        results.criticalErrors.push('Backend server not accessible');
    }

    // 2. Test Frontend Connectivity
    console.log('\n2️⃣  Testing Frontend Connectivity...');
    try {
        const frontendResponse = await axios.get(FRONTEND_URL);
        console.log('✅ Frontend is accessible');
        results.frontendConnectivity = true;
    } catch (error) {
        console.log('❌ Frontend connectivity failed:', error.message);
        results.criticalErrors.push('Frontend server not accessible');
    }

    // 3. Test Data Loading (Products & Producers)
    console.log('\n3️⃣  Testing Data Loading...');
    try {        const [productsResponse, producersResponse] = await Promise.all([
            axios.get(`${BACKEND_URL}/products`),
            axios.get(`${BACKEND_URL}/producers`)
        ]);
        
        console.log(`✅ Products API: ${productsResponse.data.length} products loaded`);
        console.log(`✅ Producers API: ${producersResponse.data.length} producers loaded`);
        
        if (productsResponse.data.length === 0) {
            results.criticalErrors.push('No products in database - shop creation/product management may be broken');
        }
        
        if (producersResponse.data.length === 0) {
            results.criticalErrors.push('No producers in database - producer account functionality may be broken');
        }
        
        results.dataLoading = true;
    } catch (error) {
        console.log('❌ Data loading failed:', error.message);
        results.criticalErrors.push('API data loading failure - frontend will show empty pages');
    }

    // 4. Test Authentication System
    console.log('\n4️⃣  Testing Authentication System...');
    try {
        // Test customer login
        const customerLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: 'customer@test.com',
            password: 'password123'
        });
        
        console.log('✅ Customer authentication working');
          // Test producer login
        const producerLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: 'producer.enhanced.1749317575201@test.com', 
            password: 'testpass123'
        });
        
        console.log('✅ Producer authentication working');
        results.authSystem = true;
        
    } catch (error) {
        console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
        results.criticalErrors.push('Authentication system broken - users cannot login');
    }

    // 5. Test Shop Management
    console.log('\n5️⃣  Testing Shop Management...');
    try {        // Get test producer token
        const producerLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: 'producer.enhanced.1749317575201@test.com',
            password: 'testpass123'
        }).catch(() => null);
        
        if (producerLogin) {
            const token = producerLogin.data.token;
            
            // Test getting shops
            const shopsResponse = await axios.get(`${BACKEND_URL}/shops/my-shops`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`✅ Shop management API: ${shopsResponse.data.length} shops found`);
            results.shopManagement = true;
        } else {
            throw new Error('Cannot test shop management - no producer token');
        }
        
    } catch (error) {
        console.log('❌ Shop management failed:', error.response?.data?.message || error.message);
        results.criticalErrors.push('Shop creation/management broken - producers cannot manage shops');
    }

    // 6. Test Order Processing
    console.log('\n6️⃣  Testing Order Processing...');
    try {
        // Get customer token
        const customerLogin = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: 'customer@test.com',
            password: 'password123'
        }).catch(() => null);
        
        if (customerLogin) {
            const token = customerLogin.data.token;
            
            // Test getting orders
            const ordersResponse = await axios.get(`${BACKEND_URL}/orders/customer`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`✅ Order processing API: ${ordersResponse.data.length} orders found`);
            results.orderProcessing = true;
        } else {
            throw new Error('Cannot test orders - no customer token');
        }
        
    } catch (error) {
        console.log('❌ Order processing failed:', error.response?.data?.message || error.message);
        results.criticalErrors.push('Order processing broken - customers cannot place/view orders');
    }

    // 7. Summary and Recommendations
    console.log('\n🎯 DIAGNOSIS SUMMARY');
    console.log('==================');
    
    if (results.criticalErrors.length === 0) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('The platform appears to be working correctly.');
        console.log('\n💡 Next steps:');
        console.log('- Open http://localhost:3000 in your browser');
        console.log('- Test manual user workflows');
        console.log('- Check browser console for JavaScript errors');
    } else {
        console.log('🚨 CRITICAL ISSUES FOUND:');
        results.criticalErrors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
        
        console.log('\n🔧 IMMEDIATE ACTION REQUIRED:');
        
        if (!results.backendConnectivity) {
            console.log('- Start backend server: cd server && npm start');
        }
        
        if (!results.frontendConnectivity) {
            console.log('- Start frontend server: npm run dev');
        }
        
        if (!results.dataLoading) {
            console.log('- Check API endpoints and database connection');
        }
        
        if (!results.authSystem) {
            console.log('- Verify test users exist in database');
            console.log('- Check JWT token generation/validation');
        }
        
        if (!results.shopManagement) {
            console.log('- Check shop creation and management endpoints');
            console.log('- Verify producer role permissions');
        }
        
        if (!results.orderProcessing) {
            console.log('- Check order creation and retrieval endpoints');
            console.log('- Verify cart to order conversion logic');
        }
    }
    
    console.log('\n🌐 Test URLs:');
    console.log('- Frontend: http://localhost:3000');
    console.log('- Backend API: http://localhost:3001/api');
    console.log('- API Health: http://localhost:3001/api/health');
}

// Run diagnosis
diagnoseAllIssues().catch(error => {
    console.error('❌ Diagnosis failed:', error.message);
    process.exit(1);
});
