/**
 * Payment Routes
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getAllPayments,
  processCODPayment
} = require('../controllers/paymentController');

// Protected routes (require authentication)
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/process', protect, processCODPayment);
router.get('/status/:orderId', protect, getPaymentStatus);

// Admin only routes
router.get('/all', protect, authorize('admin'), getAllPayments);

module.exports = router;

