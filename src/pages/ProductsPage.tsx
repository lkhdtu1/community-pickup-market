import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import Cart from '../components/Cart';
import PickupPointSelector from '../components/PickupPointSelector';
import { mockProducts } from '../data/mockData';
import { useLocation } from 'react-router-dom';
import { productsAPI, api } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types/product';

const ProductsPage = () => {
  const { addToCart, cartItemsCount, cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducer, setSelectedProducer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [producers, setProducers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPickupSelectorOpen, setIsPickupSelectorOpen] = useState(false);
  
  const location = useLocation();
  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    const producerId = params.get('producer');

    if (query) {
      setSearchQuery(query);
    }

    if (producerId) {
      setSelectedProducer(producerId);
    } else {
      setSelectedProducer('');
    }
  }, [location.search]);
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll();
      
      // Transform API response to match our Product interface
      const transformedProducts: Product[] = data.map((apiProduct: any) => ({
        id: apiProduct.id,
        name: apiProduct.name,
        description: apiProduct.description || '',
        price: apiProduct.price,
        unit: apiProduct.unit,
        stock: apiProduct.stock,
        category: apiProduct.category,
        imageUrl: apiProduct.image || apiProduct.images?.[0] || '/placeholder.svg',
        images: apiProduct.images || [],        producer: {
          id: apiProduct.producerId || apiProduct.producer?.id || 'unknown',
          name: typeof apiProduct.producer === 'string' ? apiProduct.producer : 
                (apiProduct.producer?.name || apiProduct.producer?.shopName || 'Unknown'),
          shopName: typeof apiProduct.producer === 'object' ? apiProduct.producer.shopName : undefined
        },
        isAvailable: apiProduct.isAvailable
      }));
      
      setProducts(transformedProducts);
      
      // Extract unique categories and producers
      const uniqueCategories = Array.from(new Set(transformedProducts.map(product => product.category))) as string[];
      const uniqueProducers = Array.from(new Set(transformedProducts.map(product => ({
        id: product.producer.id,
        name: product.producer.name
      })).map(p => JSON.stringify(p)))).map(p => JSON.parse(p));
      
      setCategories(uniqueCategories);
      setProducers(uniqueProducers);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Erreur lors du chargement des produits');
      
      // Fallback to transformed mock data
      const transformedMockProducts: Product[] = mockProducts.map(mockProduct => ({
        id: mockProduct.id.toString(),
        name: mockProduct.name,
        description: mockProduct.description || '',
        price: mockProduct.price,
        unit: mockProduct.unit,
        stock: mockProduct.stock,
        category: mockProduct.category,
        imageUrl: mockProduct.image,
        producer: {
          id: 'mock-producer',
          name: mockProduct.producer
        }
      }));
      setProducts(transformedMockProducts);
    } finally {
      setLoading(false);
    }
  };  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      producer: product.producer.name || product.producer.shopName || 'Unknown',
      image: product.imageUrl || '/placeholder.svg',
      category: product.category
    };
    addToCart(cartItem);
    alert(`${product.name} ajouté au panier !`);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsPickupSelectorOpen(true);
  };
  const handlePickupPointSelect = async (point: any) => {
    try {
      // Group cart items by producer
      const itemsByProducer = cartItems.reduce((acc, item) => {
        const producerName = item.producer;
        if (!acc[producerName]) {
          acc[producerName] = [];
        }
        acc[producerName].push({
          productId: item.id,
          quantity: item.quantity
        });
        return acc;
      }, {} as Record<string, Array<{productId: string, quantity: number}>>);

      // Find the first producer ID from our products list
      const firstProducerId = products.length > 0 ? products[0].producer.id : 'unknown';
      
      const orderData = {
        producerId: firstProducerId,
        items: Object.values(itemsByProducer)[0] || [],
        pickupPoint: point.name,
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `Point de retrait: ${point.address}`
      };

      await api.orders.create(orderData);
      
      clearCart();
      setIsPickupSelectorOpen(false);
      alert('Commande confirmée ! Vous recevrez un email de confirmation.');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    }
  };
  // Filter products based on selected category and producer
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "" || product.category === selectedCategory;
    const producerMatch = selectedProducer === "" || product.producer.id === selectedProducer;
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && producerMatch && searchMatch;
  });

  return (    <div className="min-h-screen bg-gray-50">      <Header 
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
        onSearch={setSearchQuery}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tous les produits</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">            <ProductFilters 
              categories={categories}
              producers={producers.map(p => p.name)}
              selectedCategory={selectedCategory}
              selectedProducer={selectedProducer}
              onCategoryChange={setSelectedCategory}
              onProducerChange={setSelectedProducer}
            />
          </div>
            <div className="lg:w-3/4">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des produits...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={loadProducts}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Réessayer
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-4 text-gray-600">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </div>                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Aucun produit trouvé avec ces critères.</p>
                  </div>
                )}
              </>
            )}          </div>
        </div>
      </div>

      <Cart
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <PickupPointSelector
        isOpen={isPickupSelectorOpen}
        onClose={() => setIsPickupSelectorOpen(false)}
        onSelect={handlePickupPointSelect}
      />
    </div>
  );
};

export default ProductsPage;
