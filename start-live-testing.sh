#!/bin/bash
# Live Testing Script for Community Pickup Market
# Run this after starting Docker Desktop manually

echo "=========================================="
echo "🚀 COMMUNITY PICKUP MARKET LIVE TESTING"
echo "=========================================="
echo ""

echo "📋 Pre-flight Check:"
echo "✅ Order flow producer ID bug fixed"
echo "✅ Backend server Route.get() error fixed"
echo "✅ Database migration script ready"
echo ""

echo "🔧 Step 1: Starting Database..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running"
    docker-compose up -d db
    echo "⏳ Waiting for database to start..."
    sleep 15
    echo "✅ Database should be ready"
else
    echo "❌ Docker not running. Please start Docker Desktop first."
    echo "   Manual steps:"
    echo "   1. Start Docker Desktop"
    echo "   2. Wait for green icon in system tray"
    echo "   3. Run this script again"
    exit 1
fi

echo ""
echo "🗄️ Step 2: Applying Database Migration..."
if command -v psql > /dev/null 2>&1; then
    echo "Applying producerId column migration..."
    psql -h localhost -U postgres -d community_market -f add-producer-id-to-cart-items.sql
    echo "✅ Migration applied"
else
    echo "⚠️ psql not found. Manual migration required:"
    echo "   Install PostgreSQL client tools or use Docker:"
    echo "   docker exec -i \$(docker-compose ps -q db) psql -U postgres -d community_market < add-producer-id-to-cart-items.sql"
fi

echo ""
echo "🖥️ Step 3: Starting Backend Server..."
echo "Opening new terminal for backend..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

sleep 5

echo ""
echo "🌐 Step 4: Starting Frontend Server..."
echo "Opening new terminal for frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "🎯 READY FOR TESTING!"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "📝 Testing Checklist:"
echo "□ Login as customer"
echo "□ Browse products"
echo "□ Add items to cart"
echo "□ Proceed to checkout"
echo "□ Select pickup point"
echo "□ Confirm order (should work now!)"
echo "□ Login as producer"
echo "□ Test producer information management"
echo ""
echo "🔍 What to verify:"
echo "✅ No 'order incomplete' errors after pickup point selection"
echo "✅ Orders created with correct producer IDs (not hardcoded '1')"
echo "✅ Producer information CRUD operations work"
echo "✅ Cart items properly track producer ID"
echo ""
echo "Press Ctrl+C to stop all servers"
wait
