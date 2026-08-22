const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const Product = require('../models/Product');
const logAudit = require('../middleware/auditLogger');

// @desc    Request a return or exchange
// @route   POST /api/returns
// @access  Private (Customer)
const createReturnRequest = async (req, res, next) => {
  try {
    const { orderId, productId, type, reason } = req.body;

    if (!orderId || !productId || !type || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide orderId, productId, type (return/exchange), and reason' });
    }

    if (!['return', 'exchange'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be return or exchange' });
    }

    // Verify order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization check
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to request return for this order' });
    }

    // Business Rule 1: Order must be DELIVERED or PICKED_UP
    if (!['DELIVERED', 'PICKED_UP'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Return/Exchange is only allowed for delivered or picked up orders. Current status: ${order.status}`
      });
    }

    // Business Rule 2: 7-day window from order creation/delivery
    const orderDate = new Date(order.updatedAt || order.createdAt);
    const diffTime = Math.abs(new Date() - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return res.status(400).json({
        success: false,
        message: `Return/Exchange window has expired. Requests must be placed within 7 days of delivery.`
      });
    }

    // Check if product is in order
    const orderItem = order.items.find((item) => item.productId.toString() === productId);
    if (!orderItem) {
      return res.status(400).json({ success: false, message: 'Product is not part of this order' });
    }

    // Check duplicate pending or approved return request
    const existingReturn = await ReturnRequest.findOne({
      orderId,
      productId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: `A return/exchange request for this item is already ${existingReturn.status}`
      });
    }

    const returnRequest = await ReturnRequest.create({
      orderId,
      userId: req.user._id,
      productId,
      type,
      reason: reason.trim(),
      status: 'pending'
    });

    logAudit('CREATE_RETURN_REQUEST', req.user, { returnId: returnRequest._id, type, orderId });

    res.status(201).json({
      success: true,
      message: 'Return/Exchange request submitted successfully',
      returnRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get return requests (Customer sees own; Staff/Admin sees all)
// @route   GET /api/returns
// @access  Private
const getReturnRequests = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.userId = req.user._id;
    } else {
      if (req.query.status) query.status = req.query.status;
    }

    const returnRequests = await ReturnRequest.find(query)
      .populate('userId', 'name email')
      .populate('orderId', 'deliveryType status createdAt')
      .populate('productId', 'name price image stock')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: returnRequests.length, returnRequests });
  } catch (error) {
    next(error);
  }
};

// @desc    Process (Approve/Reject) return or exchange request
// @route   PATCH /api/returns/:id
// @access  Private (Staff/Admin)
const processReturnRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const returnRequest = await ReturnRequest.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    if (returnRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Return request is already ${returnRequest.status}` });
    }

    const order = await Order.findById(returnRequest.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated order not found' });
    }

    const orderItem = order.items.find(
      (item) => item.productId.toString() === returnRequest.productId.toString()
    );
    const qtyToReturn = orderItem ? orderItem.quantity : 1;

    // Inventory adjustments upon approval
    if (status === 'approved') {
      const product = await Product.findById(returnRequest.productId);

      if (returnRequest.type === 'return') {
        // Restock returned product
        if (product) {
          product.stock += qtyToReturn;
          await product.save();
        }
      } else if (returnRequest.type === 'exchange') {
        // Exchange requires replacement stock check
        if (!product || product.stock < qtyToReturn) {
          return res.status(400).json({
            success: false,
            message: `Cannot approve exchange: Insufficient replacement stock available (${product ? product.stock : 0} in stock)`
          });
        }
        // Restock returned item, deduct replacement item (net 0 for same item, or check stock requirement)
        // Exchange sends 1 replacement product out -> deduct replacement stock
        product.stock -= qtyToReturn;
        await product.save();
      }
    }

    returnRequest.status = status;
    await returnRequest.save();

    logAudit('PROCESS_RETURN_REQUEST', req.user, {
      returnId: returnRequest._id,
      status,
      type: returnRequest.type
    });

    res.json({
      success: true,
      message: `Return request ${status} successfully`,
      returnRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReturnRequest,
  getReturnRequests,
  processReturnRequest
};
