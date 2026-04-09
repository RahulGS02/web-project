/**
 * Quote Routes
 * Handles quote-based order management endpoints
 */

const express = require('express');
const router = express.Router();
const {
  createQuoteRequest,
  getQuoteRequests,
  getMyQuotes,
  setPrices,
  acceptQuote,
  modifyQuote,
  sendNegotiationMessage,
  getNegotiationMessages,
  getQuoteHistory,
  rejectQuote
} = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/request', protect, createQuoteRequest);
router.get('/my-quotes', protect, getMyQuotes);
router.post('/:orderId/accept', protect, acceptQuote);
router.post('/:orderId/modify', protect, modifyQuote);
router.post('/:orderId/reject', protect, rejectQuote);

// Admin routes
router.get('/requests', protect, authorize('admin'), getQuoteRequests);
router.post('/:orderId/set-prices', protect, authorize('admin'), setPrices);

// Shared routes (customer and admin)
router.post('/:orderId/negotiate', protect, sendNegotiationMessage);
router.get('/:orderId/negotiations', protect, getNegotiationMessages);
router.get('/:orderId/history', protect, getQuoteHistory);

module.exports = router;
