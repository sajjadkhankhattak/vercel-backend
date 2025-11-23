import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  createSubscription,
  handleWebhook,
  getPaymentMethods
} from '../controller/stripeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Test route for Stripe configuration
router.get('/test', (req, res) => {
  res.json({
    message: 'Stripe routes are working!',
    timestamp: new Date().toISOString(),
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY
  });
});

// Payment routes - Protected (require authentication)
router.post('/create-payment-intent', authenticateToken, createPaymentIntent);
router.post('/confirm-payment', authenticateToken, confirmPayment);
router.post('/create-subscription', authenticateToken, createSubscription);
router.get('/payment-methods/:customer_id', authenticateToken, getPaymentMethods);

// Webhook route (should use raw body parser)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;