const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logAudit = require('../middleware/auditLogger');

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { deliveryType, address, pickupDate } = req.body;

    if (!deliveryType || !['home_delivery', 'store_pickup'].includes(deliveryType)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery type. Must be home_delivery or store_pickup' });
    }

    if (deliveryType === 'home_delivery' && (!address || !address.trim())) {
      return res.status(400).json({ success: false, message: 'Delivery address is required for home delivery' });
    }

    if (deliveryType === 'store_pickup') {
      if (!pickupDate) {
        return res.status(400).json({ success: false, message: 'Pickup date is required for store pickup' });
      }

      // Check pickup capacity (Limit: 10 orders per day)
      const existingPickupCount = await Order.countDocuments({
        deliveryType: 'store_pickup',
        pickupDate: pickupDate,
        status: { $ne: 'CANCELLED' }
      });

      if (existingPickupCount >= 10) {
        return res.status(400).json({
          success: false,
          message: `Store pickup is fully booked for date ${pickupDate}. Maximum capacity of 10 orders reached. Please select a different date.`
        });
      }
    }

    // Fetch user cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Revalidate stock and calculate backend total
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} is no longer available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product '${product.name}'. Available: ${product.stock}, requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const total = subtotal;

    // Create Order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      total,
      deliveryType,
      address: deliveryType === 'home_delivery' ? address.trim() : '',
      pickupDate: deliveryType === 'store_pickup' ? pickupDate : null,
      status: 'PLACED'
    });

    // Reduce Product Inventory Stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear User Cart
    cart.items = [];
    await cart.save();

    logAudit('CREATE_ORDER', req.user, { orderId: order._id, total, deliveryType });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders (Customer sees own; Staff/Admin sees all)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    let query = {};

    // Customer only sees own orders
    if (req.user.role === 'customer') {
      query.userId = req.user._id;
    } else {
      // Staff/Admin can filter by status or deliveryType
      if (req.query.status) query.status = req.query.status;
      if (req.query.deliveryType) query.deliveryType = req.query.deliveryType;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check: Customer can only view their own order
    if (req.user.role === 'customer' && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Staff/Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'READY_FOR_PICKUP',
      'PICKED_UP',
      'CANCELLED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Handle cancellation by staff
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      // Restock inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = status;
    await order.save();

    logAudit('UPDATE_ORDER_STATUS', req.user, { orderId: order._id, newStatus: status });

    res.json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Customer before preparation, or Staff/Admin)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    if (req.user.role === 'customer' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Business Rule: Cancellation allowed ONLY before preparation (PLACED or CONFIRMED)
    if (req.user.role === 'customer' && !['PLACED', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in state '${order.status}'. Cancellation is only allowed before order preparation starts.`
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Restore Inventory Stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'CANCELLED';
    await order.save();

    logAudit('CANCEL_ORDER', req.user, { orderId: order._id, cancelledBy: req.user.role });

    res.json({ success: true, message: 'Order cancelled successfully and stock restored', order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
