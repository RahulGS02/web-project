const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/notifications/send-order-confirmation
 * @desc    Send WhatsApp order confirmation
 * @access  Private
 */
router.post('/send-order-confirmation', protect, notificationController.sendOrderConfirmation);

/**
 * @route   GET /api/notifications/logs
 * @desc    Get notification logs
 * @access  Private/Admin
 */
router.get('/logs', protect, authorize('admin'), notificationController.getNotificationLogs);

/**
 * @route   POST /api/notifications/retry/:notificationId
 * @desc    Retry failed notification
 * @access  Private/Admin
 */
router.post('/retry/:notificationId', protect, authorize('admin'), notificationController.retryNotification);

/**
 * @route   POST /api/notifications/test
 * @desc    Test WhatsApp connection
 * @access  Private/Admin
 */
router.post('/test', protect, authorize('admin'), notificationController.testWhatsApp);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private/Admin
 */
router.get('/stats', protect, authorize('admin'), notificationController.getNotificationStats);

module.exports = router;

