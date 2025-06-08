#!/usr/bin/env pwsh

Write-Host "🚀 Starting Community Pickup Market Application..." -ForegroundColor Green

# Change to the project directory
Set-Location "d:\git\community-pickup-market"

Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Blue

# Start backend server in background
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\git\community-pickup-market\server'; npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in background
Write-Host "🎨 Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\git\community-pickup-market'; npm run dev" -WindowStyle Normal

# Wait a moment for frontend to start
Start-Sleep -Seconds 5

Write-Host "✅ Both servers should be starting..." -ForegroundColor Green
Write-Host "🌐 Backend should be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Frontend should be available at: http://localhost:3003" -ForegroundColor Cyan

# Test API connectivity
Write-Host "🔍 Testing API connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/producers" -TimeoutSec 10
    Write-Host "✅ Backend API is responding!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend API not yet available. May still be starting..." -ForegroundColor Yellow
}

Write-Host "🎯 Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:3003"

Write-Host "✨ Application startup complete!" -ForegroundColor Green
Write-Host "📝 Check the browser windows that opened to see if the application loads properly." -ForegroundColor White
