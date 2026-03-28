const whatsappService = require('../services/whatsappService');
const secureUrlGenerator = require('../utils/secureUrlGenerator');
const ExcelHandler = require('../utils/excelHandler');
const path = require('path');
const fs = require('fs');

// Initialize notifications Excel handler
const notificationsDB = new ExcelHandler('notifications.xlsx');

/**
 * Send order confirmation WhatsApp message
 */
exports.sendOrderConfirmation = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get order details
    const ordersDB = req.app.locals.ordersDB;
    const usersDB = req.app.locals.usersDB;
    
    const order = ordersDB.findById(orderId, 'order_id');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get customer details
    const customer = usersDB.findById(order.user_id, 'user_id');
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has phone number
    if (!customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number not available'
      });
    }

    // Generate secure invoice link
    const invoiceLink = secureUrlGenerator.generatePublicInvoiceLink(orderId);

    // Prepare notification data
    const notificationData = {
      customerName: customer.name,
      customerPhone: customer.phone,
      orderId: orderId,
      amount: order.total_amount.toFixed(2),
      invoiceLink: invoiceLink
    };

    // Send WhatsApp message
    const result = await whatsappService.sendOrderConfirmation(notificationData);

    // Log notification
    const notificationLog = {
      notification_id: require('uuid').v4(),
      order_id: orderId,
      user_id: customer.user_id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      notification_type: 'order_confirmation',
      message_status: result.success ? 'sent' : 'failed',
      message_id: result.messageId || null,
      provider: result.provider || null,
      error_message: result.error || null,
      invoice_link: invoiceLink,
      created_at: new Date().toISOString()
    };

    notificationsDB.create(notificationLog);

    res.json({
      success: result.success,
      message: result.success ? 'WhatsApp notification sent successfully' : 'Failed to send notification',
      data: {
        notificationId: notificationLog.notification_id,
        messageId: result.messageId,
        status: notificationLog.message_status,
        invoiceLink: invoiceLink
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Get notification logs (Admin only)
 */
exports.getNotificationLogs = async (req, res) => {
  try {
    const { orderId, status, startDate, endDate } = req.query;
    
    let notifications = notificationsDB.findAll();

    // Apply filters
    if (orderId) {
      notifications = notifications.filter(n => n.order_id === orderId);
    }

    if (status) {
      notifications = notifications.filter(n => n.message_status === status);
    }

    if (startDate) {
      notifications = notifications.filter(n => 
        new Date(n.created_at) >= new Date(startDate)
      );
    }

    if (endDate) {
      notifications = notifications.filter(n => 
        new Date(n.created_at) <= new Date(endDate)
      );
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Get notification logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification logs',
      error: error.message
    });
  }
};

/**
 * Retry failed notification
 */
exports.retryNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = notificationsDB.findById(notificationId, 'notification_id');
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Prepare notification data
    const notificationData = {
      customerName: notification.customer_name,
      customerPhone: notification.customer_phone,
      orderId: notification.order_id,
      amount: notification.amount,
      invoiceLink: notification.invoice_link
    };

    // Retry sending
    const result = await whatsappService.sendOrderConfirmation(notificationData);

    // Update notification log
    notification.message_status = result.success ? 'sent' : 'failed';
    notification.message_id = result.messageId || notification.message_id;
    notification.error_message = result.error || null;
    notification.retry_at = new Date().toISOString();

    notificationsDB.update(notificationId, notification, 'notification_id');

    res.json({
      success: result.success,
      message: result.success ? 'Notification resent successfully' : 'Retry failed',
      data: notification
    });
  } catch (error) {
    console.error('Retry notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry notification',
      error: error.message
    });
  }
};

/**
 * Test WhatsApp connection
 */
exports.testWhatsApp = async (req, res) => {
  try {
    const { testPhone } = req.body;

    if (!testPhone) {
      return res.status(400).json({
        success: false,
        message: 'Test phone number is required'
      });
    }

    const result = await whatsappService.testConnection(testPhone);

    res.json(result);
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    res.status(500).json({
      success: false,
      message: 'WhatsApp test failed',
      error: error.message
    });
  }
};

/**
 * Get notification statistics (Admin)
 */
exports.getNotificationStats = async (req, res) => {
  try {
    const notifications = notificationsDB.findAll();

    const stats = {
      total: notifications.length,
      sent: notifications.filter(n => n.message_status === 'sent').length,
      failed: notifications.filter(n => n.message_status === 'failed').length,
      today: notifications.filter(n => {
        const today = new Date().toDateString();
        return new Date(n.created_at).toDateString() === today;
      }).length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

