import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { reduceInventory, increaseInventory } from './inventory.controller.js';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod = 'cod',
            notes = '',
            shippingFee = 30000, // Default shipping fee
            discountAmount = 0
        } = req.body;

        const customerId = req.userId;
        const customerInfo = req.user; // From auth middleware

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        // Process each item and calculate total
        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    message: `Product not found: ${item.productId}`
                });
            }

            if (product.status !== 'available') {
                return res.status(400).json({
                    message: `Product ${product.productName} is not available`
                });
            }

            if (product.inventory < item.quantity) {
                return res.status(400).json({
                    message: `Not enough inventory for ${product.productName}. Available: ${product.inventory}`
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            processedItems.push({
                productId: product._id,
                productName: product.productName,
                price: product.price,
                quantity: item.quantity,
                variant: item.variant || {},
                image: product.image
            });
        }

        // Create order
        const order = new Order({
            customerId,
            customerInfo: {
                name: customerInfo.name,
                email: customerInfo.email
            },
            items: processedItems,
            totalAmount,
            shippingFee,
            discountAmount,
            paymentMethod,
            shippingAddress,
            notes,
            status: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
        });

        await order.save();

        // Reduce inventory for each item
        for (const item of items) {
            const result = await reduceInventory(item.productId, item.quantity);
            if (!result.success) {
                // If inventory reduction fails, we should handle rollback
                console.error(`Failed to reduce inventory for ${item.productId}:`, result.message);
            }
        }

        // Populate product details
        await order.populate('items.productId');

        res.status(201).json({
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách đơn hàng (Admin) với pagination và filters
export const getOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = '',
            paymentStatus = '',
            search = '',
            sortBy = 'newest',
            startDate = '',
            endDate = ''
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        let filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (paymentStatus && paymentStatus !== 'all') {
            filter.paymentStatus = paymentStatus;
        }

        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customerInfo.name': { $regex: search, $options: 'i' } },
                { 'customerInfo.email': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
            ];
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Build sort
        let sort = {};
        switch (sortBy) {
            case 'oldest':
                sort.createdAt = 1;
                break;
            case 'amount_asc':
                sort.finalAmount = 1;
                break;
            case 'amount_desc':
                sort.finalAmount = -1;
                break;
            case 'newest':
            default:
                sort.createdAt = -1;
                break;
        }

        // Execute query
        const orders = await Order
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('customerId', 'name email')
            .populate('items.productId', 'productName image');

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limitNum);

        res.json({
            orders,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalOrders,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (req, res) => {
    try {
        const order = await Order
            .findById(req.params.id)
            .populate('customerId', 'name email')
            .populate('items.productId', 'productName image inventory status')
            .populate('statusHistory.updatedBy', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái đơn hàng (Admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note = '' } = req.body;
        const orderId = req.params.id;
        const adminId = req.userId;

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const oldStatus = order.status;

        // Business logic for status transitions
        if (oldStatus === 'delivered' && status !== 'delivered') {
            return res.status(400).json({
                message: 'Cannot change status from delivered'
            });
        }

        if (oldStatus === 'cancelled' && status !== 'cancelled') {
            return res.status(400).json({
                message: 'Cannot change status from cancelled'
            });
        }

        // Handle inventory when cancelling
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            // Restore inventory
            for (const item of order.items) {
                await increaseInventory(item.productId, item.quantity);
            }
        }

        // Update status
        order.status = status;

        // Add to status history
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            note,
            updatedBy: adminId
        });

        // Set delivery date if delivered
        if (status === 'delivered') {
            order.actualDelivery = new Date();
            order.paymentStatus = 'paid'; // Assume payment completed on delivery for COD
        }

        await order.save();

        await order.populate('statusHistory.updatedBy', 'name');

        res.json({
            message: 'Order status updated successfully',
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái thanh toán (Admin only)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, note = '' } = req.body;
        const orderId = req.params.id;

        if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = paymentStatus;

        // Add to status history
        order.statusHistory.push({
            status: `payment_${paymentStatus}`,
            timestamp: new Date(),
            note: note || `Payment status changed to ${paymentStatus}`,
            updatedBy: req.userId
        });

        await order.save();

        res.json({
            message: 'Payment status updated successfully',
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đơn hàng của customer (User only)
export const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.userId;
        const {
            page = 1,
            limit = 10,
            status = ''
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let filter = { customerId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const orders = await Order
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('items.productId', 'productName image');

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limitNum);

        res.json({
            orders,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalOrders,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hủy đơn hàng (Customer only, chỉ khi pending)
export const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const customerId = req.userId;
        const { reason = '' } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            customerId: customerId
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                message: 'Can only cancel pending orders'
            });
        }

        // Restore inventory
        for (const item of order.items) {
            await increaseInventory(item.productId, item.quantity);
        }

        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: reason || 'Cancelled by customer'
        });

        await order.save();

        res.json({
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const stats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$finalAmount' }
                }
            }
        ]);

        const totalOrders = await Order.countDocuments({
            createdAt: { $gte: startDate }
        });

        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$finalAmount' }
                }
            }
        ]);

        res.json({
            period: `${period} days`,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            statusBreakdown: stats
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};