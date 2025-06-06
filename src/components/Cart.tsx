
import React from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { CartItem } from '../utils/cartUtils';

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

const Cart = ({ isOpen, items, onClose, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="text-green-600" size={24} />
              <h2 className="text-lg font-semibold">Mon Panier</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Votre panier est vide</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.producer}</p>
                      <p className="text-sm font-semibold text-green-600">
                        {item.price}€ / {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">{total.toFixed(2)}€</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Choisir un point relais
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
