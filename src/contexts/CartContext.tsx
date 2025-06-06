import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadCartFromStorage, saveCartToStorage, addToCart as addToCartUtil, updateCartItemQuantity, removeFromCart as removeFromCartUtil } from '../utils/cartUtils';
import type { CartItem } from '../utils/cartUtils';

interface CartContextType {
  cartItems: CartItem[];
  cartItemsCount: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
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

  // Load cart from storage on component mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    setCartItems(savedCart);
  }, []);

  // Save cart to storage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const updatedCart = addToCartUtil(item, quantity);
    setCartItems(updatedCart);
  };
  const updateQuantity = (id: string, quantity: number) => {
    const updatedCart = updateCartItemQuantity(id, quantity);
    setCartItems(updatedCart);
  };

  const removeFromCart = (id: string) => {
    const updatedCart = removeFromCartUtil(id);
    setCartItems(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
    saveCartToStorage([]);
  };

  const value: CartContextType = {
    cartItems,
    cartItemsCount,
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
