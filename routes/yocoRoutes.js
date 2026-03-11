import express from 'express';
import axios from 'axios';
import { updatePaymentByCheckoutId } from '../controllers/ordersController.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Yoco API configuration - module-scoped so all routes can access them
const YOCO_API_URL = 'https://payments.yoco.com/api/checkouts';
const YOCO_SECRET_KEY = process.env.YOCO_TEST_SECRET_KEY;

/**
 * Create a Yoco payment checkout
 * POST /payments/yoco/checkout
 */
router.post('/payments/yoco/checkout', async (req, res) => {
  try {


    const { amount, currency, cancelUrl, successUrl, failureUrl, metadata } = req.body;

    // Validate required fields
    if (!amount || !currency || !cancelUrl || !successUrl || !failureUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, currency, cancelUrl, successUrl, failureUrl'
      });
    }

    // Validate amount (must be in cents/smallest currency unit)
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least 100 cents (1.00 ZAR)'
      });
    }

    // Create checkout payload
    const checkoutPayload = {
      amount: parseInt(amount),
      currency: currency.toUpperCase(),
      cancelUrl,
      successUrl,
      failureUrl,
      metadata: metadata || {}
    };



    // Call Yoco API
    const response = await axios.post(YOCO_API_URL, checkoutPayload, {
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Return checkout URL to frontend
    res.status(200).json({
      success: true,
      checkoutId: response.data.id,
      redirectUrl: response.data.redirectUrl,
      status: response.data.status
    });

  } catch (error) {
    console.error('Yoco checkout creation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to create Yoco checkout',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * Verify/Check payment status
 * GET /payments/yoco/status/:checkoutId
 */
/**
 * Enhanced payment status check with better error handling
 */
router.get('/payments/yoco/status/:checkoutId', async (req, res) => {
  try {
    const { checkoutId } = req.params;

    if (!checkoutId) {
      return res.status(400).json({
        success: false,
        message: 'Checkout ID is required'
      });
    }

    // Query Yoco API for checkout status
    const response = await axios.get(`${YOCO_API_URL}/${checkoutId}`, {
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`
      },
      timeout: 10000 // 10 second timeout
    });

    const checkoutData = response.data;

    // Enhanced status mapping
    const statusMap = {
      'complete': 'complete',
      'pending': 'pending',
      'processing': 'processing',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'expired': 'expired'
    };

    const normalizedStatus = statusMap[checkoutData.status] || checkoutData.status;

    res.status(200).json({
      success: true,
      checkout: {
        ...checkoutData,
        normalizedStatus
      },
      paymentStatus: normalizedStatus
    });

  } catch (error) {
    console.error('Yoco status check error:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found. The checkout ID may be invalid or expired.'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        message: 'Payment verification timeout. Please try again.'
      });
    }

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * Webhook endpoint for Yoco payment notifications
 * POST /payments/yoco/webhook
 */
router.post('/payments/yoco/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Parse the webhook payload
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    console.log('Yoco webhook received:', payload);

    // Handle different webhook events
    const { type, payload: eventPayload } = payload;

    switch (type) {
      case 'checkout.completed':
        // Payment was successful
        console.log('Payment completed:', eventPayload);
        if (eventPayload?.id) {
          try {
            await updatePaymentByCheckoutId(eventPayload.id, 'paid');
            console.log('Order payment status updated to paid for checkout:', eventPayload.id);
          } catch (dbError) {
            console.error('Failed to update order payment status:', dbError);
          }
        }
        break;

      case 'checkout.failed':
        // Payment failed
        console.log('Payment failed:', eventPayload);
        if (eventPayload?.id) {
          try {
            await updatePaymentByCheckoutId(eventPayload.id, 'failed');
            console.log('Order payment status updated to failed for checkout:', eventPayload.id);
          } catch (dbError) {
            console.error('Failed to update order payment status:', dbError);
          }
        }
        break;

      case 'checkout.cancelled':
        // Payment was cancelled
        console.log('Payment cancelled:', eventPayload);
        if (eventPayload?.id) {
          try {
            await updatePaymentByCheckoutId(eventPayload.id, 'failed');
            console.log('Order payment status updated to failed (cancelled) for checkout:', eventPayload.id);
          } catch (dbError) {
            console.error('Failed to update order payment status:', dbError);
          }
        }
        break;

      default:
        console.log('Unknown webhook type:', type);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * Create a refund
 * POST /payments/yoco/refund
 */
router.post('/payments/yoco/refund', async (req, res) => {
  try {
    const { checkoutId, amount } = req.body;

    if (!checkoutId) {
      return res.status(400).json({
        success: false,
        message: 'Checkout ID is required'
      });
    }

    const refundPayload = amount ? { amount: parseInt(amount) } : {};

    const response = await axios.post(
      `${YOCO_API_URL}/${checkoutId}/refund`,
      refundPayload,
      {
        headers: {
          'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      refund: response.data
    });

  } catch (error) {
    console.error('Yoco refund error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.response?.data?.message || error.message
    });
  }
});

export default router;