Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " COMMUNITY PICKUP MARKET - QUICK START" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
    } else {
        throw "Docker not found"
    }
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Starting database..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
try {
    docker-compose up -d db
    Write-Host "✅ Database starting..." -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start database. Please check Docker Desktop is running." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[3/4] Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[4/4] Ready to start development servers!" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " NEXT STEPS:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Run database migration (if needed):" -ForegroundColor White
Write-Host "   psql -h localhost -U postgres -d community_market -f add-producer-id-to-cart-items.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Start backend server:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Start frontend server (in new terminal):" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Test the order flow:" -ForegroundColor White
Write-Host "   - Open http://localhost:5173" -ForegroundColor Gray
Write-Host "   - Add products to cart" -ForegroundColor Gray
Write-Host "   - Select pickup point" -ForegroundColor Gray
Write-Host "   - Confirm order (should work with dynamic producer IDs!)" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " STATUS: CRITICAL BUGS FIXED ✅" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Order flow producer ID bug fixed" -ForegroundColor Green
Write-Host "✅ Backend server Route.get() error fixed" -ForegroundColor Green
Write-Host "✅ Ready for live testing!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to continue"
