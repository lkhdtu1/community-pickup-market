const fs = require('fs');
const path = require('path');

console.log('Testing producer controller imports...');

try {
  // Check if file exists and has content
  const filePath = path.join(__dirname, 'src', 'controllers', 'producer.controller.ts');
  console.log('File path:', filePath);
  
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('File size:', content.length, 'bytes');
  console.log('First 200 characters:', content.substring(0, 200));
  
  // Try to require the compiled version
  console.log('\nAttempting to import...');
  
  // Since we're using ts-node-dev, try to import the TS file directly
  delete require.cache[require.resolve('./src/controllers/producer.controller.ts')];
  const producerController = require('./src/controllers/producer.controller.ts');
  
  console.log('Import successful!');
  console.log('Available exports:', Object.keys(producerController));
  console.log('getAllProducers type:', typeof producerController.getAllProducers);
  console.log('getProducerPublicProfile type:', typeof producerController.getProducerPublicProfile);
  
} catch (error) {
  console.error('Import failed:', error.message);
  console.error('Stack:', error.stack);
}
