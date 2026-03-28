/**
 * Invoice Controller
 * Handles invoice generation and download
 */

const ExcelHandler = require('../utils/excelHandler');
const { generateInvoice, getInvoicePath, invoiceExists } = require('../utils/invoiceGenerator');
const { calculateOrderFinancials } = require('../utils/financialCalculator');
const secureUrlGenerator = require('../utils/secureUrlGenerator');
const path = require('path');
const fs = require('fs');

// Initialize Excel handlers
const ordersDB = new ExcelHandler('orders.xlsx');
const orderItemsDB = new ExcelHandler('order_items.xlsx');
const usersDB = new ExcelHandler('users.xlsx');

/**
 * Generate invoice for an order
 * POST /api/invoice/generate/:orderId
 */
exports.generateOrderInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
    const order = await ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Check if order is paid
    if (order.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice can only be generated for paid orders'
      });
    }

    // Get order items
    const allOrderItems = await orderItemsDB.findAll();
    const orderItems = allOrderItems.filter(item => item.order_id === orderId);

    if (orderItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No items found for this order'
      });
    }

    // Get user details
    const user = await usersDB.findById(order.user_id, 'user_id');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate financials
    const financials = calculateOrderFinancials(orderItems);

    // Generate invoice
    const { fileName, filePath } = await generateInvoice(order, orderItems, user, financials);

    // Update order with invoice path
    await ordersDB.update(orderId, {
      invoice_generated: true,
      invoice_path: filePath,
      invoice_generated_at: new Date().toISOString()
    }, 'order_id');

    res.status(200).json({
      success: true,
      message: 'Invoice generated successfully',
      data: {
        fileName,
        downloadUrl: `/api/invoice/download/${orderId}`
      }
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

/**
 * Download invoice
 * GET /api/invoice/download/:orderId
 */
exports.downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
    const order = await ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this invoice'
      });
    }

    // Check if invoice exists
    if (!invoiceExists(orderId)) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found. Please generate invoice first.'
      });
    }

    const filePath = getInvoicePath(orderId);
    const fileName = `invoice_${orderId}.xlsx`;

    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download invoice',
      error: error.message
    });
  }
};

/**
 * Check invoice status
 * GET /api/invoice/status/:orderId
 */
exports.getInvoiceStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const exists = invoiceExists(orderId);

    res.status(200).json({
      success: true,
      data: {
        order_id: orderId,
        invoice_generated: exists,
        invoice_generated_at: order.invoice_generated_at || null,
        can_generate: order.payment_status === 'paid',
        downloadUrl: exists ? `/api/invoice/download/${orderId}` : null
      }
    });

  } catch (error) {
    console.error('Get invoice status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoice status',
      error: error.message
    });
  }
};

/**
 * Download invoice with secure token validation
 * GET /api/invoice/secure-download/:orderId?token=xxx
 */
exports.downloadSecureInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Security token is required'
      });
    }

    // Verify token
    const decoded = secureUrlGenerator.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired download link'
      });
    }

    // Verify order ID matches token
    if (decoded.orderId !== orderId) {
      return res.status(403).json({
        success: false,
        message: 'Token does not match order ID'
      });
    }

    // Get order
    const order = await ordersDB.findById(orderId, 'order_id');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if invoice exists
    const invoicePath = getInvoicePath(orderId);
    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found. Please generate it first.'
      });
    }

    // Send file
    const fileName = `invoice_${orderId.slice(0, 8)}.xlsx`;
    res.download(invoicePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to download invoice'
          });
        }
      }
    });

  } catch (error) {
    console.error('Secure download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download invoice',
      error: error.message
    });
  }
};

