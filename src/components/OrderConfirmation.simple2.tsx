import React from 'react';
import { X } from 'lucide-react';
import { CartItem, PickupPoint } from '../types/product';

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: any) => void;
  cartItems: CartItem[];
  selectedPickupPoint: PickupPoint;
  total: number;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cartItems,
  selectedPickupPoint,
  total
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    const orderData = {
      items: cartItems,
      pickupPoint: selectedPickupPoint,
      total: total,
      timestamp: new Date().toISOString()
    };
    onConfirm(orderData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Confirmer la commande</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Articles commandés:</h3>
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Point de retrait:</h3>
            <p className="text-sm text-gray-600">{selectedPickupPoint.name}</p>
            <p className="text-sm text-gray-600">{selectedPickupPoint.address}</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{total.toFixed(2)}€</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
