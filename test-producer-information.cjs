// Test script for Producer Information Management
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testProducerInformation() {
  console.log('🧪 Testing Producer Information Management\n');

  try {
    // First, we need to register and login as a producer
    const producerData = {
      email: 'test-producer-info@example.com',
      password: 'testpass123',
      role: 'producer',
      firstName: 'Test',
      lastName: 'Producer'
    };

    console.log('📝 Step 1: Producer Registration');
    let producerRegResponse;
    try {
      producerRegResponse = await axios.post(`${BASE_URL}/auth/register`, producerData);
      console.log('✅ Producer registered successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('exists')) {
        console.log('ℹ️ Producer already exists, proceeding with login');
      } else {
        throw error;
      }
    }

    console.log('🔑 Step 2: Producer Login');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: producerData.email,
      password: producerData.password
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Producer logged in successfully');

    console.log('📊 Step 3: Get Producer Information (Initial)');
    try {
      const infoResponse = await axios.get(`${BASE_URL}/users/producer/information`, { headers });
      console.log('✅ Retrieved producer information:', infoResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ No producer information found, this is expected for new accounts');
      } else {
        throw error;
      }
    }

    console.log('✏️ Step 4: Update Producer Information');
    const informationUpdate = {
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33123456789',
      businessName: 'Ferme Bio Dupont',
      businessType: 'EARL',
      siretNumber: '12345678901234',
      vatNumber: 'FR12345678901',
      businessAddress: '123 Route de la Ferme\n12345 Village Bio\nFrance',
      farmName: 'Ferme du Bon Terroir',
      farmDescription: 'Exploitation familiale en agriculture biologique depuis 3 générations. Nous cultivons des légumes de saison et élevons des poules pondeuses.',
      farmSize: '15 hectares',
      productionMethods: ['Agriculture biologique', 'Permaculture'],
      certifications: ['AB', 'Demeter'],
      contactHours: '8h-12h / 14h-18h',
      websiteUrl: 'https://ferme-dupont.com',
      socialMedia: {
        facebook: 'https://facebook.com/ferme-dupont',
        instagram: '@ferme_dupont',
        twitter: '@ferme_dupont'
      }
    };

    const updateResponse = await axios.put(`${BASE_URL}/users/producer/information`, informationUpdate, { headers });
    console.log('✅ Producer information updated successfully:', updateResponse.data);

    console.log('🔍 Step 5: Verify Updated Information');
    const verifyResponse = await axios.get(`${BASE_URL}/users/producer/information`, { headers });
    console.log('✅ Verified updated information:', verifyResponse.data);

    console.log('\n🎉 Producer Information Management Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testProducerInformation();
