const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCategories);
router.post('/', protect, authorize('staff', 'admin'), createCategory);
router.put('/:id', protect, authorize('staff', 'admin'), updateCategory);
router.delete('/:id', protect, authorize('staff', 'admin'), deleteCategory);

module.exports = router;
