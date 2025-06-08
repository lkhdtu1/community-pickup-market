@echo off
echo ==========================================
echo  DATABASE MIGRATION - Producer ID Fix
echo ==========================================
echo.

echo [1/3] Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not running. Please start Docker Desktop first.
    goto :end
)

echo ✅ Docker is running

echo.
echo [2/3] Starting database if not running...
docker-compose up -d db
echo ⏳ Waiting for database to be ready...
timeout /t 15 /nobreak >nul

echo.
echo [3/3] Applying migration...
echo Copying migration file to container...
docker cp add-producer-id-to-cart-items.sql %1:/tmp/migration.sql 2>nul

if %errorlevel% neq 0 (
    echo Getting database container ID...
    for /f %%i in ('docker-compose ps -q db') do set DB_CONTAINER=%%i
    if not defined DB_CONTAINER (
        echo ❌ Could not find database container
        goto :end
    )
    echo Found container: %DB_CONTAINER%
    docker cp add-producer-id-to-cart-items.sql %DB_CONTAINER%:/tmp/migration.sql
)

echo Executing migration...
for /f %%i in ('docker-compose ps -q db') do set DB_CONTAINER=%%i
docker exec %DB_CONTAINER% psql -U postgres -d community_market -f /tmp/migration.sql

if %errorlevel% equ 0 (
    echo ✅ Migration completed successfully!
    echo.
    echo Database is ready for testing.
    echo Next steps:
    echo 1. Start backend: cd server ^&^& npm run dev
    echo 2. Start frontend: npm run dev
    echo 3. Test order flow at http://localhost:5173
) else (
    echo ❌ Migration failed. Manual steps required:
    echo 1. docker exec -it %DB_CONTAINER% psql -U postgres -d community_market
    echo 2. Copy and paste the SQL from add-producer-id-to-cart-items.sql
)

:end
echo.
pause
