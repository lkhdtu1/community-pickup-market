import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, MapPin, Package, Plus, ArrowRight } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { CartItem, PickupPoint } from '../types/product';
import { getStripe } from '../services/stripeService';
import PaymentForm from './PaymentForm';
import { api } from '../lib/api';

interface PaymentMethod {
  id: string;
  type: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: string;
  holderName?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  id: string;
  type: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  country: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: any) => void;
  cartItems: CartItem[];
  selectedPickupPoint: PickupPoint;
  total: number;
}

const stripePromise = getStripe();

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cartItems,
  selectedPickupPoint,
  total
}) => {
  const [step, setStep] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load payment methods and addresses
  useEffect(() => {
    if (isOpen) {
      loadPaymentData();
    }
  }, [isOpen]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
        // Load payment methods and addresses from API
      const [paymentMethodsData, addressesData] = await Promise.all([
        api.customers.getPaymentMethods(),
        api.customers.getAddresses()
      ]);

      setPaymentMethods(paymentMethodsData);
      setAddresses(addressesData);

      // Auto-select default payment method and address
      const defaultPayment = paymentMethodsData.find((pm: PaymentMethod) => pm.isDefault);
      const defaultAddress = addressesData.find((addr: Address) => addr.isDefault);

      if (defaultPayment) {
        setSelectedPaymentMethod(defaultPayment.id);
      }
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }

    } catch (error) {
      console.error('Error loading payment data:', error);
      setError('Erreur lors du chargement des données de paiement');
    } finally {
      setLoading(false);
    }
  };
  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedAddress) {
        setError('Veuillez sélectionner une adresse de facturation');
        return;
      }
      if (!useNewPaymentMethod && !selectedPaymentMethod) {
        setError('Veuillez sélectionner un moyen de paiement ou choisir d\'en ajouter un nouveau');
        return;
      }
      setError(null);
      
      // If using existing payment method, skip to confirmation
      if (!useNewPaymentMethod) {
        setStep(3);
      } else {
        // Go to payment processing step
        setStep(2);
      }
    } else if (step === 2) {
      // This will be handled by payment success callback
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setStep(3); // Go to confirmation step
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };
  const handleConfirmOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        pickupPoint: selectedPickupPoint.address,
        paymentMethodId: useNewPaymentMethod ? null : selectedPaymentMethod,
        paymentIntentId: useNewPaymentMethod ? paymentIntentId : null,
        billingAddressId: selectedAddress,
        total: total,
        notes: `Commande via l'application - Point de retrait: ${selectedPickupPoint.address}`
      };

      // Submit order
      await onConfirm(orderData);
      setStep(4);

    } catch (err) {
      console.error('Error confirming order:', err);
      setError('Erreur lors de la confirmation de la commande');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setStep(1);
    setError(null);
    setUseNewPaymentMethod(false);
    setPaymentIntentId('');
    onClose();
  };

  const getCardBrandIcon = (brand: string) => {
    const brandClass = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600'
    }[brand] || 'text-gray-600';
    
    return <CreditCard className={`w-5 h-5 ${brandClass}`} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="absolute inset-4 bg-white rounded-xl shadow-xl max-w-2xl mx-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">            <h2 className="text-xl font-semibold">
              {step === 1 && 'Sélectionner le paiement'}
              {step === 2 && 'Paiement sécurisé'}
              {step === 3 && 'Confirmation de commande'}
              {step === 4 && 'Commande confirmée !'}
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>          {/* Progress Bar */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-green-500' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {step > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step >= 4 ? 'bg-green-500' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 4 ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {step >= 4 ? <Check className="w-4 h-4" /> : '4'}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Moyen de paiement
                  </h3>                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          selectedPaymentMethod === method.id && !useNewPaymentMethod
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id && !useNewPaymentMethod}
                          onChange={(e) => {
                            setSelectedPaymentMethod(e.target.value);
                            setUseNewPaymentMethod(false);
                          }}
                          className="sr-only"
                        />
                        <div className="flex items-center flex-1">
                          {getCardBrandIcon(method.cardBrand)}
                          <div className="ml-3">
                            <p className="font-medium">
                              **** **** **** {method.cardLastFour}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.holderName} • Expire {method.expiryMonth}
                            </p>
                          </div>
                          {method.isDefault && (
                            <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Par défaut
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                    
                    {/* Add new payment method option */}
                    <label
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        useNewPaymentMethod
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="new"
                        checked={useNewPaymentMethod}
                        onChange={() => {
                          setUseNewPaymentMethod(true);
                          setSelectedPaymentMethod('');
                        }}
                        className="sr-only"
                      />
                      <div className="flex items-center flex-1">
                        <Plus className="w-5 h-5 text-gray-600" />
                        <div className="ml-3">
                          <p className="font-medium">Ajouter une nouvelle carte</p>
                          <p className="text-sm text-gray-500">
                            Paiement sécurisé par Stripe
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Billing Address Selection */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Adresse de facturation
                  </h3>
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          selectedAddress === address.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddress === address.id}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {address.firstName} {address.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.city} {address.postalCode}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-gray-500">{address.phone}</p>
                          )}
                          {address.isDefault && (
                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Par défaut
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Paiement sécurisé
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      🔒 Vos informations de paiement sont sécurisées par Stripe
                    </p>
                  </div>
                  
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      amount={total}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      billingAddress={addresses.find(addr => addr.id === selectedAddress)}
                    />
                  </Elements>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Récapitulatif de commande
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit} × {item.price.toFixed(2)}€
                          </p>
                        </div>
                        <p className="font-medium">
                          {(item.quantity * item.price).toFixed(2)}€
                        </p>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span>{total.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Point */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Point de retrait
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{selectedPickupPoint.name}</p>
                    <p className="text-sm text-gray-600">{selectedPickupPoint.address}</p>
                    <p className="text-sm text-gray-600">{selectedPickupPoint.schedule}</p>
                  </div>
                </div>                {/* Payment Method Summary */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Paiement</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {useNewPaymentMethod ? (
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <span className="ml-2">
                          Nouvelle carte de paiement {paymentIntentId && '(Paiement confirmé)'}
                        </span>
                      </div>
                    ) : (
                      paymentMethods.find(pm => pm.id === selectedPaymentMethod) && (
                        <div className="flex items-center">
                          {getCardBrandIcon(paymentMethods.find(pm => pm.id === selectedPaymentMethod)!.cardBrand)}
                          <span className="ml-2">
                            **** **** **** {paymentMethods.find(pm => pm.id === selectedPaymentMethod)!.cardLastFour}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Commande confirmée !</h3>
                <p className="text-gray-600 mb-4">
                  Votre commande a été enregistrée avec succès. Vous recevrez un email de confirmation.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium mb-2">Détails de la commande :</h4>
                  <p className="text-sm text-gray-600">
                    Point de retrait : {selectedPickupPoint.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total : {total.toFixed(2)}€
                  </p>
                </div>
              </div>
            )}
          </div>          {/* Footer */}
          <div className="border-t p-6">
            <div className="flex justify-between">
              {step > 1 && step < 4 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Retour
                </button>
              )}
              <div className="ml-auto">
                {step === 1 && (
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                )}
                {step === 2 && (
                  <div className="text-sm text-gray-600">
                    Complétez le paiement ci-dessus pour continuer
                  </div>
                )}
                {step === 3 && (
                  <button
                    onClick={handleConfirmOrder}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Confirmation...' : 'Confirmer la commande'}
                  </button>
                )}
                {step === 4 && (
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Fermer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
