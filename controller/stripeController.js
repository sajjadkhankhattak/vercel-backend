import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent for quiz premium features
export const createPaymentIntent = async (req, res) => {
  try {
    console.log('=== CREATE PAYMENT INTENT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Stripe key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));

    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount || amount < 0.50) {
      console.log('❌ Amount validation failed:', amount);
      return res.status(400).json({ 
        success: false,
        error: 'Amount must be at least $0.50 USD' 
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Payment system not configured'
      });
    }

    console.log('✅ Creating Stripe payment intent for amount:', amount);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        quiz_app: 'true',
        user_id: req.user ? req.user._id.toString() : 'anonymous',
        user_email: req.user ? req.user.email : 'anonymous',
        ...metadata
      }
    });

    console.log('✅ Payment intent created successfully:', paymentIntent.id);
    
    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to create payment intent',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Handle successful payment confirmation
export const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id, user_id, quiz_id, plan_type } = req.body;

    if (!payment_intent_id) {
      return res.status(400).json({ 
        error: 'Payment intent ID is required' 
      });
    }

    // Retrieve the payment intent to verify it was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Here you can update your database with premium access
      // For example, update user's premium status or grant access to quiz
      
      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        payment_status: paymentIntent.status,
        payment_id: payment_intent_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        payment_status: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: error.message 
    });
  }
};

// Create a subscription for premium quiz access
export const createSubscription = async (req, res) => {
  try {
    const { customer_email, price_id, metadata = {} } = req.body;

    if (!customer_email || !price_id) {
      return res.status(400).json({ 
        error: 'Customer email and price ID are required' 
      });
    }

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customer_email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customer_email,
        metadata: {
          quiz_app: 'true',
          ...metadata
        }
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json({
      success: true,
      subscription_id: subscription.id,
      client_secret: subscription.latest_invoice.payment_intent.client_secret,
      customer_id: customer.id
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error.message 
    });
  }
};

// Handle webhook events from Stripe
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        // Update user's premium status in your database
        break;
      
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        // Handle failed payment
        break;
      
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object);
        // Grant premium access
        break;
      
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object);
        // Revoke premium access
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};

// Get payment methods for a customer
export const getPaymentMethods = async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id) {
      return res.status(400).json({ 
        error: 'Customer ID is required' 
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer_id,
      type: 'card',
    });

    res.status(200).json({
      success: true,
      payment_methods: paymentMethods.data
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment methods',
      details: error.message 
    });
  }
};