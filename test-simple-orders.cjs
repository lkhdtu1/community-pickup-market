#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testSimpleOrder() {
  console.log('🔍 Testing Simple Order Query');
  
  try {
    // Register producer
    const producerData = {
      email: `simple-producer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'producer',
      profileData: {
        shopName: 'Simple Farm',
        description: 'Simple farm',
        address: '123 Simple St'
      }
    };

    const producerRegResponse = await axios.post(`${API_BASE}/auth/register`, producerData);
    const producerToken = producerRegResponse.data.token;
    console.log('✅ Producer registered');

    // Register customer  
    const customerData = {
      email: `simple-customer-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'customer',
      profileData: {
        firstName: 'Simple',
        lastName: 'Customer',
        phone: '555-1234',
        address: '789 Simple Ave'
      }
    };

    const customerRegResponse = await axios.post(`${API_BASE}/auth/register`, customerData);
    const customerToken = customerRegResponse.data.token;
    console.log('✅ Customer registered');

    // Test just the customer profile endpoint first
    console.log('\n🔍 Testing customer profile...');
    try {
      const customerProfileResponse = await axios({
        method: 'GET',
        url: `${API_BASE}/users/customer/profile`,
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      console.log('✅ Customer profile works');
    } catch (error) {
      console.log('❌ Customer profile failed:', error.response?.data?.message || error.message);
    }

    // Test just the producer profile endpoint
    console.log('\n🔍 Testing producer profile...');  
    try {
      const producerProfileResponse = await axios({
        method: 'GET',
        url: `${API_BASE}/users/producer/profile`,
        headers: { 'Authorization': `Bearer ${producerToken}` }
      });
      console.log('✅ Producer profile works');
    } catch (error) {
      console.log('❌ Producer profile failed:', error.response?.data?.message || error.message);
    }

    // Test the orders endpoints without any orders first
    console.log('\n🔍 Testing customer orders (empty)...');
    try {
      const customerOrdersResponse = await axios({
        method: 'GET',
        url: `${API_BASE}/orders/customer`,
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      console.log('✅ Customer orders endpoint works (empty):', customerOrdersResponse.data.length, 'orders');
    } catch (error) {
      console.log('❌ Customer orders failed (empty):', error.response?.data?.message || error.message);
      console.log('Full error:', error.response?.data);
    }

    console.log('\n🔍 Testing producer orders (empty)...');
    try {
      const producerOrdersResponse = await axios({
        method: 'GET',
        url: `${API_BASE}/orders/producer`,
        headers: { 'Authorization': `Bearer ${producerToken}` }
      });
      console.log('✅ Producer orders endpoint works (empty):', producerOrdersResponse.data.length, 'orders');
    } catch (error) {
      console.log('❌ Producer orders failed (empty):', error.response?.data?.message || error.message);
      console.log('Full error:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testSimpleOrder().catch(console.error);
