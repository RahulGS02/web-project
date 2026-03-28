import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaDownload, FaFileInvoice } from 'react-icons/fa';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrderDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      await axios.post(`/api/invoice/generate/${orderId}`);
      alert('Invoice generated successfully!');
      // Trigger download
      handleDownloadInvoice();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleDownloadInvoice = async () => {
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
      alert('Failed to download invoice. Please try generating it first.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your order</p>
        </div>

        {/* Order Details Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-semibold text-green-600">PAID</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-lg">₹{orderDetails?.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-mono text-sm">{orderDetails?.razorpay_payment_id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGenerateInvoice}
            disabled={generatingInvoice}
            className="btn-primary w-full flex items-center justify-center"
          >
            <FaFileInvoice className="mr-2" />
            {generatingInvoice ? 'Generating Invoice...' : 'Generate & Download Invoice'}
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="btn-secondary w-full flex items-center justify-center"
          >
            <FaDownload className="mr-2" />
            Download Invoice
          </button>

          <button
            onClick={() => navigate('/orders')}
            className="btn-secondary w-full"
          >
            View All Orders
          </button>

          <button
            onClick={() => navigate('/medicines')}
            className="btn-outline w-full"
          >
            Continue Shopping
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your order is being processed</li>
            <li>• You'll receive an email confirmation shortly</li>
            <li>• Track your order status in "My Orders"</li>
            <li>• Download your invoice for your records</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

