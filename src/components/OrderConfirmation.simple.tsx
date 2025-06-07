import React from 'react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Confirmer la commande</h2>
        <p className="mb-2">Total: {total}€</p>
        <p className="mb-4">Point de retrait: {selectedPickupPoint.name}</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button 
            onClick={() => onConfirm({})}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
