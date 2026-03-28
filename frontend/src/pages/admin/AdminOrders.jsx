import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      alert('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
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

  if (loading) {
    return <div className="text-center py-16">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders Management</h1>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">
                    #{order.order_id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-4">{order.user_id.slice(0, 8)}</td>
                  <td className="text-right py-3 px-4 font-semibold">
                    ₹{order.total_amount.toFixed(2)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={getStatusBadge(order.status)}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>

      {/* Order Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.slice(0, 4).map(order => (
          <div key={order.order_id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold">Order #{order.order_id.slice(0, 8)}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <span className={getStatusBadge(order.status)}>
                {order.status}
              </span>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm flex justify-between">
                      <span>{item.medicine_name} x{item.quantity}</span>
                      <span>₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold text-primary-600">
                ₹{order.total_amount.toFixed(2)}
              </span>
            </div>

            {order.shipping_address && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                <strong>Address:</strong> {order.shipping_address}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;

