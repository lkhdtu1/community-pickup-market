# Order Flow Fix - Manual Testing Checklist

## Prerequisites

- [ ] Docker Desktop is running
- [ ] Database migration completed (producerId column added to cart_items)
- [ ] Backend server running on http://localhost:3001
- [ ] Frontend server running on http://localhost:3000

## Critical Test: Multi-Producer Order (The Main Fix)

### Setup
1. [ ] Navigate to http://localhost:3000
2. [ ] Login or register as a customer
3. [ ] Clear cart if not empty

### Test Steps
1. [ ] Add products from Producer A to cart
2. [ ] Add products from Producer B to cart  
3. [ ] Add products from Producer C to cart (if available)
4. [ ] View cart - verify items from multiple producers
5. [ ] Click "Proceed to Checkout"
6. [ ] Select a pickup point
7. [ ] Click "Confirm Order"

### Expected Results ✅
- [ ] Multiple orders created (one per producer)
- [ ] Each order contains only items from that producer
- [ ] No "order incomplete after choosing pickup point" error
- [ ] Confirmation shows all created orders
- [ ] All producer IDs are real (not hardcoded "1")

## Single Producer Order Test

### Test Steps
1. [ ] Clear cart
2. [ ] Add 2-3 products from SAME producer
3. [ ] Proceed to checkout
4. [ ] Select pickup point
5. [ ] Confirm order

### Expected Results ✅
- [ ] Single order created successfully
- [ ] All items included in one order
- [ ] Producer information correct

## Cart Synchronization Test

### Test Steps
1. [ ] Add products to cart
2. [ ] Refresh page
3. [ ] Log out and log back in
4. [ ] Check cart contents

### Expected Results ✅
- [ ] Cart items persist after refresh
- [ ] Cart items persist after login/logout
- [ ] Producer information maintained

## Database Verification

After testing, check database:
```sql
-- Verify cart items have producer IDs
SELECT productName, producer, producerId FROM cart_items LIMIT 5;

-- Verify orders have correct producer associations  
SELECT id, total, producerId FROM orders ORDER BY createdAt DESC LIMIT 5;

-- Confirm no hardcoded "1" producer IDs
SELECT COUNT(*) FROM orders WHERE producerId = '1';
```

## Success Criteria

- [ ] ✅ Multi-producer orders work correctly
- [ ] ✅ No "order incomplete" errors after pickup point selection
- [ ] ✅ Cart maintains producer associations
- [ ] ✅ Database shows real producer IDs (not "1")

---

**🎉 If all tests pass, the critical issue has been resolved!**
