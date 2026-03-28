const { ordersDB, orderItemsDB, medicinesDB, usersDB } = require('../config/database');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const orders = ordersDB.readData();
    const medicines = medicinesDB.readData();
    const users = usersDB.readData();

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // Pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending');

    // Total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyOrders = orders.filter(order => new Date(order.created_at) >= thirtyDaysAgo);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Low stock medicines
    const lowStockMedicines = medicines.filter(m => m.stock_quantity < 10 && m.stock_quantity > 0);
    const outOfStockMedicines = medicines.filter(m => m.stock_quantity === 0);

    // Top selling medicines
    const orderItems = orderItemsDB.readData();
    const medicineSales = {};
    orderItems.forEach(item => {
      if (!medicineSales[item.medicine_id]) {
        medicineSales[item.medicine_id] = {
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          total_quantity: 0,
          total_revenue: 0
        };
      }
      medicineSales[item.medicine_id].total_quantity += item.quantity;
      medicineSales[item.medicine_id].total_revenue += item.subtotal;
    });

    const topSellingMedicines = Object.values(medicineSales)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5);

    // Customer count
    const customerCount = users.filter(u => u.role === 'customer').length;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalMedicines: medicines.length,
          totalOrders: orders.length,
          todayOrders: todayOrders.length,
          pendingOrders: pendingOrders.length,
          totalRevenue,
          monthlyRevenue,
          customerCount,
          lowStockCount: lowStockMedicines.length,
          outOfStockCount: outOfStockMedicines.length
        },
        lowStockMedicines,
        outOfStockMedicines,
        topSellingMedicines,
        recentOrders: orders.slice(-10).reverse()
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

// @desc    Get sales report
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let orders = ordersDB.readData();

    // Filter by date range if provided
    if (start_date) {
      orders = orders.filter(order => new Date(order.created_at) >= new Date(start_date));
    }
    if (end_date) {
      orders = orders.filter(order => new Date(order.created_at) <= new Date(end_date));
    }

    // Group by date
    const salesByDate = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          order_count: 0,
          total_revenue: 0
        };
      }
      salesByDate[date].order_count++;
      salesByDate[date].total_revenue += order.total_amount;
    });

    const salesData = Object.values(salesByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

