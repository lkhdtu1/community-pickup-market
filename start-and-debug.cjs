const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

async function checkServerStatus(url, name) {
    try {
        const response = await fetch(url, { timeout: 5000 });
        if (response.ok) {
            console.log(`✅ ${name} is running and responding`);
            return true;
        } else {
            console.log(`❌ ${name} responded with status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${name} is not responding: ${error.message}`);
        return false;
    }
}

async function testAPIEndpoints() {
    console.log('\n🔍 Testing API endpoints...');
    
    const endpoints = [
        { name: 'Health Check', url: 'http://localhost:3001/health' },
        { name: 'Products API', url: 'http://localhost:3001/api/products' },
        { name: 'Producers API', url: 'http://localhost:3001/api/producers' },
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, { timeout: 5000 });
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint.name}: OK`);
                if (endpoint.name === 'Products API' && data.products) {
                    console.log(`   📦 Found ${data.products.length} products`);
                }
                if (endpoint.name === 'Producers API' && data.producers) {
                    console.log(`   👨‍🌾 Found ${data.producers.length} producers`);
                }
            } else {
                console.log(`❌ ${endpoint.name}: HTTP ${response.status}`);
                const text = await response.text();
                console.log(`   Error: ${text.substring(0, 200)}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
    }
}

async function startServers() {
    console.log('🚀 Starting Community Pickup Market servers...\n');
    
    // Kill any existing processes on the ports
    console.log('🧹 Cleaning up existing processes...');
    try {
        spawn('powershell', ['-Command', 'Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force'], { stdio: 'inherit' });
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        console.log('No existing Node processes to kill');
    }
    
    console.log('\n🔧 Starting backend server...');
    const backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, 'server'),
        stdio: 'pipe',
        shell: true
    });
    
    let backendReady = false;
    backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Backend:', output.trim());
        if (output.includes('Server is running on port') || output.includes('Database connected')) {
            backendReady = true;
        }
    });
    
    backendProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('Backend Error:', error.trim());
    });
    
    // Wait for backend to be ready
    console.log('⏳ Waiting for backend to be ready...');
    let attempts = 0;
    while (!backendReady && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        if (attempts % 5 === 0) {
            const isRunning = await checkServerStatus('http://localhost:3001/health', 'Backend');
            if (isRunning) {
                backendReady = true;
                break;
            }
        }
    }
    
    if (!backendReady) {
        console.log('❌ Backend failed to start properly');
        return false;
    }
    
    console.log('\n🎨 Starting frontend server...');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'pipe',
        shell: true
    });
    
    let frontendReady = false;
    frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Frontend:', output.trim());
        if (output.includes('Local:') || output.includes('localhost:3003')) {
            frontendReady = true;
        }
    });
    
    frontendProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('Frontend Error:', error.trim());
    });
    
    // Wait for frontend to be ready
    console.log('⏳ Waiting for frontend to be ready...');
    attempts = 0;
    while (!frontendReady && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        if (attempts % 5 === 0) {
            console.log(`⏳ Still waiting for frontend... (${attempts}/30)`);
        }
    }
    
    // Test API endpoints
    await new Promise(resolve => setTimeout(resolve, 3000));
    await testAPIEndpoints();
    
    console.log('\n✅ Servers should be running!');
    console.log('🌐 Backend: http://localhost:3001');
    console.log('🌐 Frontend: http://localhost:3003');
    
    return true;
}

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    process.exit(0);
});

startServers().catch(console.error);
