import { loadStripe, Stripe } from '@stripe/stripe-js';

// This would be your publishable key in production
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency?: string;
  automatic_payment_methods?: {
    enabled: boolean;
  };
  metadata?: Record<string, string>;
}

export const stripeService = {
  // Create payment intent on backend
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntent> => {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return response.json();
  },

  // Confirm payment with Stripe Elements
  confirmPayment: async (
    stripe: Stripe,
    clientSecret: string,
    paymentMethodId: string,
    returnUrl?: string
  ) => {
    return await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        payment_method: paymentMethodId,
        return_url: returnUrl || window.location.origin + '/order-confirmation'
      }
    });
  },

  // Create payment method for future use
  createPaymentMethod: async (
    stripe: Stripe,
    cardElement: any,
    billingDetails: {
      name: string;
      email?: string;
      address?: {
        line1: string;
        line2?: string;
        city: string;
        postal_code: string;
        country: string;
      };
    }
  ) => {
    return await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: billingDetails
    });
  },

  // Retrieve payment intent status
  retrievePaymentIntent: async (clientSecret: string) => {
    const stripe = await getStripe();
    if (!stripe) throw new Error('Stripe not loaded');
    
    return await stripe.retrievePaymentIntent(clientSecret);
  }
};

export default stripeService;
