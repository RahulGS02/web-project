import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaEdit, FaHistory, FaComments, FaUserCircle,
  FaEnvelope, FaClock, FaCheckCircle
} from 'react-icons/fa';
import NegotiationChat from '../../components/NegotiationChat';

const AdminQuoteDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchQuoteDetail();
    fetchQuoteHistory();
  }, [orderId]);

  const fetchQuoteDetail = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        setQuote(response.data.data);
      }
    } catch (error) {
      console.error('Fetch quote error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuoteHistory = async () => {
    try {
      const response = await axios.get(`/api/quotes/${orderId}/history`);
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'QUOTE_REQUESTED': 'bg-yellow-100 text-yellow-800',
      'QUOTE_SENT': 'bg-blue-100 text-blue-800',
      'QUOTE_MODIFIED': 'bg-purple-100 text-purple-800',
      'QUOTE_ACCEPTED': 'bg-green-100 text-green-800',
      'QUOTE_REJECTED': 'bg-red-100 text-red-800',
      'NEGOTIATING': 'bg-orange-100 text-orange-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config[status] || config['QUOTE_REQUESTED']}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
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
        <button onClick={() => navigate('/admin/quote-requests')} className="mt-4 btn-primary">
          Back to Quotes
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin/quote-requests')} 
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Quote Requests
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Quote #{orderId.substring(0, 8)}</h1>
              <p className="text-gray-600">
                Created {new Date(quote.created_at).toLocaleDateString()} at {new Date(quote.created_at).toLocaleTimeString()}
              </p>
            </div>
            <div>
              {getStatusBadge(quote.quote_status)}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(quote.quote_status === 'QUOTE_REQUESTED' || quote.quote_status === 'QUOTE_MODIFIED') && (
            <button
              onClick={() => navigate(`/admin/quote/${orderId}/set-prices`)}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <FaEdit />
              <span>Set Prices & Send Quote</span>
            </button>
          )}
          <button
            onClick={() => setChatOpen(true)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <FaComments />
            <span>Message Customer</span>
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <FaHistory />
            <span>View History</span>
          </button>
        </div>

        {/* Customer Info */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <FaUserCircle />
            <span>Customer Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-medium">{quote.user_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Shipping Address</p>
              <p className="font-medium">{quote.shipping_address || 'Not provided yet'}</p>
            </div>
          </div>
        </div>

        {/* Quote Version Info */}
        <div className="card p-4 mb-6 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quote Version</p>
              <p className="text-xl font-bold">v{quote.quote_version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Modifications</p>
              <p className="text-xl font-bold">{quote.negotiation_count || 0}</p>
            </div>
            {quote.quote_valid_until && (
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium">
                  {new Date(quote.quote_valid_until).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Items ({quote.items?.length || 0})</h2>
          <div className="space-y-4">
            {quote.items?.map(item => (
              <div key={item.order_item_id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.medicine_name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  {item.customer_notes && (
                    <p className="text-sm text-blue-600 mt-1">
                      Customer: {item.customer_notes}
                    </p>
                  )}
                  {item.admin_notes && (
                    <p className="text-sm text-green-600 mt-1">
                      Admin: {item.admin_notes}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                  {item.admin_set_price > 0 && (
                    <>
                      <div className="text-lg font-semibold">₹{item.admin_set_price} each</div>
                      {item.discount_percent > 0 && (
                        <div className="text-xs text-green-600">
                          {item.discount_percent}% discount
                        </div>
                      )}
                      <div className="text-sm text-gray-600">= ₹{item.subtotal}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        {quote.total_amount > 0 && (
          <div className="card p-6 mb-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Pricing Breakdown</h2>
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
                <span>Delivery:</span>
                <span>₹{quote.delivery_charges?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
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
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm font-semibold text-blue-700">Customer Notes:</p>
                <p className="text-gray-700">{quote.customer_notes}</p>
              </div>
            )}
            {quote.admin_notes && (
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm font-semibold text-green-700">Admin Notes:</p>
                <p className="text-gray-700">{quote.admin_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {showHistory && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <FaHistory />
              <span>Quote History</span>
            </h2>
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.history_id} className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      entry.changed_by === 'ADMIN' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    {index < history.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">
                        {entry.changed_by === 'ADMIN' ? 'Admin' : 'Customer'}
                      </span>
                      <span className="text-sm text-gray-500">
                        v{entry.version}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{entry.changes_description}</p>
                    {entry.total_at_version > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Total: ₹{entry.total_at_version.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Modal */}
        <NegotiationChat 
          orderId={orderId} 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
        />
      </div>
    </div>
  );
};

export default AdminQuoteDetail;
