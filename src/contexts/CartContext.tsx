import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadCartFromStorage, saveCartToStorage, clearCartFromStorage } from '../utils/cartUtils';
import { useAuthState } from '../hooks/useAuthState';
import axios from 'axios';
import type { CartItem } from '../utils/cartUtils';

interface CartContextType {
  cartItems: CartItem[];
  cartItemsCount: number;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { isAuthenticated } = useAuthState();
  const API_URL = 'http://localhost:3001/api';

  // Initialize cart on component mount
  useEffect(() => {
    initializeCart();
  }, []);

  // Watch for authentication changes
  useEffect(() => {
    if (isInitialized) {
      handleAuthChange();
    }
  }, [isAuthenticated, isInitialized]);

  const initializeCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // User is logged in - sync with backend
        await syncWithBackend();
      } else {
        // User not logged in - load from localStorage
        const localCart = loadCartFromStorage();
        setCartItems(localCart);
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      // Fallback to localStorage
      const localCart = loadCartFromStorage();
      setCartItems(localCart);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const handleAuthChange = async () => {
    if (isAuthenticated) {
      // User just logged in - sync cart
      await syncCart();
    } else {
      // User logged out - clear cart and use localStorage
      setCartItems([]);
      clearCartFromStorage();
    }
  };

  const syncWithBackend = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart from backend:', error);
      // Fallback to localStorage
      const localCart = loadCartFromStorage();
      setCartItems(localCart);
    }
  };

  const syncCart = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const localCartItems = loadCartFromStorage();
      
      if (localCartItems.length > 0) {
        // Sync localStorage cart with backend
        const response = await axios.post(`${API_URL}/cart/sync`, {
          localCartItems
        });
        setCartItems(response.data);
        clearCartFromStorage(); // Clear localStorage after sync
      } else {
        // Just load backend cart
        await syncWithBackend();
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Add to backend
        await axios.post(`${API_URL}/cart/add`, {
          productId: item.id,
          quantity
        });
        await syncWithBackend();
      } else {
        // Add to localStorage
        const currentCart = [...cartItems];
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
        
        setCartItems(updatedCart);
        saveCartToStorage(updatedCart);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Update in backend
        await axios.put(`${API_URL}/cart/items/${id}`, { quantity });
        await syncWithBackend();
      } else {
        // Update in localStorage
        const updatedCart = quantity <= 0
          ? cartItems.filter(item => item.id !== id)
          : cartItems.map(item =>
              item.id === id ? { ...item, quantity } : item
            );
        
        setCartItems(updatedCart);
        saveCartToStorage(updatedCart);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Remove from backend
        await axios.delete(`${API_URL}/cart/items/${id}`);
        await syncWithBackend();
      } else {
        // Remove from localStorage
        const updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
        saveCartToStorage(updatedCart);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Clear backend cart
        await axios.delete(`${API_URL}/cart`);
      }
      
      // Clear local state and storage
      setCartItems([]);
      clearCartFromStorage();
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Still clear local state even if backend fails
      setCartItems([]);
      clearCartFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    cartItemsCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
