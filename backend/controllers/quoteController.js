/**
 * Quote Controller
 * Handles quote-based order management
 */

const { v4: uuidv4 } = require('uuid');
const { ordersDB, orderItemsDB, medicinesDB } = require('../config/database');
const ExcelHandler = require('../utils/excelHandler');

// Initialize quote-specific databases
const quoteHistoryDB = new ExcelHandler('quote_history.xlsx');
const orderNegotiationsDB = new ExcelHandler('order_negotiations.xlsx');

/**
 * @desc    Create a new quote request (customer submits cart)
 * @route   POST /api/quotes/request
 * @access  Private (Customer)
 */
exports.createQuoteRequest = async (req, res) => {
  try {
    const { items, shipping_address, customer_notes, prescription_ids } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for quote request'
      });
    }

    // Validate items and check availability
    const quoteItems = [];
    for (const item of items) {
      const medicine = medicinesDB.findById(item.medicine_id, 'medicine_id');

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine with ID ${item.medicine_id} not found`
        });
      }

      if (medicine.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock_quantity}`
        });
      }

      quoteItems.push({
        medicine_id: item.medicine_id,
        medicine_name: medicine.name,
        category: medicine.category,
        quantity: item.quantity,
        original_price: medicine.price, // Store catalog price as reference
        admin_set_price: null, // Admin will set this
        discount_percent: 0,
        customer_notes: item.customer_notes || '',
        admin_notes: '',
        is_substitution: false,
        substitution_for: null,
        price_locked: false
      });
    }

    // Create quote request (order with status QUOTE_REQUESTED)
    const order_id = uuidv4();
    const newQuoteRequest = {
      order_id,
      user_id: req.user.user_id,
      total_amount: 0, // Will be set when admin sends quote
      subtotal: 0,
      gst_amount: 0,
      platform_fee: 0,
      delivery_charges: 0,
      status: 'pending', // Order status
      quote_status: 'QUOTE_REQUESTED', // Quote-specific status
      quote_version: 1,
      quote_valid_until: null,
      payment_status: 'awaiting_quote',
      shipping_address: shipping_address || '',
      billing_address: shipping_address || '',
      payment_method: null, // Will be chosen after quote acceptance
      customer_notes: customer_notes || '',
      admin_notes: '',
      previous_quote_id: null,
      negotiation_count: 0,
      quote_sent_at: null,
      quote_accepted_at: null,
      is_price_hidden: true, // Prices hidden in quote mode
      prescription_ids: prescription_ids ? JSON.stringify(prescription_ids) : null,
      created_at: new Date().toISOString()
    };

    // Save quote request
    ordersDB.create(newQuoteRequest);

    // Create order items (without prices yet)
    for (const item of quoteItems) {
      const orderItem = {
        order_item_id: uuidv4(),
        order_id,
        ...item,
        price: 0, // Will be set by admin
        subtotal: 0,
        created_at: new Date().toISOString()
      };
      orderItemsDB.create(orderItem);
    }

    // Log in quote history
    const historyEntry = {
      history_id: uuidv4(),
      order_id,
      version: 1,
      changed_by: 'CUSTOMER',
      changes_description: 'Quote request created',
      items_snapshot: JSON.stringify(quoteItems),
      total_at_version: 0,
      created_at: new Date().toISOString()
    };
    quoteHistoryDB.create(historyEntry);

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully. Admin will review and send you a quote.',
      data: {
        order_id,
        quote_status: 'QUOTE_REQUESTED',
        items_count: quoteItems.length,
        estimated_response_time: '24 hours'
      }
    });

  } catch (error) {
    console.error('Create quote request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get all quote requests (Admin view)
 * @route   GET /api/quotes/requests
 * @access  Private (Admin)
 */
exports.getQuoteRequests = async (req, res) => {
  try {
    const { status } = req.query;

    // Get all quote requests
    let quotes = ordersDB.readData().filter(order => order.is_price_hidden === true);

    // Filter by status if provided
    if (status) {
      quotes = quotes.filter(q => q.quote_status === status);
    }

    // Attach items to each quote
    const quotesWithItems = quotes.map(quote => {
      const items = orderItemsDB.findAll({ order_id: quote.order_id });
      return { ...quote, items };
    });

    // Sort by creation date (newest first)
    quotesWithItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.status(200).json({
      success: true,
      count: quotesWithItems.length,
      data: quotesWithItems
    });

  } catch (error) {
    console.error('Get quote requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer's quote requests
 * @route   GET /api/quotes/my-quotes
 * @access  Private (Customer)
 */
exports.getMyQuotes = async (req, res) => {
  try {
    // Get customer's quotes
    const quotes = ordersDB.findAll({
      user_id: req.user.user_id,
      is_price_hidden: true
    });

    // Attach items to each quote
    const quotesWithItems = quotes.map(quote => {
      const items = orderItemsDB.findAll({ order_id: quote.order_id });
      return { ...quote, items };
    });

    // Sort by creation date (newest first)
    quotesWithItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.status(200).json({
      success: true,
      count: quotesWithItems.length,
      data: quotesWithItems
    });

  } catch (error) {
    console.error('Get my quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Admin sets prices for quote
 * @route   POST /api/quotes/:orderId/set-prices
 * @access  Private (Admin)
 */
exports.setPrices = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, delivery_charges, admin_notes, quote_valid_hours } = req.body;

    const order = ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Quote request not found'
      });
    }

    if (order.quote_status !== 'QUOTE_REQUESTED' && order.quote_status !== 'QUOTE_MODIFIED') {
      return res.status(400).json({
        success: false,
        message: `Cannot set prices for quote in status: ${order.quote_status}`
      });
    }

    let subtotal = 0;

    // Update each item with admin-set prices
    for (const itemUpdate of items) {
      const orderItem = orderItemsDB.findById(itemUpdate.order_item_id, 'order_item_id');

      if (!orderItem) continue;

      const updatedItem = {
        ...orderItem,
        admin_set_price: itemUpdate.admin_set_price,
        discount_percent: itemUpdate.discount_percent || 0,
        admin_notes: itemUpdate.admin_notes || '',
        price: itemUpdate.admin_set_price,
        subtotal: itemUpdate.admin_set_price * orderItem.quantity,
        price_locked: true
      };

      orderItemsDB.update(itemUpdate.order_item_id, updatedItem, 'order_item_id');
      subtotal += updatedItem.subtotal;
    }

    // Calculate financials
    const gstRate = 0.12;
    const platformFeeRate = 0.01;
    const gstAmount = subtotal * gstRate;
    const platformFee = subtotal * platformFeeRate;
    const totalAmount = subtotal + gstAmount + platformFee + (delivery_charges || 0);

    // Calculate quote validity
    const quoteValidUntil = new Date();
    quoteValidUntil.setHours(quoteValidUntil.getHours() + (quote_valid_hours || 48));

    // Update order
    const updatedOrder = {
      ...order,
      subtotal,
      gst_amount: gstAmount,
      platform_fee: platformFee,
      delivery_charges: delivery_charges || 0,
      total_amount: totalAmount,
      quote_status: 'QUOTE_SENT',
      quote_valid_until: quoteValidUntil.toISOString(),
      admin_notes: admin_notes || '',
      quote_sent_at: new Date().toISOString()
    };

    ordersDB.update(orderId, updatedOrder, 'order_id');

    // Log in history
    const historyEntry = {
      history_id: uuidv4(),
      order_id: orderId,
      version: order.quote_version,
      changed_by: 'ADMIN',
      changes_description: `Admin set prices. Total: ₹${totalAmount.toFixed(2)}`,
      items_snapshot: JSON.stringify(items),
      total_at_version: totalAmount,
      created_at: new Date().toISOString()
    };
    quoteHistoryDB.create(historyEntry);

    res.status(200).json({
      success: true,
      message: 'Quote sent to customer successfully',
      data: {
        order_id: orderId,
        quote_status: 'QUOTE_SENT',
        total_amount: totalAmount,
        quote_valid_until: quoteValidUntil.toISOString()
      }
    });

  } catch (error) {
    console.error('Set prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Customer accepts quote
 * @route   POST /api/quotes/:orderId/accept
 * @access  Private (Customer)
 */
exports.acceptQuote = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (order.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (order.quote_status !== 'QUOTE_SENT') {
      return res.status(400).json({
        success: false,
        message: 'Quote cannot be accepted in current status'
      });
    }

    // Check if quote is expired
    if (order.quote_valid_until && new Date(order.quote_valid_until) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Quote has expired. Please request a new quote.'
      });
    }

    // Update order
    const updatedOrder = {
      ...order,
      quote_status: 'QUOTE_ACCEPTED',
      quote_accepted_at: new Date().toISOString(),
      payment_status: 'awaiting_payment'
    };

    ordersDB.update(orderId, updatedOrder, 'order_id');

    // Log in history
    const historyEntry = {
      history_id: uuidv4(),
      order_id: orderId,
      version: order.quote_version,
      changed_by: 'CUSTOMER',
      changes_description: 'Customer accepted quote',
      items_snapshot: null,
      total_at_version: order.total_amount,
      created_at: new Date().toISOString()
    };
    quoteHistoryDB.create(historyEntry);

    res.status(200).json({
      success: true,
      message: 'Quote accepted. Proceed to payment.',
      data: {
        order_id: orderId,
        quote_status: 'QUOTE_ACCEPTED',
        total_amount: order.total_amount,
        payment_url: `/checkout/payment/${orderId}`
      }
    });

  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Customer modifies quote request
 * @route   POST /api/quotes/:orderId/modify
 * @access  Private (Customer)
 */
exports.modifyQuote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, customer_notes } = req.body;

    const order = ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (order.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update order items
    for (const itemUpdate of items) {
      if (itemUpdate.order_item_id) {
        // Update existing item
        const orderItem = orderItemsDB.findById(itemUpdate.order_item_id, 'order_item_id');
        if (orderItem) {
          orderItemsDB.update(itemUpdate.order_item_id, {
            ...orderItem,
            quantity: itemUpdate.quantity,
            customer_notes: itemUpdate.customer_notes || orderItem.customer_notes,
            price_locked: false // Unlock price for admin to review
          }, 'order_item_id');
        }
      }
    }

    // Update order
    const updatedOrder = {
      ...order,
      quote_status: 'QUOTE_MODIFIED',
      quote_version: order.quote_version + 1,
      previous_quote_id: orderId,
      negotiation_count: order.negotiation_count + 1,
      customer_notes: customer_notes || order.customer_notes,
      total_amount: 0, // Reset, admin will recalculate
      quote_sent_at: null,
      quote_valid_until: null
    };

    ordersDB.update(orderId, updatedOrder, 'order_id');

    // Log in history
    const historyEntry = {
      history_id: uuidv4(),
      order_id: orderId,
      version: updatedOrder.quote_version,
      changed_by: 'CUSTOMER',
      changes_description: `Customer modified quote (modification #${updatedOrder.negotiation_count})`,
      items_snapshot: JSON.stringify(items),
      total_at_version: 0,
      created_at: new Date().toISOString()
    };
    quoteHistoryDB.create(historyEntry);

    res.status(200).json({
      success: true,
      message: 'Quote modification sent to admin for review',
      data: {
        order_id: orderId,
        quote_status: 'QUOTE_MODIFIED',
        quote_version: updatedOrder.quote_version
      }
    });

  } catch (error) {
    console.error('Modify quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Send negotiation message
 * @route   POST /api/quotes/:orderId/negotiate
 * @access  Private
 */
exports.sendNegotiationMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message, attachments } = req.body;

    const order = ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Create negotiation message
    const negotiation = {
      negotiation_id: uuidv4(),
      order_id: orderId,
      user_id: req.user.user_id,
      role: req.user.role.toUpperCase(),
      message,
      attachments: attachments ? JSON.stringify(attachments) : null,
      read_at: null,
      created_at: new Date().toISOString()
    };

    orderNegotiationsDB.create(negotiation);

    // Update quote status to NEGOTIATING if needed
    if (order.quote_status === 'QUOTE_SENT') {
      ordersDB.update(orderId, {
        ...order,
        quote_status: 'NEGOTIATING'
      }, 'order_id');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: negotiation
    });

  } catch (error) {
    console.error('Send negotiation message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get negotiation messages for an order
 * @route   GET /api/quotes/:orderId/negotiations
 * @access  Private
 */
exports.getNegotiationMessages = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const messages = orderNegotiationsDB.findAll({ order_id: orderId });

    // Sort by creation date
    messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    console.error('Get negotiation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get quote history
 * @route   GET /api/quotes/:orderId/history
 * @access  Private
 */
exports.getQuoteHistory = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const history = quoteHistoryDB.findAll({ order_id: orderId });

    // Sort by version
    history.sort((a, b) => a.version - b.version);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error('Get quote history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Reject quote
 * @route   POST /api/quotes/:orderId/reject
 * @access  Private (Customer)
 */
exports.rejectQuote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = ordersDB.findById(orderId, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (order.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update order
    const updatedOrder = {
      ...order,
      quote_status: 'QUOTE_REJECTED',
      status: 'cancelled',
      customer_notes: order.customer_notes + `\n[Rejection reason: ${reason || 'Not specified'}]`
    };

    ordersDB.update(orderId, updatedOrder, 'order_id');

    // Log in history
    const historyEntry = {
      history_id: uuidv4(),
      order_id: orderId,
      version: order.quote_version,
      changed_by: 'CUSTOMER',
      changes_description: `Customer rejected quote. Reason: ${reason || 'Not specified'}`,
      items_snapshot: null,
      total_at_version: order.total_amount,
      created_at: new Date().toISOString()
    };
    quoteHistoryDB.create(historyEntry);

    res.status(200).json({
      success: true,
      message: 'Quote rejected successfully',
      data: {
        order_id: orderId,
        quote_status: 'QUOTE_REJECTED'
      }
    });

  } catch (error) {
    console.error('Reject quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;
