const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    deliveryType: {
      type: String,
      enum: ['home_delivery', 'store_pickup'],
      required: true
    },
    address: {
      type: String,
      default: ''
    },
    pickupDate: {
      type: String, // YYYY-MM-DD string format for easy capacity checking
      default: null
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'CANCELLED'
      ],
      default: 'PLACED'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
