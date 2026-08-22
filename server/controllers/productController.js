const Product = require('../models/Product');
const logAudit = require('../middleware/auditLogger');

// GET /api/products
// Optional query params: category, search, sort
const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category) {
      query.categoryId = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort(sortOptions);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, categoryId, price, stock, image, description } = req.body;

    if (!name || !categoryId || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide name, categoryId, price, and stock' });
    }

    const product = await Product.create({
      name,
      categoryId,
      price: Number(price),
      stock: Number(stock),
      image: image || undefined,
      description: description || ''
    });

    logAudit('CREATE_PRODUCT', req.user, { productId: product._id, name: product.name, stock: product.stock });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { name, categoryId, price, stock, image, description } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (image !== undefined) product.image = image;
    if (description !== undefined) product.description = description;

    await product.save();

    logAudit('UPDATE_PRODUCT', req.user, { productId: product._id, name: product.name, stock: product.stock, price: product.price });

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    logAudit('DELETE_PRODUCT', req.user, { productId: req.params.id, name: product.name });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
