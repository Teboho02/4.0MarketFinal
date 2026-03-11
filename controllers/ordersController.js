// controllers/ordersController.js
import { v4 as uuidv4 } from 'uuid';
import { query, execute, getConnection } from '../config/mysql.js';
import validator from 'validator';

/**
 * Generate a unique order number
 */
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
    const connection = await getConnection();

    try {
        await connection.beginTransaction();

        const {
            items,
            subtotal,
            tax = 0,
            shipping_cost = 0,
            discount = 0,
            total,
            payment_method = 'yoco',
            shipping_address,
            billing_address,
            notes,
            yoco_checkout_id
        } = req.body;

        const userId = req.user?.id;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!subtotal || !total) {
            return res.status(400).json({
                success: false,
                message: 'Subtotal and total are required'
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Generate order ID and number
        const orderId = uuidv4();
        const orderNumber = generateOrderNumber();

        // Insert order
        const orderSQL = `
      INSERT INTO orders (
        id, order_number, user_id, status, subtotal, tax, 
        shipping_cost, discount, total, payment_method, payment_status,
        yoco_checkout_id, shipping_address, billing_address, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        await connection.execute(orderSQL, [
            orderId,
            orderNumber,
            userId,
            'pending',
            subtotal,
            tax,
            shipping_cost,
            discount,
            total,
            payment_method,
            'pending',
            yoco_checkout_id || null,
            JSON.stringify(shipping_address),
            JSON.stringify(billing_address),
            notes ? validator.escape(notes) : null
        ]);

        // Insert order items
        const itemSQL = `
      INSERT INTO order_items (
        id, order_id, product_id, product_name, product_sku,
        quantity, wholesale_price, retail_price, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        for (const item of items) {
            const itemId = uuidv4();
            const itemSubtotal = (parseFloat(item.retail_price) || 0) * (item.quantity || 1);

            await connection.execute(itemSQL, [
                itemId,
                orderId,
                item.id || item.product_id,
                item.name || item.product_name,
                item.sku || item.product_sku || 'N/A',
                item.quantity || 1,
                item.wholesale_price || 0,
                item.retail_price || 0,
                itemSubtotal
            ]);
        }

        await connection.commit();

        // Fetch the created order
        const [order] = await query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                ...order,
                shipping_address: JSON.parse(order.shipping_address || '{}'),
                billing_address: JSON.parse(order.billing_address || '{}')
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const orders = await query(
            `SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_sku', oi.product_sku,
            'quantity', oi.quantity,
            'wholesale_price', oi.wholesale_price,
            'retail_price', oi.retail_price,
            'subtotal', oi.subtotal
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = ? AND o.user_id = ?
       GROUP BY o.id`,
            [id, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orders[0];

        res.status(200).json({
            success: true,
            order: {
                ...order,
                items: JSON.parse(order.items || '[]'),
                shipping_address: JSON.parse(order.shipping_address || '{}'),
                billing_address: JSON.parse(order.billing_address || '{}')
            }
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

/**
 * Get order by Yoco checkout ID
 * GET /api/orders/checkout/:checkoutId
 */
export const getOrderByCheckoutId = async (req, res) => {
    try {
        const { checkoutId } = req.params;

        const orders = await query(
            'SELECT * FROM orders WHERE yoco_checkout_id = ?',
            [checkoutId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found for this checkout'
            });
        }

        res.status(200).json({
            success: true,
            order: orders[0]
        });

    } catch (error) {
        console.error('Get order by checkout ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

/**
 * Get all orders for a user
 * GET /api/orders/user/:userId or GET /api/orders/me
 */
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.params.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const orders = await query(
            `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            orders: orders.map(order => ({
                ...order,
                shipping_address: JSON.parse(order.shipping_address || '{}'),
                billing_address: JSON.parse(order.billing_address || '{}')
            }))
        });

    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

/**
 * Update order payment status
 * PATCH /api/orders/:id/payment
 */
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, yoco_checkout_id } = req.body;

        const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!validStatuses.includes(payment_status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        let updateSQL = 'UPDATE orders SET payment_status = ?, updated_at = NOW()';
        const params = [payment_status];

        if (yoco_checkout_id) {
            updateSQL += ', yoco_checkout_id = ?';
            params.push(yoco_checkout_id);
        }

        // If payment is successful, also update order status
        if (payment_status === 'paid') {
            updateSQL += ', status = ?';
            params.push('processing');
        }

        updateSQL += ' WHERE id = ?';
        params.push(id);

        const result = await execute(updateSQL, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const [order] = await query('SELECT * FROM orders WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Payment status updated',
            order
        });

    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status',
            error: error.message
        });
    }
};

/**
 * Update order payment status by Yoco checkout ID (for webhooks)
 */
export const updatePaymentByCheckoutId = async (checkoutId, status) => {
    try {
        const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid payment status: ${status}`);
        }

        let orderStatus = 'pending';
        if (status === 'paid') {
            orderStatus = 'processing';
        } else if (status === 'failed') {
            orderStatus = 'cancelled';
        }

        const result = await execute(
            `UPDATE orders 
       SET payment_status = ?, status = ?, updated_at = NOW() 
       WHERE yoco_checkout_id = ?`,
            [status, orderStatus, checkoutId]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Update payment by checkout ID error:', error);
        throw error;
    }
};

/**
 * Get all orders (admin only)
 * GET /api/orders/admin/all
 */
export const getAllOrders = async (req, res) => {
    try {
        const { status, payment_status, search, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let conditions = [];
        let params = [];

        if (status) {
            conditions.push('o.status = ?');
            params.push(status);
        }
        if (payment_status) {
            conditions.push('o.payment_status = ?');
            params.push(payment_status);
        }
        if (search) {
            conditions.push('(o.order_number LIKE ? OR o.shipping_address LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const orders = await query(
            `SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
             FROM orders o
             ${whereClause}
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        const [{ total }] = await query(
            `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
            params
        );

        res.status(200).json({
            success: true,
            orders: orders.map(order => ({
                ...order,
                shipping_address: JSON.parse(order.shipping_address || '{}'),
                billing_address: JSON.parse(order.billing_address || '{}')
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
};

/**
 * Update order status (admin only)
 * PATCH /api/orders/admin/:id/status
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const result = await execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const [order] = await query('SELECT * FROM orders WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            order: {
                ...order,
                shipping_address: JSON.parse(order.shipping_address || '{}'),
                billing_address: JSON.parse(order.billing_address || '{}')
            }
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
    }
};

/**
 * Get order items for a specific order (admin)
 * GET /api/orders/admin/:id/items
 */
export const getOrderItems = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await query(
            'SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC',
            [id]
        );
        res.status(200).json({ success: true, items });
    } catch (error) {
        console.error('Get order items error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order items', error: error.message });
    }
};

export default {
    createOrder,
    getOrderById,
    getOrderByCheckoutId,
    getUserOrders,
    updatePaymentStatus,
    updatePaymentByCheckoutId,
    getAllOrders,
    updateOrderStatus,
    getOrderItems
};
