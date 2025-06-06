
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import Cart from '../components/Cart';
import PickupPointSelector from '../components/PickupPointSelector';
import ProducerCard from '../components/ProducerCard';
import LocationSelector from '../components/LocationSelector';
import AuthModal from '../components/AuthModal';
import { api } from '@/lib/api';
import { loadCartFromStorage, saveCartToStorage, addToCart as addToCartUtil, updateCartItemQuantity, removeFromCart as removeFromCartUtil } from '../utils/cartUtils';
import type { CartItem as StoredCartItem } from '../utils/cartUtils';
import { Product, Producer } from '../types/product';

// Local CartItem interface for the Index page that includes extra properties for display
interface CartItem extends StoredCartItem {
  description?: string;
  stock?: number;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPickupSelectorOpen, setIsPickupSelectorOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProducer, setSelectedProducer] = useState("");
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'producers'>('home');
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for API data
  const [products, setProducts] = useState<Product[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Load cart from storage on component mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setCartItems(savedCart);
  }, []);

  // Save cart to storage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load products and producers in parallel
      const [productsData, producersData] = await Promise.all([
        api.products.getProducts(),
        api.producers.getPublicProducers()
      ]);
        // Transform products data to match our interface
      const transformedProducts: Product[] = productsData.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        unit: product.unit,
        stock: product.stock,
        category: product.category,
        imageUrl: product.image || product.images?.[0] || '/placeholder.svg',
        images: product.images || [],        producer: {
          id: product.producerId || product.producer?.id || 'unknown',
          name: typeof product.producer === 'string' ? product.producer : 
                (product.producer?.name || product.producer?.shopName || 'Unknown'),
          shopName: typeof product.producer === 'object' ? product.producer.shopName : undefined
        },
        isAvailable: product.isAvailable
      }));
      
      // Transform producers data to match our interface
      const transformedProducers: Producer[] = producersData.map((producer: any) => ({
        id: producer.id,
        name: producer.shopName || producer.name,
        description: producer.description || '',
        specialties: producer.certifications || [],
        image: producer.imageUrl || '/placeholder.svg',
        location: producer.address || producer.location || ''
      }));
      
      setProducts(transformedProducts);
      setProducers(transformedProducers);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(transformedProducts.map(product => product.category)));
      setCategories(uniqueCategories);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "" || product.category === selectedCategory;
    const producerMatch = selectedProducer === "" || product.producer.name === selectedProducer;
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && producerMatch && searchMatch;
  });
  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {        // Convert Product to CartItem format
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.imageUrl, // Map imageUrl to image for CartItem
          producer: product.producer.name,
          category: product.category,
          quantity: 1,
          description: product.description,
          stock: product.stock
        };
        return [...prevItems, cartItem];
      }
    });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleLocationChange = (location: any) => {
    setUserLocation(location);
    console.log('User location updated:', location);
  };
  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsPickupSelectorOpen(true);
  };

  const handlePickupPointSelect = async (point: any) => {
    try {
      // Group cart items by producer
      const itemsByProducer = cartItems.reduce((acc, item) => {
        // For now, we'll assume all items are from the same producer
        // In a real implementation, you'd need to group by actual producer ID
        const producerId = '1'; // This would come from the product data
        if (!acc[producerId]) {
          acc[producerId] = [];
        }
        acc[producerId].push({
          productId: item.id.toString(),
          quantity: item.quantity
        });
        return acc;
      }, {} as Record<string, Array<{productId: string, quantity: number}>>);

      // Create orders for each producer
      const orderPromises = Object.entries(itemsByProducer).map(([producerId, items]) =>
        api.orders.create({
          producerId,
          items,
          pickupPoint: point.name,
          notes: `Point de retrait: ${point.address}`
        })
      );

      await Promise.all(orderPromises);
      
      setCartItems([]);
      setIsPickupSelectorOpen(false);
      alert('Commande confirmée ! Vous recevrez un email de confirmation.');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erreur lors de la création de la commande. Veuillez réessayer.');
    }
  };

  const handleProducerSignup = () => {
    setIsAuthModalOpen(true);
  };  const handleProducerClick = (producerId: string) => {
    setSelectedProducer(producers.find(p => p.id === producerId)?.name || "");
    setCurrentView('products');
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
        onSearch={setSearchQuery}
      />

      {currentView === 'home' && (
        <>
          <Hero onProducerSignup={handleProducerSignup} />
          
          {/* Location Selector */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LocationSelector onLocationChange={handleLocationChange} />
          </div>
          
          {/* Quick Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <button
                onClick={() => setCurrentView('products')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all text-center group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">🥕</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Nos Produits</h3>
                <p className="text-gray-600">Découvrez notre sélection de produits locaux</p>
              </button>
              
              <button
                onClick={() => setCurrentView('producers')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all text-center group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">👨‍🌾</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Nos Producteurs</h3>
                <p className="text-gray-600">Rencontrez les artisans de votre région</p>
              </button>
              
              <button
                onClick={() => setIsPickupSelectorOpen(true)}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all text-center group"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Points Relais</h3>
                <p className="text-gray-600">Trouvez le point de retrait le plus proche</p>
              </button>
            </div>            {/* Featured Products */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Produits du moment</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement des produits...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={loadData}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.slice(0, 4).map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
              <div className="text-center mt-8">
                <button
                  onClick={() => setCurrentView('products')}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Voir tous les produits
                </button>
              </div>
            </section>
          </div>
        </>
      )}

      {currentView === 'products' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tous nos produits</h1>
            <button
              onClick={() => setCurrentView('home')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Retour à l'accueil
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">            <div>
              <ProductFilters
                categories={categories}
                producers={producers.map(p => p.name)}
                selectedCategory={selectedCategory}
                selectedProducer={selectedProducer}
                onCategoryChange={setSelectedCategory}
                onProducerChange={setSelectedProducer}
              />
            </div>
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aucun produit trouvé pour cette sélection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentView === 'producers' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Nos producteurs</h1>
            <button
              onClick={() => setCurrentView('home')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Retour à l'accueil
            </button>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {producers.map(producer => (
              <ProducerCard 
                key={producer.id} 
                producer={producer} 
                onClick={handleProducerClick}
              />
            ))}
          </div>
        </div>
      )}

      <Cart
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <PickupPointSelector
        isOpen={isPickupSelectorOpen}
        onClose={() => setIsPickupSelectorOpen(false)}
        onSelect={handlePickupPointSelect}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="signup"
        userType="producer"
      />
    </div>
  );
};

export default Index;
