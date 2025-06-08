import * as producerController from './src/controllers/producer.controller';

console.log('All exports from producer controller:');
console.log(Object.keys(producerController));

console.log('\nChecking specific exports:');
console.log('getProducerInformation:', typeof producerController.getProducerInformation);
console.log('updateProducerInformation:', typeof producerController.updateProducerInformation);
