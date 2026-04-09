import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaEye } from 'react-icons/fa';

const MyQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyQuotes();
  }, []);

  const fetchMyQuotes = async () => {
    try {
      const response = await axios.get('/api/quotes/my-quotes');
      if (response.data.success) {
        setQuotes(response.data.data);
      }
    } catch (error) {
      console.error('Fetch quotes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (quoteStatus) => {
    const statusConfig = {
      'QUOTE_REQUESTED': { icon: <FaClock />, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'QUOTE_SENT': { icon: <FaEye />, color: 'bg-blue-100 text-blue-800', label: 'Quote Received' },
      'QUOTE_ACCEPTED': { icon: <FaCheckCircle />, color: 'bg-green-100 text-green-800', label: 'Accepted' },
      'QUOTE_REJECTED': { icon: <FaTimesCircle />, color: 'bg-red-100 text-red-800', label: 'Rejected' },
      'QUOTE_MODIFIED': { icon: <FaEdit />, color: 'bg-purple-100 text-purple-800', label: 'Modified' },
      'NEGOTIATING': { icon: <FaClock />, color: 'bg-orange-100 text-orange-800', label: 'Negotiating' },
      'FINALIZED': { icon: <FaCheckCircle />, color: 'bg-green-100 text-green-800', label: 'Finalized' }
    };

    const config = statusConfig[quoteStatus] || statusConfig['QUOTE_REQUESTED'];

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
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
      return `${days} day${days > 1 ? 's' : ''} left`;
    }

    return `${hours}h ${minutes}m left`;
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filter === 'ALL') return true;
    return quote.quote_status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Quote Requests</h1>
          <button
            onClick={() => navigate('/medicines')}
            className="btn-primary"
          >
            + New Quote Request
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['ALL', 'QUOTE_REQUESTED', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'NEGOTIATING'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace('QUOTE_', '').replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Quotes List */}
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No quote requests found</p>
            <button
              onClick={() => navigate('/medicines')}
              className="mt-4 btn-primary"
            >
              Create Your First Quote Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map(quote => (
              <div key={quote.order_id} className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => navigate(`/quote/${quote.order_id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Quote #{quote.order_id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Requested on {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(quote.quote_status)}
                    {quote.quote_valid_until && quote.quote_status === 'QUOTE_SENT' && (
                      <p className="text-sm mt-2">
                        {calculateTimeRemaining(quote.quote_valid_until) === 'Expired' ? (
                          <span className="text-red-600 font-semibold">⏱️ Expired</span>
                        ) : (
                          <span className="text-orange-600 font-semibold">
                            ⏰ {calculateTimeRemaining(quote.quote_valid_until)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {quote.items?.slice(0, 3).map(item => (
                      <span key={item.order_item_id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {item.medicine_name} × {item.quantity}
                      </span>
                    ))}
                    {quote.items?.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        +{quote.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                {quote.total_amount > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{quote.total_amount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Action Hints */}
                {quote.quote_status === 'QUOTE_SENT' && (
                  <div className="mt-4 flex gap-2">
                    <span className="text-sm text-blue-600">👆 Click to review and accept quote</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuotes;
