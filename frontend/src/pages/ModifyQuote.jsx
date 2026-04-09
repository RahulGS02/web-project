import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaMinus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';

const ModifyQuote = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState(null);
  const [modifiedItems, setModifiedItems] = useState([]);
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    fetchQuoteDetail();
  }, [orderId]);

  const fetchQuoteDetail = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        const quoteData = response.data.data;
        setQuote(quoteData);
        setModifiedItems(quoteData.items.map(item => ({
          order_item_id: item.order_item_id,
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          category: item.category,
          quantity: item.quantity,
          original_quantity: item.quantity,
          customer_notes: item.customer_notes || '',
          original_price: item.admin_set_price || item.price || 0,
          keep: true
        })));
        setCustomerNotes(quoteData.customer_notes || '');
      }
    } catch (error) {
      console.error('Fetch quote error:', error);
      alert('Failed to load quote details');
      navigate('/my-quotes');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = (index, newQuantity) => {
    const updated = [...modifiedItems];
    updated[index].quantity = Math.max(1, newQuantity);
    setModifiedItems(updated);
  };

  const updateItemNotes = (index, notes) => {
    const updated = [...modifiedItems];
    updated[index].customer_notes = notes;
    setModifiedItems(updated);
  };

  const toggleKeepItem = (index) => {
    const updated = [...modifiedItems];
    updated[index].keep = !updated[index].keep;
    setModifiedItems(updated);
  };

  const hasChanges = () => {
    return modifiedItems.some(item => 
      item.quantity !== item.original_quantity || 
      !item.keep ||
      item.customer_notes !== (quote.items.find(i => i.order_item_id === item.order_item_id)?.customer_notes || '')
    ) || customerNotes !== (quote.customer_notes || '');
  };

  const getChangeSummary = () => {
    const changes = [];
    modifiedItems.forEach(item => {
      if (!item.keep) {
        changes.push(`❌ Removed: ${item.medicine_name}`);
      } else if (item.quantity !== item.original_quantity) {
        changes.push(`📝 ${item.medicine_name}: ${item.original_quantity} → ${item.quantity}`);
      }
    });
    return changes;
  };

  const handleSubmitModification = async () => {
    if (!hasChanges()) {
      alert('No changes detected. Please modify quantities or add/remove items.');
      return;
    }

    const confirmation = window.confirm(
      'Submit modification to admin?\n\n' +
      'Changes:\n' + 
      getChangeSummary().join('\n') +
      '\n\nAdmin will review and send you a new quote.'
    );

    if (!confirmation) return;

    setSubmitting(true);
    try {
      const modificationData = {
        items: modifiedItems
          .filter(item => item.keep)
          .map(item => ({
            order_item_id: item.order_item_id,
            quantity: item.quantity,
            customer_notes: item.customer_notes
          })),
        customer_notes: customerNotes
      };

      const response = await axios.post(`/api/quotes/${orderId}/modify`, modificationData);
      
      if (response.data.success) {
        alert(response.data.message);
        navigate('/my-quotes');
      }
    } catch (error) {
      console.error('Modify quote error:', error);
      alert(error.response?.data?.message || 'Failed to submit modification');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(`/quote/${orderId}`)} className="text-blue-600 hover:underline mb-4">
            ← Back to Quote
          </button>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FaEdit />
            <span>Modify Quote Request</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Make changes to your quote request. Admin will review and send you an updated quote.
          </p>
        </div>

        {/* Original Quote Info */}
        {quote.total_amount > 0 && (
          <div className="card p-4 mb-6 bg-blue-50">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Original Quote Total:</span>
              <span className="text-2xl font-bold text-blue-600">₹{quote.total_amount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              New pricing will be provided by admin after you submit modifications.
            </p>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4 mb-6">
          {modifiedItems.map((item, index) => (
            <div 
              key={item.order_item_id} 
              className={`card p-6 transition-opacity ${!item.keep ? 'opacity-50 bg-red-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${!item.keep ? 'line-through text-gray-500' : ''}`}>
                    {item.medicine_name}
                  </h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  {item.original_price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Previous price: ₹{item.original_price} each
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleKeepItem(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    item.keep 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {item.keep ? (
                    <><FaTrash className="inline mr-2" />Remove</>
                  ) : (
                    <>Restore</>
                  )}
                </button>
              </div>

              {item.keep && (
                <>
                  {/* Quantity */}
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                        className="btn-secondary p-2"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span className="w-16 text-center font-semibold text-lg">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                        className="btn-secondary p-2"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    {item.quantity !== item.original_quantity && (
                      <span className="text-sm text-orange-600">
                        (was {item.original_quantity})
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update your notes for this item:
                    </label>
                    <textarea
                      value={item.customer_notes}
                      onChange={(e) => updateItemNotes(index, e.target.value)}
                      placeholder="Any special requirements..."
                      className="input-field"
                      rows="2"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Global Notes */}
        <div className="card p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional notes for admin:
          </label>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Explain why you're modifying this request..."
            className="input-field"
            rows="4"
          />
        </div>

        {/* Change Summary */}
        {hasChanges() && (
          <div className="card p-6 mb-6 bg-yellow-50 border-yellow-200">
            <h3 className="font-semibold mb-3">📋 Summary of Changes:</h3>
            <ul className="list-disc list-inside space-y-1">
              {getChangeSummary().map((change, index) => (
                <li key={index} className="text-gray-700">{change}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmitModification}
            disabled={!hasChanges() || submitting}
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
          >
            <FaSave />
            <span>{submitting ? 'Submitting...' : 'Submit Modification to Admin'}</span>
          </button>
          <button
            onClick={() => navigate(`/quote/${orderId}`)}
            className="btn-secondary px-8"
          >
            Cancel
          </button>
        </div>

        {!hasChanges() && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            Make some changes to enable submission
          </p>
        )}
      </div>
    </div>
  );
};

export default ModifyQuote;
