const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('staff', 'admin'), createProduct);
router.put('/:id', protect, authorize('staff', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('staff', 'admin'), deleteProduct);

module.exports = router;
