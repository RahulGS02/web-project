/**
 * Invoice Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateOrderInvoice,
  downloadInvoice,
  getInvoiceStatus
} = require('../controllers/invoiceController');

// All routes require authentication
router.post('/generate/:orderId', protect, generateOrderInvoice);
router.get('/download/:orderId', protect, downloadInvoice);
router.get('/status/:orderId', protect, getInvoiceStatus);

module.exports = router;

