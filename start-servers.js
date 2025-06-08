const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Community Pickup Market Development Environment...');

// Function to start a process
function startProcess(command, args, cwd, name) {
    return new Promise((resolve, reject) => {
        console.log(`Starting ${name}...`);
        
        const process = spawn(command, args, {
            cwd: cwd,
            stdio: 'inherit',
            shell: true
        });

        process.on('error', (error) => {
            console.error(`Error starting ${name}:`, error);
            reject(error);
        });

        // For dev servers, we don't wait for them to exit
        setTimeout(() => {
            console.log(`${name} should be starting...`);
            resolve(process);
        }, 2000);
    });
}

async function startServers() {
    try {
        // Start backend first
        const backendProcess = await startProcess(
            'npm', 
            ['run', 'dev'], 
            path.join(__dirname, 'server'),
            'Backend Server'
        );

        // Wait a bit for backend to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Start frontend
        const frontendProcess = await startProcess(
            'npm', 
            ['run', 'dev'], 
            __dirname,
            'Frontend Server'
        );

        console.log('Both servers should be starting...');
        console.log('Backend: http://localhost:3001');
        console.log('Frontend: http://localhost:5173');

        // Keep the script running
        process.stdin.resume();

    } catch (error) {
        console.error('Failed to start servers:', error);
        process.exit(1);
    }
}

startServers();
