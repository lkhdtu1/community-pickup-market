@echo off
REM Quick Setup Script for Community Pickup Market (Windows)
REM Run this after Docker Desktop is started

echo 🚀 Community Pickup Market - Quick Setup ^& Test
echo ==============================================

REM Step 1: Start Docker services
echo 📦 Starting Docker services...
docker-compose up -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Step 2: Run database migration
echo 🗄️ Running database migration...
docker-compose exec db psql -U postgres -d community_market -c "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS producerId VARCHAR(255);"

REM Step 3: Start backend server
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "cd server && npm install && npm run dev"

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 10 /nobreak >nul

REM Step 4: Start frontend server
echo 🎨 Starting frontend server...
start "Frontend Server" cmd /k "npm install && npm run dev"

REM Step 5: Run verification tests
echo 🧪 Running verification tests...
timeout /t 15 /nobreak >nul
node test-complete-order-flow-fix.cjs
node test-producer-id-fix.cjs

echo.
echo 🎉 Setup complete!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
echo Press any key to continue...
pause >nul
