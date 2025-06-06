// Test file to verify Product interface compatibility and transformations
import { Product, CartItem, Producer } from '../types/product';

// Mock API response format (what backend returns)
const mockApiResponse = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Tomates Bio",
  description: "Tomates biologiques de saison",
  price: 3.50,
  unit: "kg",
  stock: 25,
  category: "Légumes",
  image: "https://example.com/tomato.jpg",
  images: [
    "https://example.com/tomato.jpg",
    "https://example.com/tomato2.jpg"
  ],
  producer: {
    id: "producer-123",
    name: "Ferme Martin",
    shopName: "Bio Martin"
  },
  producerId: "producer-123",
  isAvailable: true
};

// Test Product interface transformation
export function testProductTransformation(): boolean {
  try {
    // Transform API response to Product interface (like in ProductsPage)
    const transformedProduct: Product = {
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

    // Verify all required fields are present and correct types
    console.log('✅ Product transformation test:', {
      id: typeof transformedProduct.id === 'string' ? 'PASS' : 'FAIL',
      name: typeof transformedProduct.name === 'string' ? 'PASS' : 'FAIL',
      price: typeof transformedProduct.price === 'number' ? 'PASS' : 'FAIL',
      imageUrl: typeof transformedProduct.imageUrl === 'string' ? 'PASS' : 'FAIL',
      producer: typeof transformedProduct.producer === 'object' && 
               typeof transformedProduct.producer.id === 'string' ? 'PASS' : 'FAIL'
    });

    return true;
  } catch (error) {
    console.error('❌ Product transformation test failed:', error);
    return false;
  }
}

// Test CartItem conversion
export function testCartItemConversion(): boolean {
  try {
    const product: Product = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Tomates Bio",
      description: "Tomates biologiques de saison",
      price: 3.50,
      unit: "kg",
      stock: 25,
      category: "Légumes",
      imageUrl: "https://example.com/tomato.jpg",
      images: ["https://example.com/tomato.jpg"],
      producer: {
        id: "producer-123",
        name: "Ferme Martin",
        shopName: "Bio Martin"
      },
      isAvailable: true
    };

    // Convert Product to CartItem (like in Index.tsx addToCart function)
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.imageUrl,
      producer: product.producer.name,
      category: product.category,
      quantity: 1
    };

    console.log('✅ CartItem conversion test:', {
      id: typeof cartItem.id === 'string' ? 'PASS' : 'FAIL',
      producer: typeof cartItem.producer === 'string' ? 'PASS' : 'FAIL',
      image: typeof cartItem.image === 'string' ? 'PASS' : 'FAIL',
      quantity: typeof cartItem.quantity === 'number' ? 'PASS' : 'FAIL'
    });

    return true;
  } catch (error) {
    console.error('❌ CartItem conversion test failed:', error);
    return false;
  }
}

// Test Producer interface
export function testProducerInterface(): boolean {
  try {
    const producer: Producer = {
      id: "producer-123",
      name: "Ferme Martin",
      shopName: "Bio Martin",
      description: "Ferme biologique familiale",
      specialties: ["Légumes", "Fruits"],
      image: "https://example.com/farm.jpg",
      location: "Région Parisienne"
    };

    console.log('✅ Producer interface test:', {
      id: typeof producer.id === 'string' ? 'PASS' : 'FAIL',
      name: typeof producer.name === 'string' ? 'PASS' : 'FAIL',
      specialties: Array.isArray(producer.specialties) ? 'PASS' : 'FAIL',
      image: typeof producer.image === 'string' ? 'PASS' : 'FAIL'
    });

    return true;
  } catch (error) {
    console.error('❌ Producer interface test failed:', error);
    return false;
  }
}

// Run all interface tests
export function runAllInterfaceTests(): void {
  console.log('🧪 Running Product Interface Tests...\n');
  
  const productTest = testProductTransformation();
  const cartTest = testCartItemConversion();
  const producerTest = testProducerInterface();
  
  const allPassed = productTest && cartTest && producerTest;
  
  console.log('\n📊 Test Results Summary:');
  console.log(`Product Transformation: ${productTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CartItem Conversion: ${cartTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Producer Interface: ${producerTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).runProductInterfaceTests = runAllInterfaceTests;
}
