import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaCheckCircle, FaEdit, FaTimesCircle, FaComments } from 'react-icons/fa';
import NegotiationChat from '../components/NegotiationChat';

const QuoteDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchQuoteDetail();
  }, [orderId]);

  const fetchQuoteDetail = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        setQuote(response.data.data);
      }
    } catch (error) {
      console.error('Fetch quote detail error:', error);
      alert('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!window.confirm('Are you sure you want to accept this quote and proceed to payment?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.post(`/api/quotes/${orderId}/accept`);
      if (response.data.success) {
        alert(response.data.message + ' Redirecting to checkout...');
        // Navigate to checkout page (the order is already created with accepted quote)
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Accept quote error:', error);
      alert(error.response?.data?.message || 'Failed to accept quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModifyQuote = () => {
    navigate(`/quote/${orderId}/modify`);
  };

  const handleRejectQuote = async () => {
    const reason = prompt('Please tell us why you\'re rejecting this quote (optional):');
    if (reason === null) return; // User cancelled

    setActionLoading(true);
    try {
      const response = await axios.post(`/api/quotes/${orderId}/reject`, { reason });
      if (response.data.success) {
        alert('Quote rejected successfully');
        navigate('/my-quotes');
      }
    } catch (error) {
      console.error('Reject quote error:', error);
      alert(error.response?.data?.message || 'Failed to reject quote');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateTimeRemaining = (validUntil) => {
    if (!validUntil) return null;

    const now = new Date();
    const expiry = new Date(validUntil);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Valid for ${days} day${days > 1 ? 's' : ''}`;
    }

    return `Valid for ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Quote not found</p>
        <button onClick={() => navigate('/my-quotes')} className="mt-4 btn-primary">
          Back to My Quotes
        </button>
      </div>
    );
  }

  const isExpired = quote.quote_valid_until && new Date(quote.quote_valid_until) < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate('/my-quotes')} className="text-blue-600 hover:underline mb-4">
            ← Back to My Quotes
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Quote #{orderId.substring(0, 8)}</h1>
              <p className="text-gray-500">Requested on {new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
            {quote.quote_valid_until && quote.quote_status === 'QUOTE_SENT' && (
              <div className={`text-right px-4 py-2 rounded-lg ${isExpired ? 'bg-red-100' : 'bg-orange-100'}`}>
                <FaClock className={`inline mr-2 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
                <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {isExpired ? 'Expired' : calculateTimeRemaining(quote.quote_valid_until)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="card p-4 mb-6 bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Status:</span>
            <span className="text-blue-800 font-bold">{quote.quote_status.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Items */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {quote.items?.map(item => (
              <div key={item.order_item_id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.medicine_name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  {item.customer_notes && (
                    <p className="text-sm text-gray-500 mt-1">Note: {item.customer_notes}</p>
                  )}
                  {item.admin_notes && (
                    <p className="text-sm text-blue-600 mt-1">Admin: {item.admin_notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                  {item.admin_set_price > 0 && (
                    <>
                      <div className="text-lg font-semibold">₹{item.admin_set_price} each</div>
                      <div className="text-sm text-gray-600">= ₹{item.subtotal}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        {quote.total_amount > 0 && (
          <div className="card p-6 mb-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{quote.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (12%):</span>
                <span>₹{quote.gst_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee:</span>
                <span>₹{quote.platform_fee?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charges:</span>
                <span>₹{quote.delivery_charges?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t">
                <span>Total:</span>
                <span className="text-blue-600">₹{quote.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {(quote.customer_notes || quote.admin_notes) && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            {quote.customer_notes && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700">Your Notes:</p>
                <p className="text-gray-600">{quote.customer_notes}</p>
              </div>
            )}
            {quote.admin_notes && (
              <div>
                <p className="text-sm font-semibold text-blue-700">Admin Notes:</p>
                <p className="text-blue-600">{quote.admin_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {quote.quote_status === 'QUOTE_SENT' && !isExpired && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">What would you like to do?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleAcceptQuote}
                disabled={actionLoading}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <FaCheckCircle />
                <span>Accept & Pay</span>
              </button>
              <button
                onClick={handleModifyQuote}
                disabled={actionLoading}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <FaEdit />
                <span>Modify Request</span>
              </button>
              <button
                onClick={handleRejectQuote}
                disabled={actionLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center space-x-2"
              >
                <FaTimesCircle />
                <span>Reject Quote</span>
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setChatOpen(true)}
                className="text-blue-600 hover:underline flex items-center justify-center space-x-2 mx-auto"
              >
                <FaComments />
                <span>Send Message to Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Negotiation Button for Other Statuses */}
        {quote.quote_status !== 'QUOTE_SENT' && quote.quote_status !== 'QUOTE_REJECTED' && (
          <div className="card p-6">
            <button
              onClick={() => setChatOpen(true)}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <FaComments />
              <span>Message Admin</span>
            </button>
          </div>
        )}

        {/* Negotiation Chat Modal */}
        <NegotiationChat
          orderId={orderId}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />

        {isExpired && quote.quote_status === 'QUOTE_SENT' && (
          <div className="card p-6 bg-red-50">
            <p className="text-red-800 text-center">
              ⚠️ This quote has expired. Please contact admin for a new quote.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDetail;
