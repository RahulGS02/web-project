import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaClock, FaCheckCircle, FaEdit, FaEye, FaFilter, 
  FaSearch, FaSort, FaExclamationCircle 
} from 'react-icons/fa';

const AdminQuoteRequests = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedQuotes, setSelectedQuotes] = useState([]);

  useEffect(() => {
    fetchQuoteRequests();
    // Refresh every 30 seconds
    const interval = setInterval(fetchQuoteRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      const response = await axios.get('/api/quotes/requests');
      if (response.data.success) {
        setQuotes(response.data.data);
      }
    } catch (error) {
      console.error('Fetch quote requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (quoteStatus) => {
    const statusConfig = {
      'QUOTE_REQUESTED': { icon: <FaClock />, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending', priority: 'high' },
      'QUOTE_SENT': { icon: <FaCheckCircle />, color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Quote Sent', priority: 'medium' },
      'QUOTE_MODIFIED': { icon: <FaEdit />, color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Modified', priority: 'high' },
      'QUOTE_ACCEPTED': { icon: <FaCheckCircle />, color: 'bg-green-100 text-green-800 border-green-300', label: 'Accepted', priority: 'low' },
      'QUOTE_REJECTED': { icon: <FaExclamationCircle />, color: 'bg-red-100 text-red-800 border-red-300', label: 'Rejected', priority: 'low' },
      'NEGOTIATING': { icon: <FaClock />, color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Negotiating', priority: 'medium' },
    };

    const config = statusConfig[quoteStatus] || statusConfig['QUOTE_REQUESTED'];

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const getPriorityIndicator = (quote) => {
    const hoursSinceRequest = (new Date() - new Date(quote.created_at)) / (1000 * 60 * 60);
    
    if (quote.quote_status === 'QUOTE_REQUESTED' && hoursSinceRequest > 24) {
      return <span className="text-red-600 font-semibold">🔴 URGENT</span>;
    }
    if (quote.quote_status === 'QUOTE_MODIFIED') {
      return <span className="text-orange-600 font-semibold">⚠️ PRIORITY</span>;
    }
    return null;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredQuotes = quotes
    .filter(quote => {
      if (filter !== 'ALL' && quote.quote_status !== filter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          quote.order_id.toLowerCase().includes(term) ||
          quote.customer_notes?.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'amount') return (b.total_amount || 0) - (a.total_amount || 0);
      return 0;
    });

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.quote_status === 'QUOTE_REQUESTED').length,
    modified: quotes.filter(q => q.quote_status === 'QUOTE_MODIFIED').length,
    sent: quotes.filter(q => q.quote_status === 'QUOTE_SENT').length,
    accepted: quotes.filter(q => q.quote_status === 'QUOTE_ACCEPTED').length,
  };

  const handleSelectQuote = (quoteId) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuotes.length === filteredQuotes.length) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(filteredQuotes.map(q => q.order_id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quote Requests Dashboard</h1>
        <p className="text-gray-600">Manage customer quote requests and set prices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="card p-4 bg-yellow-50">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
        </div>
        <div className="card p-4 bg-purple-50">
          <div className="text-sm text-gray-600">Modified</div>
          <div className="text-2xl font-bold text-purple-800">{stats.modified}</div>
        </div>
        <div className="card p-4 bg-blue-50">
          <div className="text-sm text-gray-600">Sent</div>
          <div className="text-2xl font-bold text-blue-800">{stats.sent}</div>
        </div>
        <div className="card p-4 bg-green-50">
          <div className="text-sm text-gray-600">Accepted</div>
          <div className="text-2xl font-bold text-green-800">{stats.accepted}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID or notes..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">All Status</option>
              <option value="QUOTE_REQUESTED">Pending</option>
              <option value="QUOTE_MODIFIED">Modified</option>
              <option value="QUOTE_SENT">Sent</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="QUOTE_ACCEPTED">Accepted</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <FaSort className="text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedQuotes.length > 0 && (
        <div className="card p-4 mb-4 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{selectedQuotes.length} quote(s) selected</span>
            <div className="flex gap-2">
              <button className="btn-secondary">Bulk Set Prices</button>
              <button className="btn-secondary">Export Selected</button>
              <button onClick={() => setSelectedQuotes([])} className="btn-secondary">Clear Selection</button>
            </div>
          </div>
        </div>
      )}

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-500 text-lg">No quote requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 px-2">
            <input
              type="checkbox"
              checked={selectedQuotes.length === filteredQuotes.length}
              onChange={handleSelectAll}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>

          {filteredQuotes.map(quote => (
            <div key={quote.order_id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedQuotes.includes(quote.order_id)}
                  onChange={() => handleSelectQuote(quote.order_id)}
                  className="mt-1 w-4 h-4"
                />

                {/* Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          Quote #{quote.order_id.substring(0, 8)}
                        </h3>
                        {getPriorityIndicator(quote)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Requested {getTimeAgo(quote.created_at)} • {quote.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(quote.quote_status)}
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-3">
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

                  {/* Customer Notes */}
                  {quote.customer_notes && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Customer Note:</strong> {quote.customer_notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    {(quote.quote_status === 'QUOTE_REQUESTED' || quote.quote_status === 'QUOTE_MODIFIED') && (
                      <button
                        onClick={() => navigate(`/admin/quote/${quote.order_id}/set-prices`)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FaEdit />
                        <span>Set Prices & Send Quote</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/admin/quote/${quote.order_id}`)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuoteRequests;
