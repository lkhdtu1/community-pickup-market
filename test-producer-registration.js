import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testProducerRegistration() {
  try {
    console.log('Testing producer registration...');
    
    const testData = {
      email: 'test-producer@example.com',
      password: 'password123',
      role: 'producer',
      profileData: {
        shopName: 'Test Farm',
        // Note: deliberately leaving description and address empty to test the fix
        certifications: ['Bio'],
        pickupInfo: {
          location: 'Test Location',
          hours: '9AM-5PM',
          instructions: 'Call when you arrive'
        }
      }
    };

    const response = await axios.post(`${API_URL}/auth/register`, testData);
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Run the test
testProducerRegistration()
  .then(() => {
    console.log('\n🎉 Test completed successfully - the database constraint violation has been fixed!');
    process.exit(0);
  })
  .catch(() => {
    console.log('\n💥 Test failed - there may still be issues with the registration process');
    process.exit(1);
  });
