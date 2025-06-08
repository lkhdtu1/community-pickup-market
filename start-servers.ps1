# PowerShell script to start both frontend and backend servers
Write-Host "Starting Community Pickup Market Development Environment..." -ForegroundColor Green

# Start backend server in a new PowerShell window
Start-Process powershell -ArgumentList "-Command", "cd 'd:\git\community-pickup-market\server'; Write-Host 'Starting Backend Server...' -ForegroundColor Yellow; npm run dev" -WindowStyle Normal

# Wait for backend to start
Start-Sleep 3

# Start frontend server in current window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
cd "d:\git\community-pickup-market"
npm run dev
