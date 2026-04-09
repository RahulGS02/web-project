import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSave, FaCalculator, FaTimes, FaLightbulb } from 'react-icons/fa';

const SetQuotePrices = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState(null);
  const [itemPrices, setItemPrices] = useState({});
  const [deliveryCharges, setDeliveryCharges] = useState(50);
  const [adminNotes, setAdminNotes] = useState('');
  const [quoteValidHours, setQuoteValidHours] = useState(48);

  useEffect(() => {
    fetchQuoteDetail();
  }, [orderId]);

  const fetchQuoteDetail = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        const quoteData = response.data.data;
        setQuote(quoteData);
        
        // Initialize prices with original/catalog prices
        const initialPrices = {};
        quoteData.items.forEach(item => {
          initialPrices[item.order_item_id] = {
            admin_set_price: item.admin_set_price || item.original_price || 0,
            discount_percent: item.discount_percent || 0,
            admin_notes: item.admin_notes || ''
          };
        });
        setItemPrices(initialPrices);
        setDeliveryCharges(quoteData.delivery_charges || 50);
        setAdminNotes(quoteData.admin_notes || '');
      }
    } catch (error) {
      console.error('Fetch quote error:', error);
      alert('Failed to load quote');
      navigate('/admin/quote-requests');
    } finally {
      setLoading(false);
    }
  };

  const updateItemPrice = (itemId, field, value) => {
    setItemPrices(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const applyDiscount = (itemId, discountPercent) => {
    const item = quote.items.find(i => i.order_item_id === itemId);
    const originalPrice = item.original_price || 0;
    const newPrice = originalPrice * (1 - discountPercent / 100);
    
    updateItemPrice(itemId, 'admin_set_price', newPrice.toFixed(2));
    updateItemPrice(itemId, 'discount_percent', discountPercent);
  };

  const calculateFinancials = () => {
    let subtotal = 0;
    
    quote.items.forEach(item => {
      const price = parseFloat(itemPrices[item.order_item_id]?.admin_set_price || 0);
      subtotal += price * item.quantity;
    });

    const gstRate = 0.12;
    const platformFeeRate = 0.01;
    const gst = subtotal * gstRate;
    const platformFee = subtotal * platformFeeRate;
    const total = subtotal + gst + platformFee + parseFloat(deliveryCharges);

    return {
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      platformFee: platformFee.toFixed(2),
      delivery: parseFloat(deliveryCharges).toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleSubmitQuote = async () => {
    // Validate all prices are set
    const unpriced = quote.items.filter(item => {
      const price = parseFloat(itemPrices[item.order_item_id]?.admin_set_price || 0);
      return price <= 0;
    });

    if (unpriced.length > 0) {
      alert(`Please set prices for all items. ${unpriced.length} item(s) have no price.`);
      return;
    }

    const confirmation = window.confirm(
      `Send quote to customer?\n\n` +
      `Total: ₹${calculateFinancials().total}\n` +
      `Valid for: ${quoteValidHours} hours\n\n` +
      `Customer will be able to review and accept/modify the quote.`
    );

    if (!confirmation) return;

    setSubmitting(true);
    try {
      const requestData = {
        items: quote.items.map(item => ({
          order_item_id: item.order_item_id,
          admin_set_price: parseFloat(itemPrices[item.order_item_id]?.admin_set_price || 0),
          discount_percent: parseFloat(itemPrices[item.order_item_id]?.discount_percent || 0),
          admin_notes: itemPrices[item.order_item_id]?.admin_notes || ''
        })),
        delivery_charges: parseFloat(deliveryCharges),
        admin_notes: adminNotes,
        quote_valid_hours: parseInt(quoteValidHours)
      };

      const response = await axios.post(`/api/quotes/${orderId}/set-prices`, requestData);

      if (response.data.success) {
        alert('Quote sent to customer successfully!');
        navigate('/admin/quote-requests');
      }
    } catch (error) {
      console.error('Set prices error:', error);
      alert(error.response?.data?.message || 'Failed to send quote');
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

  if (!quote) return null;

  const financials = calculateFinancials();

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
          <h1 className="text-3xl font-bold mb-2">Set Prices for Quote</h1>
          <p className="text-gray-600">Quote #{orderId.substring(0, 8)}</p>
        </div>

        {/* Customer Info */}
        {quote.customer_notes && (
          <div className="card p-4 mb-6 bg-blue-50">
            <h3 className="font-semibold mb-2">Customer Notes:</h3>
            <p className="text-gray-700">{quote.customer_notes}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-4 mb-6 bg-yellow-50">
          <div className="flex items-start space-x-2">
            <FaLightbulb className="text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Quick Pricing Templates:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    quote.items.forEach(item => {
                      applyDiscount(item.order_item_id, 10);
                    });
                  }}
                  className="px-3 py-1 bg-white border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Apply 10% Discount to All
                </button>
                <button
                  onClick={() => {
                    quote.items.forEach(item => {
                      applyDiscount(item.order_item_id, 15);
                    });
                  }}
                  className="px-3 py-1 bg-white border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Apply 15% Bulk Discount
                </button>
                <button
                  onClick={() => {
                    quote.items.forEach(item => {
                      updateItemPrice(item.order_item_id, 'admin_set_price', item.original_price || 0);
                      updateItemPrice(item.order_item_id, 'discount_percent', 0);
                    });
                  }}
                  className="px-3 py-1 bg-white border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Reset to Catalog Prices
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Pricing */}
        <div className="space-y-4 mb-6">
          {quote.items.map(item => {
            const itemData = itemPrices[item.order_item_id] || {};
            const price = parseFloat(itemData.admin_set_price || 0);
            const discount = parseFloat(itemData.discount_percent || 0);
            const itemTotal = price * item.quantity;

            return (
              <div key={item.order_item_id} className="card p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{item.medicine_name}</h3>
                  <div className="text-sm text-gray-600">
                    {item.category} • Quantity: {item.quantity}
                  </div>
                  {item.customer_notes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <strong>Customer Note:</strong> {item.customer_notes}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Set Price (per unit)
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        value={itemData.admin_set_price || ''}
                        onChange={(e) => updateItemPrice(item.order_item_id, 'admin_set_price', e.target.value)}
                        className="input-field"
                        placeholder="0.00"
                      />
                    </div>
                    {item.original_price > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Catalog price: ₹{item.original_price}
                      </p>
                    )}
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount %
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={itemData.discount_percent || ''}
                        onChange={(e) => applyDiscount(item.order_item_id, parseFloat(e.target.value) || 0)}
                        className="input-field"
                        placeholder="0"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Total
                    </label>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{itemTotal.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × ₹{price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes for this item (optional)
                  </label>
                  <input
                    type="text"
                    value={itemData.admin_notes || ''}
                    onChange={(e) => updateItemPrice(item.order_item_id, 'admin_notes', e.target.value)}
                    placeholder="E.g., Special pricing applied, Limited stock, etc."
                    className="input-field"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Summary */}
          <div className="card p-6 bg-gray-50">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <FaCalculator />
              <span>Price Summary</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{financials.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (12%):</span>
                <span>₹{financials.gst}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee (1%):</span>
                <span>₹{financials.platformFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Charges:</span>
                <div className="flex items-center space-x-2">
                  <span>₹</span>
                  <input
                    type="number"
                    step="1"
                    value={deliveryCharges}
                    onChange={(e) => setDeliveryCharges(e.target.value)}
                    className="w-24 input-field"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{financials.total}</span>
              </div>
            </div>
          </div>

          {/* Quote Settings */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-4">Quote Settings</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Valid For (hours)
              </label>
              <select
                value={quoteValidHours}
                onChange={(e) => setQuoteValidHours(e.target.value)}
                className="input-field"
              >
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours (3 days)</option>
                <option value="168">1 week</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (visible to customer)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="E.g., Special pricing for bulk order, Free delivery on next order, etc."
                className="input-field"
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSubmitQuote}
            disabled={submitting}
            className="btn-primary flex-1 flex items-center justify-center space-x-2 text-lg py-3"
          >
            <FaSave />
            <span>{submitting ? 'Sending...' : 'Send Quote to Customer'}</span>
          </button>
          <button
            onClick={() => navigate('/admin/quote-requests')}
            className="btn-secondary px-8"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetQuotePrices;
