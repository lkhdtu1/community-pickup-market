import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadCartFromStorage, saveCartToStorage, clearCartFromStorage } from '../utils/cartUtils';
import { useAuthState } from '../hooks/useAuthState';
import type { CartItem } from '../utils/cartUtils';

interface CartContextType {
  cartItems: CartItem[];
  cartItemsCount: number;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
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
  const { isAuthenticated } = useAuthState();

  // Load cart from localStorage on mount
  useEffect(() => {
    const localCart = loadCartFromStorage();
    setCartItems(localCart);
  }, []);

  const addToCart = async (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setIsLoading(true);
    try {
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
      const updatedCart = quantity <= 0
        ? cartItems.filter(item => item.id !== id)
        : cartItems.map(item =>
            item.id === id ? { ...item, quantity } : item
          );
      
      setCartItems(updatedCart);
      saveCartToStorage(updatedCart);
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
      const updatedCart = cartItems.filter(item => item.id !== id);
      setCartItems(updatedCart);
      saveCartToStorage(updatedCart);
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
      setCartItems([]);
      clearCartFromStorage();
    } catch (error) {
      console.error('Error clearing cart:', error);
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
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
