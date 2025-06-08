// Test which producer controller functions are exported
const { execSync } = require('child_process');

try {
  // First, let's compile the TypeScript to JavaScript and check
  const result = execSync('npx tsc --noEmit --project . --allowJs --checkJs false --skipLibCheck', { 
    cwd: 'd:\\git\\community-pickup-market\\server',
    encoding: 'utf8'
  });
  console.log('TypeScript compilation successful');
} catch (error) {
  console.log('TypeScript compilation error:', error.message);
}

// Try to require and check the exports
try {
  const fs = require('fs');
  const path = require('path');
  
  // Read the file content
  const filePath = 'd:\\git\\community-pickup-market\\server\\src\\controllers\\producer.controller.ts';
  const content = fs.readFileSync(filePath, 'utf8');
    // Look for export statements
  const exportMatches = content.match(/export\s+const\s+\w+/g);
  console.log('Found exports:', exportMatches);
  
  // Check specifically for our functions
  const hasGetProducerInformation = content.includes('export const getProducerInformation');
  const hasUpdateProducerInformation = content.includes('export const updateProducerInformation');
  
  console.log('getProducerInformation exported:', hasGetProducerInformation);
  console.log('updateProducerInformation exported:', hasUpdateProducerInformation);
  
  // Find all occurrences of these function names
  const getInfoMatches = content.match(/getProducerInformation/g);
  const updateInfoMatches = content.match(/updateProducerInformation/g);
  
  console.log('getProducerInformation occurrences:', getInfoMatches ? getInfoMatches.length : 0);
  console.log('updateProducerInformation occurrences:', updateInfoMatches ? updateInfoMatches.length : 0);
  
  // Show the specific lines containing these functions
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('getProducerInformation') || line.includes('updateProducerInformation')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
  
} catch (error) {
  console.log('Error reading file:', error.message);
}
