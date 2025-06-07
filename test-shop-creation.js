// Test script for shop creation workflow
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testShopCreation() {
  try {
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'testproducer@shop.com',
      password: 'password123'
    });
    
    const { token, user } = loginResponse.data;
    console.log('✅ Login successful:', user.email, 'Role:', user.role);
    
    console.log('\n2. Testing shop creation...');
    const shopData = {
      name: 'Ferme Bio Test',
      description: 'Une ferme de test pour vérifier le système',
      address: '123 Route de la Ferme, Test Village',
      phone: '+33 1 23 45 67 89',
      email: 'contact@ferme-test.com',
      specialties: ['Légumes bio', 'Fruits de saison'],
      images: [],
      certifications: [],
      pickupInfo: {
        location: '123 Route de la Ferme, Test Village',
        hours: 'Lun-Ven: 9h-18h',
        instructions: 'Contactez-nous pour organiser la récupération'
      }
    };
    
    const shopResponse = await axios.post(`${API_URL}/shops`, shopData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Shop created successfully:', shopResponse.data);
    
    console.log('\n3. Testing get my shops...');
    const myShopsResponse = await axios.get(`${API_URL}/shops/my-shops`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ My shops:', myShopsResponse.data);
    
    console.log('\n4. Testing create second shop...');
    const shopData2 = {
      name: 'Ferme Bio Test 2',
      description: 'Une deuxième ferme de test',
      address: '456 Avenue du Producteur, Test City',
      phone: '+33 1 98 76 54 32',
      email: 'contact2@ferme-test.com',
      specialties: ['Miel', 'Fromages artisanaux'],
      images: [],
      certifications: [],
      pickupInfo: {
        location: '456 Avenue du Producteur, Test City',
        hours: 'Sam-Dim: 8h-14h',
        instructions: 'Marché du week-end'
      }
    };
    
    const shop2Response = await axios.post(`${API_URL}/shops`, shopData2, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Second shop created successfully:', shop2Response.data);
    
    console.log('\n5. Final check - get all my shops...');
    const finalShopsResponse = await axios.get(`${API_URL}/shops/my-shops`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Final shops count:', finalShopsResponse.data.length);
    console.log('Shops:', finalShopsResponse.data.map(shop => ({ id: shop.id, name: shop.name })));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testShopCreation();
