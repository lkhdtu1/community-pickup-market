// Test to check if producer controller exports are working
const path = require('path');

console.log('Testing producer controller imports...');

try {
  // Try to require the producer controller using CommonJS
  const producerController = require('./src/controllers/producer.controller.ts');
  console.log('Producer controller required successfully');
  console.log('Available exports:', Object.keys(producerController));
  
  console.log('getProducerInformation:', typeof producerController.getProducerInformation);
  console.log('updateProducerInformation:', typeof producerController.updateProducerInformation);
  
} catch (error) {
  console.error('Error requiring producer controller:', error.message);
}
