import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaBox, FaCheckCircle, FaClock, FaTruck, FaDownload, FaFileInvoice, FaCreditCard } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      // Filter out orders with awaiting_payment status (failed online payments)
      const completedOrders = response.data.data.filter(
        order => order.payment_status !== 'awaiting_payment'
      );
      setOrders(completedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'processing':
        return <FaTruck className="text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      processing: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge';
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`/api/invoice/download/${orderId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      // Try to generate invoice first
      try {
        await axios.post(`/api/invoice/generate/${orderId}`);
        alert('Invoice generated! Click download again.');
      } catch (genError) {
        alert('Failed to download invoice. Please try again later.');
      }
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="badge-success">PAID</span>;
    }
    return <span className="badge-warning">PENDING</span>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
        <a href="/medicines" className="btn-primary">
          Browse Medicines
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.order_id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(order.status)}
                  <h3 className="font-semibold text-lg">Order #{order.order_id.slice(0, 8)}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={getStatusBadge(order.status)}>
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-3">Items:</h4>
              <div className="space-y-2">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.medicine_name} x {item.quantity}
                    </span>
                    <span className="font-semibold">₹{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            {order.subtotal && (
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (12%):</span>
                  <span>₹{order.gst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span>₹{order.platform_fee.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Order Total */}
            <div className="border-t pt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium flex items-center">
                  <FaCreditCard className="mr-2" />
                  {order.payment_method?.replace('_', ' ').toUpperCase() || 'COD'}
                </p>
                <div className="mt-2">
                  {getPaymentStatusBadge(order.payment_status)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-primary-600">₹{order.total_amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Invoice Download Button */}
            {order.payment_status === 'paid' && (
              <div className="mt-4">
                <button
                  onClick={() => handleDownloadInvoice(order.order_id)}
                  className="btn-secondary w-full flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download Invoice
                </button>
              </div>
            )}

            {order.shipping_address && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-semibold mb-1">Shipping Address:</p>
                <p className="text-sm text-gray-700">{order.shipping_address}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

