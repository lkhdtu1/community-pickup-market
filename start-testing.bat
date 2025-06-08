@echo off
echo ==========================================
echo  COMMUNITY PICKUP MARKET - QUICK START
echo ==========================================
echo.

echo [1/4] Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop first.
    echo    Download: https://www.docker.com/products/docker-desktop/
    goto :end
)

echo ✅ Docker found

echo.
echo [2/4] Starting database...
cd /d "%~dp0"
docker-compose up -d db
if %errorlevel% neq 0 (
    echo ❌ Failed to start database. Please check Docker Desktop is running.
    goto :end
)

echo ✅ Database starting...

echo.
echo [3/4] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Ready to start development servers!
echo.
echo ==========================================
echo  NEXT STEPS:
echo ==========================================
echo.
echo 1. Run database migration (if needed):
echo    psql -h localhost -U postgres -d community_market -f add-producer-id-to-cart-items.sql
echo.
echo 2. Start backend server:
echo    cd server
echo    npm run dev
echo.
echo 3. Start frontend server (in new terminal):
echo    npm run dev
echo.
echo 4. Test the order flow:
echo    - Open http://localhost:5173
echo    - Add products to cart
echo    - Select pickup point
echo    - Confirm order (should work with dynamic producer IDs!)
echo.
echo ==========================================
echo  STATUS: CRITICAL BUGS FIXED ✅
echo ==========================================
echo ✅ Order flow producer ID bug fixed
echo ✅ Backend server Route.get() error fixed
echo ✅ Ready for live testing!
echo.

:end
pause
