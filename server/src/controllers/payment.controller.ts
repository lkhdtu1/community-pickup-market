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

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Payment intent confirmation error:', error);
    res.status(500).json({ 
      message: 'Failed to confirm payment intent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;
    const userId = req.user?.userId;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: userId?.toString() || ''
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

    const paymentMethod = await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer_id,
    });

    res.json({
      id: paymentMethod.id,
      type: paymentMethod.type,
      customer: paymentMethod.customer
    });

  } catch (error) {
    console.error('Payment method attachment error:', error);
    res.status(500).json({ 
      message: 'Failed to attach payment method',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      res.status(400).send('Missing stripe signature or webhook secret');
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent was successful!', paymentIntent.id);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log('PaymentMethod was attached to a Customer!', paymentMethod.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
