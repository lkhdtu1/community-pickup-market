#!/bin/bash
# Quick Setup Script for Community Pickup Market
# Run this after Docker Desktop is started

echo "🚀 Community Pickup Market - Quick Setup & Test"
echo "=============================================="

# Step 1: Start Docker services
echo "📦 Starting Docker services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Step 2: Run database migration
echo "🗄️ Running database migration..."
docker-compose exec db psql -U postgres -d community_market -c "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS producerId VARCHAR(255);"

# Step 3: Start backend server
echo "🔧 Starting backend server..."
cd server
npm install
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Step 4: Start frontend server
echo "🎨 Starting frontend server..."
cd ..
npm install
npm run dev &
FRONTEND_PID=$!

# Step 5: Run verification tests
echo "🧪 Running verification tests..."
sleep 10
node test-complete-order-flow-fix.cjs
node test-producer-id-fix.cjs

echo ""
echo "🎉 Setup complete!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "To stop servers:"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo "docker-compose down"
