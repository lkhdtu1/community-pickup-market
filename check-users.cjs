const axios = require('axios');

async function checkUsers() {
    console.log('🔍 CHECKING USERS IN DATABASE');
    console.log('==============================');
    
    // Test customer@test.com
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'customer@test.com',
            password: 'password123'
        });
        console.log('✅ customer@test.com login successful');
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
    } catch (error) {
        console.log('❌ customer@test.com login failed:', error.response?.data?.message || error.message);
    }
    
    // Test producer@test.com  
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'producer@test.com',
            password: 'testpass123'
        });
        console.log('✅ producer@test.com login successful');
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
    } catch (error) {
        console.log('❌ producer@test.com login failed:', error.response?.data?.message || error.message);
    }
    
    // Test registration to see what happens
    try {
        const response = await axios.post('http://localhost:3001/api/auth/register', {
            email: 'test-customer@test.com',
            password: 'password123',
            role: 'customer',
            firstName: 'Test',
            lastName: 'Customer'
        });
        console.log('✅ Registration working');
        console.log('New user:', response.data);
    } catch (error) {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    }
}

checkUsers().catch(console.error);
