// routes/ordersRoutes.js
import express from 'express';
import {
    createOrder,
    getOrderById,
    getOrderByCheckoutId,
    getUserOrders,
    updatePaymentStatus,
    getAllOrders,
    updateOrderStatus,
    getOrderItems
} from '../controllers/ordersController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', authenticateToken, createOrder);

/**
 * @route   GET /api/orders/me
 * @desc    Get current user's orders
 * @access  Private
 */
router.get('/me', authenticateToken, getUserOrders);

/**
 * @route   GET /api/orders/checkout/:checkoutId
 * @desc    Get order by Yoco checkout ID
 * @access  Private (used for payment verification)
 */
router.get('/checkout/:checkoutId', getOrderByCheckoutId);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getOrderById);

/**
 * @route   PATCH /api/orders/:id/payment
 * @desc    Update order payment status
 * @access  Private
 */
router.patch('/:id/payment', authenticateToken, updatePaymentStatus);

// ── Admin routes ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (admin only)
 * @access  Admin
 */
router.get('/admin/all', authenticateToken, requireAdmin, getAllOrders);

/**
 * @route   PATCH /api/orders/admin/:id/status
 * @desc    Update order status (admin only)
 * @access  Admin
 */
router.patch('/admin/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

/**
 * @route   GET /api/orders/admin/:id/items
 * @desc    Get items for a specific order (admin only)
 * @access  Admin
 */
router.get('/admin/:id/items', authenticateToken, requireAdmin, getOrderItems);

export default router;
