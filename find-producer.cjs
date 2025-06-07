const axios = require('axios');

async function findValidProducer() {
    console.log('🔍 FINDING VALID PRODUCER CREDENTIALS');
    console.log('=====================================');
    
    // Get all producers
    try {
        const response = await axios.get('http://localhost:3001/api/producers');
        console.log(`Found ${response.data.length} producers`);
        
        // Try to login with the first few producers using different common passwords
        const commonPasswords = ['password123', 'testpass123', 'producer123', 'test123'];
        
        for (let i = 0; i < Math.min(5, response.data.length); i++) {
            const producer = response.data[i];
            console.log(`\nTrying producer: ${producer.name}`);
            
            for (const password of commonPasswords) {
                try {
                    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
                        email: producer.name, // name is actually email in this case
                        password: password
                    });
                    console.log(`✅ SUCCESS! ${producer.name} with password: ${password}`);
                    console.log(`Token: ${loginResponse.data.token}`);
                    return { email: producer.name, password: password, token: loginResponse.data.token };
                } catch (error) {
                    console.log(`❌ ${producer.name} with ${password}: ${error.response?.data?.message || 'failed'}`);
                }
            }
        }
        
        console.log('\n❌ No valid producer credentials found');
        return null;
        
    } catch (error) {
        console.log('❌ Failed to get producers:', error.message);
        return null;
    }
}

findValidProducer().catch(console.error);
