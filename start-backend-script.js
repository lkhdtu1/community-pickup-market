const { exec } = require('child_process');
const path = require('path');

console.log('🚀 STARTING BACKEND SERVER');
console.log('=========================\n');

const serverPath = path.join(__dirname, 'server');
console.log('Server directory:', serverPath);

// Check if server directory exists
const fs = require('fs');
if (!fs.existsSync(serverPath)) {
  console.log('❌ Server directory not found');
  process.exit(1);
}

console.log('📦 Installing dependencies...');
exec('npm install', { cwd: serverPath }, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ NPM install failed:', error.message);
    return;
  }
  
  console.log('✅ Dependencies installed');
  console.log('🚀 Starting development server...');
  
  const server = exec('npm run dev', { cwd: serverPath });
  
  server.stdout.on('data', (data) => {
    console.log('📡 Backend:', data.toString().trim());
  });
  
  server.stderr.on('data', (data) => {
    console.log('⚠️ Backend Error:', data.toString().trim());
  });
  
  server.on('close', (code) => {
    console.log(`❌ Backend server exited with code ${code}`);
  });
  
  // Check if server is running after 10 seconds
  setTimeout(async () => {
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:3001/api/health');
      console.log('✅ Backend server is running successfully!');
      console.log('🌐 Frontend: http://localhost:8080');
      console.log('🔧 Backend: http://localhost:3001');
      console.log('\n📋 You can now test the critical issues in your browser');
    } catch (error) {
      console.log('❌ Backend server failed to start properly');
      console.log('Error:', error.message);
    }
  }, 10000);
});
