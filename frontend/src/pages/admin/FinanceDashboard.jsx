import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaChartLine, FaFileExcel, FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const FinanceDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    totalGST: 0,
    totalPlatformFee: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payment/all');
      const paymentsData = response.data.data;
      setPayments(paymentsData);
      calculateStats(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData) => {
    const today = new Date().toDateString();
    
    const totalRevenue = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
    const todayRevenue = paymentsData
      .filter(p => new Date(p.created_at).toDateString() === today)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const paidOrders = paymentsData.filter(p => p.payment_status === 'success').length;
    const pendingOrders = paymentsData.filter(p => p.payment_status === 'pending').length;

    setStats({
      totalRevenue: totalRevenue.toFixed(2),
      todayRevenue: todayRevenue.toFixed(2),
      totalOrders: paymentsData.length,
      paidOrders,
      pendingOrders,
      totalGST: (totalRevenue * 0.12).toFixed(2),
      totalPlatformFee: (totalRevenue * 0.01).toFixed(2)
    });
  };

  const exportToExcel = async () => {
    try {
      // This would trigger a backend endpoint to generate Excel report
      alert('Excel export feature - Backend endpoint needed');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <button onClick={exportToExcel} className="btn-secondary flex items-center">
          <FaFileExcel className="mr-2" />
          Export to Excel
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.totalRevenue}</p>
            </div>
            <FaMoneyBillWave className="text-5xl text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Revenue</p>
              <p className="text-3xl font-bold">₹{stats.todayRevenue}</p>
            </div>
            <FaChartLine className="text-5xl text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Paid Orders</p>
              <p className="text-3xl font-bold">{stats.paidOrders}</p>
              <p className="text-sm text-purple-100">of {stats.totalOrders} total</p>
            </div>
            <FaCheckCircle className="text-5xl text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Payments</p>
              <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            </div>
            <FaTimesCircle className="text-5xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">GST Collection</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total GST (12%):</span>
              <span className="font-bold text-lg">₹{stats.totalGST}</span>
            </div>
            <p className="text-sm text-gray-500">Collected from all transactions</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Platform Fees</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Platform Fee (1%):</span>
              <span className="font-bold text-lg">₹{stats.totalPlatformFee}</span>
            </div>
            <p className="text-sm text-gray-500">Service charges collected</p>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Recent Payments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.slice(0, 10).map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{payment.order_id?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs">{payment.razorpay_payment_id?.slice(0, 15)}...</td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{payment.amount}</td>
                  <td className="px-4 py-3 text-sm">
                    {payment.payment_status === 'success' ? (
                      <span className="badge-success">SUCCESS</span>
                    ) : (
                      <span className="badge-warning">PENDING</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(payment.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;

