import Stripe from 'stripe';
import { Request, Response } from 'express';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_default', {
  apiVersion: '2024-04-10'
});

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'eur', metadata = {} } = req.body;
    const userId = req.user?.userId;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId?.toString() || '',
        ...metadata
      }
    });

    res.json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const confirmPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payment_intent_id } = req.body;

    if (!payment_intent_id) {
      res.status(400).json({ message: 'Payment intent ID is required' });
      return;
    }

    // Retrieve payment intent to check status
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      message: 'Failed to confirm payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, metadata = {} } = req.body;
    const userId = req.user?.userId;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId?.toString() || '',
        ...metadata
      }
    });

    res.json({
      id: customer.id,
      email: customer.email,
      name: customer.name
    });

  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create customer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const attachPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payment_method_id, customer_id } = req.body;

    if (!payment_method_id || !customer_id) {
      res.status(400).json({ message: 'Payment method ID and customer ID are required' });
      return;
    }

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer_id,
    });

    res.json({
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card
    });

  } catch (error) {
    console.error('Payment method attachment error:', error);
    res.status(500).json({ 
      message: 'Failed to attach payment method',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Webhook handler for Stripe events
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      res.status(400).send('Webhook secret not configured');
      return;
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        // TODO: Update order status, send confirmation email, etc.
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        // TODO: Handle failed payment, notify customer, etc.
        break;

      case 'customer.created':
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer created:', customer.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
