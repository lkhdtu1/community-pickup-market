// Cart persistence utilities
export interface CartItem {
  id: string; // Changed to string for UUID compatibility
  name: string;
  price: number;
  unit: string;
  producer: string;
  quantity: number;
  image: string;
  category: string;
}

const CART_STORAGE_KEY = 'community_market_cart';

export const saveCartToStorage = (cartItems: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

export const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

export const clearCartFromStorage = (): void => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
};

export const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1): CartItem[] => {
  const currentCart = loadCartFromStorage();
  const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
  
  let updatedCart: CartItem[];
  if (existingItem) {
    updatedCart = currentCart.map(cartItem =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: cartItem.quantity + quantity }
        : cartItem
    );
  } else {
    updatedCart = [...currentCart, { ...item, quantity }];
  }
  
  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = (id: string, quantity: number): CartItem[] => {
  const currentCart = loadCartFromStorage();
  const updatedCart = quantity <= 0
    ? currentCart.filter(item => item.id !== id)
    : currentCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
  
  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const removeFromCart = (id: string): CartItem[] => {
  const currentCart = loadCartFromStorage();
  const updatedCart = currentCart.filter(item => item.id !== id);
  saveCartToStorage(updatedCart);
  return updatedCart;
};
