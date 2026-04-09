import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPills, FaShoppingCart, FaExclamationTriangle, FaMoneyBillWave, FaUsers, FaQuoteLeft } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoteStats, setQuoteStats] = useState({ pending: 0, modified: 0 });

  useEffect(() => {
    fetchAnalytics();
    fetchQuoteStats();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuoteStats = async () => {
    try {
      const response = await axios.get('/api/quotes/requests');
      if (response.data.success) {
        const quotes = response.data.data;
        setQuoteStats({
          pending: quotes.filter(q => q.quote_status === 'QUOTE_REQUESTED').length,
          modified: quotes.filter(q => q.quote_status === 'QUOTE_MODIFIED').length
        });
      }
    } catch (error) {
      console.error('Error fetching quote stats:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-16">Loading dashboard...</div>;
  }

  const stats = [
    {
      title: 'Total Medicines',
      value: analytics?.overview?.totalMedicines || 0,
      icon: <FaPills className="text-3xl" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Orders',
      value: analytics?.overview?.totalOrders || 0,
      icon: <FaShoppingCart className="text-3xl" />,
      color: 'bg-green-500'
    },
    {
      title: 'Today Orders',
      value: analytics?.overview?.todayOrders || 0,
      icon: <FaShoppingCart className="text-3xl" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending Orders',
      value: analytics?.overview?.pendingOrders || 0,
      icon: <FaExclamationTriangle className="text-3xl" />,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics?.overview?.totalRevenue?.toFixed(2) || 0}`,
      icon: <FaMoneyBillWave className="text-3xl" />,
      color: 'bg-emerald-500'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${analytics?.overview?.monthlyRevenue?.toFixed(2) || 0}`,
      icon: <FaMoneyBillWave className="text-3xl" />,
      color: 'bg-teal-500'
    },
    {
      title: 'Total Customers',
      value: analytics?.overview?.customerCount || 0,
      icon: <FaUsers className="text-3xl" />,
      color: 'bg-indigo-500'
    },
    {
      title: 'Low Stock Items',
      value: analytics?.overview?.lowStockCount || 0,
      icon: <FaExclamationTriangle className="text-3xl" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Quote Alerts */}
      {(quoteStats.pending > 0 || quoteStats.modified > 0) && (
        <div
          onClick={() => navigate('/admin/quote-requests')}
          className="card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 text-white p-4 rounded-lg">
                <FaQuoteLeft className="text-3xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {quoteStats.pending + quoteStats.modified} Quote Requests Need Attention
                </h3>
                <p className="text-gray-700">
                  {quoteStats.pending} pending • {quoteStats.modified} modified
                </p>
              </div>
            </div>
            <button className="btn-primary">
              Review Quotes →
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-4 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Medicines */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <FaExclamationTriangle className="text-orange-500" />
            <span>Low Stock Medicines</span>
          </h2>
          {analytics?.lowStockMedicines?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.lowStockMedicines.map((medicine, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded">
                  <div>
                    <p className="font-semibold">{medicine.name}</p>
                    <p className="text-sm text-gray-600">{medicine.category}</p>
                  </div>
                  <span className="badge-warning">{medicine.stock_quantity} left</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No low stock items</p>
          )}
        </div>

        {/* Out of Stock */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <FaExclamationTriangle className="text-red-500" />
            <span>Out of Stock</span>
          </h2>
          {analytics?.outOfStockMedicines?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.outOfStockMedicines.map((medicine, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-semibold">{medicine.name}</p>
                    <p className="text-sm text-gray-600">{medicine.category}</p>
                  </div>
                  <span className="badge-danger">Out of Stock</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">All items in stock</p>
          )}
        </div>
      </div>

      {/* Top Selling Medicines */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Top Selling Medicines</h2>
        {analytics?.topSellingMedicines?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Medicine Name</th>
                  <th className="text-right py-3 px-4">Quantity Sold</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topSellingMedicines.map((medicine, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{medicine.medicine_name}</td>
                    <td className="text-right py-3 px-4">{medicine.total_quantity}</td>
                    <td className="text-right py-3 px-4 font-semibold">₹{medicine.total_revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No sales data available</p>
        )}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {analytics?.recentOrders?.length > 0 ? (
          <div className="space-y-3">
            {analytics.recentOrders.slice(0, 5).map((order, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">Order #{order.order_id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">₹{order.total_amount.toFixed(2)}</p>
                  <span className={`badge-${order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'info'} text-xs`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent orders</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

