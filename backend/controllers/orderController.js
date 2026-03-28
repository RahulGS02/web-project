const { v4: uuidv4 } = require('uuid');
const { ordersDB, orderItemsDB, medicinesDB } = require('../config/database');
const { calculateOrderFinancials } = require('../utils/financialCalculator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shipping_address, billing_address, payment_method } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    let total_amount = 0;
    const orderItems = [];

    // Validate items and calculate total
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
          message: `Insufficient stock for ${medicine.name}`
        });
      }

      const itemTotal = medicine.price * item.quantity;
      total_amount += itemTotal;

      orderItems.push({
        medicine_id: item.medicine_id,
        medicine_name: medicine.name,
        category: medicine.category,
        quantity: item.quantity,
        price: medicine.price,
        subtotal: itemTotal
      });
    }

    // Calculate financial breakdown with GST and platform fee
    const financials = calculateOrderFinancials(orderItems);

    // Create order
    const order_id = uuidv4();
    const newOrder = {
      order_id,
      user_id: req.user.user_id,
      subtotal: financials.subtotal,
      gst_amount: financials.gstAmount,
      platform_fee: financials.platformFee,
      total_amount: financials.totalAmount,
      status: 'pending',
      payment_status: payment_method === 'cash_on_delivery' ? 'pending' : 'awaiting_payment',
      shipping_address: shipping_address || '',
      billing_address: billing_address || shipping_address || '',
      payment_method: payment_method || 'online',
      created_at: new Date().toISOString()
    };

    // For online payment, only create order WITHOUT reducing stock
    // Stock will be reduced after successful payment
    if (payment_method === 'online') {
      ordersDB.create(newOrder);

      // Create order items but DON'T reduce stock yet
      for (const item of orderItems) {
        const orderItem = {
          order_item_id: uuidv4(),
          order_id,
          ...item,
          created_at: new Date().toISOString()
        };
        orderItemsDB.create(orderItem);
      }

      // Return order for payment processing
      return res.status(201).json({
        success: true,
        message: 'Order created, awaiting payment',
        data: {
          ...newOrder,
          items: orderItems
        }
      });
    }

    // For COD, create order and reduce stock immediately
    ordersDB.create(newOrder);

    // Create order items
    for (const item of orderItems) {
      const orderItem = {
        order_item_id: uuidv4(),
        order_id,
        ...item,
        created_at: new Date().toISOString()
      };
      orderItemsDB.create(orderItem);

      // Update medicine stock for COD
      const medicine = medicinesDB.findById(item.medicine_id, 'medicine_id');
      medicinesDB.update(
        item.medicine_id,
        { stock_quantity: medicine.stock_quantity - item.quantity },
        'medicine_id'
      );
    }

    res.status(201).json({
      success: true,
      data: {
        ...newOrder,
        items: orderItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all orders for logged in user
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      orders = ordersDB.readData();
    } else {
      orders = ordersDB.findAll({ user_id: req.user.user_id });
    }

    // Attach order items to each order
    const ordersWithItems = orders.map(order => {
      const items = orderItemsDB.findAll({ order_id: order.order_id });
      return { ...order, items };
    });

    res.status(200).json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = ordersDB.findById(req.params.id, 'order_id');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    const items = orderItemsDB.findAll({ order_id: order.order_id });

    res.status(200).json({
      success: true,
      data: { ...order, items }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const success = ordersDB.update(
      req.params.id,
      { status, updated_at: new Date().toISOString() },
      'order_id'
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updatedOrder = ordersDB.findById(req.params.id, 'order_id');

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

