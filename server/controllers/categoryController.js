const Category = require('../models/Category');
const Product = require('../models/Product');
const logAudit = require('../middleware/auditLogger');

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({ name: name.trim() });
    logAudit('CREATE_CATEGORY', req.user, { categoryId: category._id, name: category.name });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.name = name.trim();
    await category.save();

    logAudit('UPDATE_CATEGORY', req.user, { categoryId: category._id, name: category.name });

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products exist under this category
    const productCount = await Product.countDocuments({ categoryId: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} assigned products. Reassign or delete products first.`
      });
    }

    await category.deleteOne();
    logAudit('DELETE_CATEGORY', req.user, { categoryId: req.params.id });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
