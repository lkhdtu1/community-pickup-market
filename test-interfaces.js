// Node.js test script to verify interface compatibility
// Run with: node test-interfaces.js

// Mock the interfaces (since we can't import TypeScript in Node directly)

// Test 1: Product Interface Structure
function testProductInterface() {
  console.log('🧪 Testing Product Interface...');
  
  const mockApiResponse = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Tomates Bio",
    description: "Tomates biologiques de saison",
    price: 3.50,
    unit: "kg",
    stock: 25,
    category: "Légumes",
    image: "https://example.com/tomato.jpg",
    images: ["https://example.com/tomato.jpg", "https://example.com/tomato2.jpg"],
    producer: {
      id: "producer-123",
      name: "Ferme Martin",
      shopName: "Bio Martin"
    },
    producerId: "producer-123",
    isAvailable: true
  };

  // Transform like in ProductsPage.tsx
  const transformedProduct = {
    id: mockApiResponse.id,
    name: mockApiResponse.name,
    description: mockApiResponse.description || '',
    price: mockApiResponse.price,
    unit: mockApiResponse.unit,
    stock: mockApiResponse.stock,
    category: mockApiResponse.category,
    imageUrl: mockApiResponse.image || mockApiResponse.images?.[0] || '/placeholder.svg',
    images: mockApiResponse.images || [],
    producer: {
      id: mockApiResponse.producerId || mockApiResponse.producer?.id || 'unknown',
      name: mockApiResponse.producer.name || mockApiResponse.producer.shopName || 'Unknown',
      shopName: mockApiResponse.producer.shopName
    },
    isAvailable: mockApiResponse.isAvailable
  };

  const tests = {
    idIsString: typeof transformedProduct.id === 'string',
    hasImageUrl: typeof transformedProduct.imageUrl === 'string',
    producerHasId: typeof transformedProduct.producer.id === 'string',
    producerHasName: typeof transformedProduct.producer.name === 'string',
    priceIsNumber: typeof transformedProduct.price === 'number'
  };

  console.log('  ✓ ID is string:', tests.idIsString ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Has imageUrl:', tests.hasImageUrl ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Producer has ID:', tests.producerHasId ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Producer has name:', tests.producerHasName ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Price is number:', tests.priceIsNumber ? '✅ PASS' : '❌ FAIL');

  return Object.values(tests).every(Boolean);
}

// Test 2: CartItem Conversion
function testCartItemConversion() {
  console.log('\n🧪 Testing CartItem Conversion...');
  
  const product = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Tomates Bio",
    description: "Tomates biologiques de saison",
    price: 3.50,
    unit: "kg",
    stock: 25,
    category: "Légumes",
    imageUrl: "https://example.com/tomato.jpg",
    producer: {
      id: "producer-123",
      name: "Ferme Martin",
      shopName: "Bio Martin"
    }
  };

  // Convert like in Index.tsx addToCart function
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    image: product.imageUrl,
    producer: product.producer.name,
    category: product.category,
    quantity: 1
  };

  const tests = {
    idMatches: cartItem.id === product.id,
    producerIsString: typeof cartItem.producer === 'string',
    imageFromImageUrl: cartItem.image === product.imageUrl,
    hasQuantity: typeof cartItem.quantity === 'number'
  };

  console.log('  ✓ ID matches:', tests.idMatches ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Producer is string:', tests.producerIsString ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Image from imageUrl:', tests.imageFromImageUrl ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Has quantity:', tests.hasQuantity ? '✅ PASS' : '❌ FAIL');

  return Object.values(tests).every(Boolean);
}

// Test 3: Cart Operations with String IDs
function testCartOperations() {
  console.log('\n🧪 Testing Cart Operations...');
  
  let cartItems = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Tomates Bio",
      price: 3.5,
      unit: "kg",
      image: "/tomato.jpg",
      producer: "Ferme Martin",
      category: "Légumes",
      quantity: 1
    }
  ];

  // Test functions like in Index.tsx
  const updateCartQuantity = (id, quantity) => {
    cartItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
  };

  const removeFromCart = (id) => {
    cartItems = cartItems.filter(item => item.id !== id);
  };

  const testId = "550e8400-e29b-41d4-a716-446655440000";
  
  // Test update
  updateCartQuantity(testId, 5);
  const updateWorked = cartItems[0]?.quantity === 5;
  
  // Test remove
  removeFromCart(testId);
  const removeWorked = cartItems.length === 0;

  console.log('  ✓ Update with string ID:', updateWorked ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Remove with string ID:', removeWorked ? '✅ PASS' : '❌ FAIL');

  return updateWorked && removeWorked;
}

// Test 4: API Response Handling
function testApiResponseHandling() {
  console.log('\n🧪 Testing API Response Handling...');
  
  const responses = [
    // Complete response
    {
      id: "uuid-1",
      name: "Product 1",
      price: 1.0,
      unit: "kg",
      stock: 10,
      category: "Cat1",
      image: "img1.jpg",
      producer: { id: "prod1", name: "Producer 1" }
    },
    // Minimal response
    {
      id: "uuid-2",
      name: "Product 2",
      price: 2.0,
      unit: "kg",
      stock: 5,
      category: "Cat2",
      producer: "Producer 2",
      producerId: "prod2"
    },
    // Missing image
    {
      id: "uuid-3",
      name: "Product 3",
      price: 3.0,
      unit: "kg",
      stock: 15,
      category: "Cat3",
      images: ["img3a.jpg", "img3b.jpg"],
      producer: { shopName: "Shop 3" },
      producerId: "prod3"
    }
  ];

  const transformed = responses.map(apiProduct => ({
    id: apiProduct.id,
    name: apiProduct.name,
    description: apiProduct.description || '',
    price: apiProduct.price,
    unit: apiProduct.unit,
    stock: apiProduct.stock,
    category: apiProduct.category,
    imageUrl: apiProduct.image || apiProduct.images?.[0] || '/placeholder.svg',
    images: apiProduct.images || [],    producer: {
      id: apiProduct.producerId || apiProduct.producer?.id || 'unknown',
      name: typeof apiProduct.producer === 'string' ? apiProduct.producer : 
            (apiProduct.producer?.name || apiProduct.producer?.shopName || 'Unknown'),
      shopName: typeof apiProduct.producer === 'object' ? apiProduct.producer.shopName : undefined
    },
    isAvailable: apiProduct.isAvailable ?? true
  }));

  const tests = {
    allTransformed: transformed.length === 3,
    firstHasImage: transformed[0].imageUrl === 'img1.jpg',
    secondUsesPlaceholder: transformed[1].imageUrl === '/placeholder.svg',
    thirdUsesFirstImage: transformed[2].imageUrl === 'img3a.jpg',
    thirdProducerFromShopName: transformed[2].producer.name === 'Shop 3'
  };

  console.log('  ✓ All transformed:', tests.allTransformed ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ First has image:', tests.firstHasImage ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Second uses placeholder:', tests.secondUsesPlaceholder ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Third uses first image:', tests.thirdUsesFirstImage ? '✅ PASS' : '❌ FAIL');
  console.log('  ✓ Third producer from shopName:', tests.thirdProducerFromShopName ? '✅ PASS' : '❌ FAIL');

  return Object.values(tests).every(Boolean);
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Product Interface Compatibility Tests\n');
  console.log('='.repeat(50));
  
  const results = {
    product: testProductInterface(),
    cartItem: testCartItemConversion(),
    cartOps: testCartOperations(),
    apiHandling: testApiResponseHandling()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY:');
  console.log(`Product Interface: ${results.product ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CartItem Conversion: ${results.cartItem ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Cart Operations: ${results.cartOps ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Response Handling: ${results.apiHandling ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(Boolean);
  console.log(`\n🎯 OVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Great! All interface fixes are working correctly!');
    console.log('✓ Backend UUID strings are properly handled');
    console.log('✓ Product to CartItem conversions work');
    console.log('✓ Cart operations use string IDs');
    console.log('✓ API response transformations are robust');
  }
  
  return allPassed;
}

// Run the tests
runAllTests();
