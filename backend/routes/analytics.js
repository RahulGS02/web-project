const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getSalesReport
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboardAnalytics);
router.get('/sales', protect, authorize('admin'), getSalesReport);

module.exports = router;

