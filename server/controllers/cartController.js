const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'name price stock image description categoryId'
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart (Add item or adjust quantity)
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items available in stock.`
        });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add to cart. Only ${product.stock} items available in stock.`
        });
      }
      cart.items.push({ productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate('items.productId', 'name price stock image description categoryId');

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:productId (Set exact item quantity)
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Valid quantity is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot set quantity to ${quantity}. Maximum available stock is ${product.stock}.`
        });
      }
      cart.items[itemIndex].quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate('items.productId', 'name price stock image description categoryId');

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:productId (Remove item from cart)
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId', 'name price stock image description categoryId');

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
