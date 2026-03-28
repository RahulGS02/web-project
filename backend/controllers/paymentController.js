/**
 * Payment Controller
 * Handles Razorpay payment integration
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const ExcelHandler = require('../utils/excelHandler');
const { calculateOrderFinancials, convertToPaise, validatePaymentAmount } = require('../utils/financialCalculator');
const whatsappService = require('../services/whatsappService');
const secureUrlGenerator = require('../utils/secureUrlGenerator');
const { generateInvoice } = require('../utils/invoiceGenerator');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Initialize Excel handlers
const ordersDB = new ExcelHandler('orders.xlsx');
const paymentsDB = new ExcelHandler('payments.xlsx');
const usersDB = new ExcelHandler('users.xlsx');
const orderItemsDB = new ExcelHandler('order_items.xlsx');

/**
 * Create Razorpay order
 * POST /api/payment/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get order details
    const order = await ordersDB.findById(order_id, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Convert amount to paise
    const amountInPaise = convertToPaise(order.total_amount);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order_id,
      notes: {
        order_id: order_id,
        user_id: order.user_id
      }
    });

    // Update order with Razorpay order ID
    await ordersDB.update(order_id, {
      razorpay_order_id: razorpayOrder.id,
      payment_status: 'pending'
    }, 'order_id');

    res.status(200).json({
      success: true,
      data: {
        razorpay_order_id: razorpayOrder.id,
        amount: order.total_amount,
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify payment signature
 * POST /api/payment/verify
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get order details
    const order = await ordersDB.findById(order_id, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await ordersDB.update(order_id, {
      payment_status: 'paid',
      razorpay_payment_id: razorpay_payment_id,
      status: 'processing',
      paid_at: new Date().toISOString()
    }, 'order_id');

    // NOW reduce stock after successful payment
    const medicinesDB = new ExcelHandler('medicines.xlsx');
    const allOrderItems = await orderItemsDB.findAll();
    const orderItems = allOrderItems.filter(item => item.order_id === order_id);

    for (const item of orderItems) {
      const medicine = medicinesDB.findById(item.medicine_id, 'medicine_id');
      if (medicine) {
        medicinesDB.update(
          item.medicine_id,
          { stock_quantity: medicine.stock_quantity - item.quantity },
          'medicine_id'
        );
      }
    }

    // Log payment
    const paymentLog = {
      payment_id: uuidv4(),
      order_id: order_id,
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      user_id: order.user_id,
      amount: order.total_amount,
      payment_status: 'success',
      created_at: new Date().toISOString()
    };

    await paymentsDB.insert(paymentLog);

    // Trigger WhatsApp notification and invoice generation (async, don't wait)
    setImmediate(async () => {
      try {
        // Get user details
        const user = await usersDB.findById(order.user_id, 'user_id');

        // Get order items
        const allOrderItems = await orderItemsDB.findAll();
        const orderItems = allOrderItems.filter(item => item.order_id === order_id);

        // Calculate financials
        const financials = calculateOrderFinancials(orderItems);

        // Generate invoice
        await generateInvoice(order, orderItems, user, financials);

        // Generate secure invoice link
        const invoiceLink = secureUrlGenerator.generatePublicInvoiceLink(order_id);

        // Send WhatsApp notification
        if (user.phone) {
          await whatsappService.sendOrderConfirmation({
            customerName: user.name,
            customerPhone: user.phone,
            orderId: order_id,
            amount: order.total_amount.toFixed(2),
            invoiceLink: invoiceLink
          });
        }
      } catch (notificationError) {
        console.error('Post-payment notification error:', notificationError);
        // Don't fail the payment verification if notification fails
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order_id: order_id,
        payment_id: razorpay_payment_id
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * Get payment status
 * GET /api/payment/status/:orderId
 */
exports.getPaymentStatus = async (req, res) => {
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

    res.status(200).json({
      success: true,
      data: {
        order_id: order.order_id,
        payment_status: order.payment_status || 'pending',
        razorpay_payment_id: order.razorpay_payment_id || null,
        total_amount: order.total_amount,
        paid_at: order.paid_at || null
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

/**
 * Get all payments (Admin only)
 * GET /api/payment/all
 */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentsDB.findAll();

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

