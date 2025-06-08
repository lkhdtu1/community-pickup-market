# Manual Steps for Live Testing
# Since some tools need manual intervention

## STEP 1: Start Docker Desktop
1. **Manually start Docker Desktop**:
   - Click Windows Start button
   - Search for "Docker Desktop"
   - Click to open and wait for green icon in system tray

## STEP 2: Start Database
```powershell
# Run in PowerShell:
cd d:\git\community-pickup-market
docker-compose up -d db
```

## STEP 3: Apply Database Migration (Choose one method)

### Method A: If you have PostgreSQL client installed
```powershell
psql -h localhost -U postgres -d community_market -f add-producer-id-to-cart-items.sql
```

### Method B: Using Docker (if psql not available)
```powershell
# Get the database container ID
$dbContainer = docker-compose ps -q db

# Copy migration file into container and execute
docker cp add-producer-id-to-cart-items.sql "${dbContainer}:/tmp/migration.sql"
docker exec $dbContainer psql -U postgres -d community_market -f /tmp/migration.sql
```

### Method C: Manual SQL execution
```powershell
# Connect to database container
docker exec -it $(docker-compose ps -q db) psql -U postgres -d community_market

# Then paste this SQL:
ALTER TABLE cart_items ADD COLUMN "producerId" varchar;
UPDATE cart_items SET "producerId" = 'unknown' WHERE "producerId" IS NULL;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'cart_items' ORDER BY ordinal_position;
\q
```

## STEP 4: Start Backend Server
```powershell
# In new PowerShell window:
cd d:\git\community-pickup-market\server
npm run dev
```

## STEP 5: Start Frontend Server
```powershell
# In another new PowerShell window:
cd d:\git\community-pickup-market
npm run dev
```

## STEP 6: Test the Application
1. Open http://localhost:5173
2. Login as customer
3. Add products to cart
4. Proceed to checkout
5. Select pickup point
6. **Confirm order - should work now!**

## STEP 7: Test Producer Information Management
1. Login as producer
2. Navigate to producer dashboard
3. Test information update features

## What Was Fixed ✅
- **Order Creation**: Now uses dynamic producer IDs instead of hardcoded '1'
- **Backend Routes**: Producer information routes restored and working
- **Cart Items**: Properly track producer ID for each item
- **Database Schema**: Migration ready for producerId column

## Verification
Run this to test the backend when it's running:
```powershell
node test-live-order-fix.cjs
```
