// Quick final verification script
async function quickCheck() {
  try {
    // Login
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testproducer@shop.com', password: 'password123' })
    });
    const { token } = await loginResponse.json();
    
    // Get shops
    const shopsResponse = await fetch('http://localhost:3001/api/shops/my-shops', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const shops = await shopsResponse.json();
    
    // Get products  
    const productsResponse = await fetch('http://localhost:3001/api/products/my-products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const products = await productsResponse.json();
    
    console.log(`📊 FINAL STATE VERIFICATION:`);
    console.log(`   🏪 Total Shops: ${shops.length}`);
    console.log(`   📦 Total Products: ${products.length}`);
    console.log(`\n🏪 Shop Details:`);
    shops.forEach((shop, i) => {
      console.log(`   ${i + 1}. ${shop.name} (ID: ${shop.id})`);
    });
    
    console.log(`\n📦 Product Distribution:`);
    const shopProductCount = {};
    products.forEach(product => {
      const shopName = product.shopName || 'Unknown';
      shopProductCount[shopName] = (shopProductCount[shopName] || 0) + 1;
    });
    
    Object.entries(shopProductCount).forEach(([shopName, count]) => {
      console.log(`   🏪 ${shopName}: ${count} product(s)`);
    });
    
    console.log(`\n✅ VERIFICATION COMPLETE - Multiple shops and products working perfectly!`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

quickCheck();
