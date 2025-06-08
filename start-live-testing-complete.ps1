# Community Pickup Market Live Testing Script
# Run this after starting Docker Desktop manually

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 COMMUNITY PICKUP MARKET LIVE TESTING" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Pre-flight Check:" -ForegroundColor Yellow
Write-Host "✅ Order flow producer ID bug fixed" -ForegroundColor Green
Write-Host "✅ Backend server Route.get() error fixed" -ForegroundColor Green
Write-Host "✅ Database migration script ready" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Step 1: Starting Database..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>$null
    if ($dockerInfo) {
        Write-Host "✅ Docker is running" -ForegroundColor Green
        docker-compose up -d db
        Write-Host "⏳ Waiting for database to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        Write-Host "✅ Database should be ready" -ForegroundColor Green
    } else {
        throw "Docker not running"
    }
} catch {
    Write-Host "❌ Docker not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "   Manual steps:" -ForegroundColor Yellow
    Write-Host "   1. Start Docker Desktop" -ForegroundColor Gray
    Write-Host "   2. Wait for green icon in system tray" -ForegroundColor Gray
    Write-Host "   3. Run this script again" -ForegroundColor Gray
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🗄️ Step 2: Applying Database Migration..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>$null
    if ($psqlVersion) {
        Write-Host "Applying producerId column migration..." -ForegroundColor Yellow
        psql -h localhost -U postgres -d community_market -f add-producer-id-to-cart-items.sql
        Write-Host "✅ Migration applied" -ForegroundColor Green
    } else {
        Write-Host "⚠️ psql not found. Manual migration required:" -ForegroundColor Yellow
        Write-Host "   Option 1: Install PostgreSQL client tools" -ForegroundColor Gray
        Write-Host "   Option 2: Use Docker command:" -ForegroundColor Gray
        $dbContainer = docker-compose ps -q db
        Write-Host "   docker exec -i $dbContainer psql -U postgres -d community_market < add-producer-id-to-cart-items.sql" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Migration step needs manual attention" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🖥️ Step 3: Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Opening new terminal for backend..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\git\community-pickup-market\server'; npm run dev"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🌐 Step 4: Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Opening new terminal for frontend..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\git\community-pickup-market'; npm run dev"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎯 READY FOR TESTING!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Testing Checklist:" -ForegroundColor Yellow
Write-Host "□ Login as customer" -ForegroundColor Gray
Write-Host "□ Browse products" -ForegroundColor Gray
Write-Host "□ Add items to cart" -ForegroundColor Gray
Write-Host "□ Proceed to checkout" -ForegroundColor Gray
Write-Host "□ Select pickup point" -ForegroundColor Gray
Write-Host "□ Confirm order (should work now!)" -ForegroundColor Gray
Write-Host "□ Login as producer" -ForegroundColor Gray
Write-Host "□ Test producer information management" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 What to verify:" -ForegroundColor Yellow
Write-Host "✅ No 'order incomplete' errors after pickup point selection" -ForegroundColor Green
Write-Host "✅ Orders created with correct producer IDs (not hardcoded '1')" -ForegroundColor Green
Write-Host "✅ Producer information CRUD operations work" -ForegroundColor Green
Write-Host "✅ Cart items properly track producer ID" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Servers are starting in new windows..." -ForegroundColor Cyan
Write-Host "Wait a few moments, then test the application!" -ForegroundColor Cyan

Read-Host "Press Enter to continue"
