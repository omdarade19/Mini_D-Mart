const express = require('express');
const router = express.Router();
const {
  createReturnRequest,
  getReturnRequests,
  processReturnRequest
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createReturnRequest);
router.get('/', getReturnRequests);
router.patch('/:id', authorize('staff', 'admin'), processReturnRequest);

module.exports = router;
