echo "=========================================="
echo "🚀 STARTING LIVE TESTING PROCESS"
echo "=========================================="
echo ""

echo "Step 1: Starting Docker Desktop manually..."
echo "Please click the Windows Start button and search for 'Docker Desktop'"
echo "Or press Win+R and run: %ProgramFiles%\Docker\Docker\Docker Desktop.exe"
echo ""
echo "Wait for Docker Desktop to show a green whale icon in your system tray"
echo ""
echo "Once Docker is running, continue with Step 2..."
echo ""

pause

echo "Step 2: Starting database..."
docker-compose up -d db

echo ""
echo "Step 3: Waiting for database to be ready..."
timeout /t 20 /nobreak

echo ""
echo "Step 4: Applying database migration..."
for /f %%i in ('docker-compose ps -q db') do set DB_CONTAINER=%%i
echo Database container: %DB_CONTAINER%

docker cp add-producer-id-to-cart-items.sql %DB_CONTAINER%:/tmp/migration.sql
docker exec %DB_CONTAINER% psql -U postgres -d community_market -f /tmp/migration.sql

echo ""
echo "Step 5: Starting development servers..."
echo "Opening backend server in new window..."
start powershell -Command "cd '%~dp0server'; npm run dev; pause"

echo "Waiting 10 seconds for backend to start..."
timeout /t 10 /nobreak

echo "Opening frontend server in new window..."
start powershell -Command "cd '%~dp0'; npm run dev; pause"

echo ""
echo "=========================================="
echo "🎯 READY FOR TESTING!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3001"
echo ""
echo "Test the order flow:"
echo "1. Browse products"
echo "2. Add to cart"
echo "3. Select pickup point"
echo "4. Confirm order (should work now!)"
echo ""

pause
