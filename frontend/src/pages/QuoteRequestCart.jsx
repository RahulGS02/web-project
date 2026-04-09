import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaTrash, FaPlus, FaMinus, FaQuoteLeft } from 'react-icons/fa';

const QuoteRequestCart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [itemNotes, setItemNotes] = useState({});
  const [customerNotes, setCustomerNotes] = useState('');

  const handleItemNoteChange = (medicine_id, note) => {
    setItemNotes(prev => ({
      ...prev,
      [medicine_id]: note
    }));
  };

  const handleSubmitQuoteRequest = async () => {
    if (!user) {
      alert('Please login to request a quote');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const quoteRequestData = {
        items: cartItems.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          customer_notes: itemNotes[item.medicine_id] || ''
        })),
        customer_notes: customerNotes,
        shipping_address: '', // Will be collected later after quote acceptance
        prescription_ids: [] // TODO: Link prescriptions if any
      };

      const response = await axios.post('/api/quotes/request', quoteRequestData);

      if (response.data.success) {
        clearCart();
        alert(response.data.message);
        navigate('/my-quotes');
      }
    } catch (error) {
      console.error('Quote request error:', error);
      alert(error.response?.data?.message || 'Failed to submit quote request');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <FaQuoteLeft className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Quote Request Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Browse our medicines and add items to request a quote from admin
          </p>
          <button
            onClick={() => navigate('/medicines')}
            className="btn-primary"
          >
            Browse Medicines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quote Request Cart</h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-800">
            <strong>ℹ️ How it works:</strong> Add medicines to your cart and submit a quote request. 
            Our admin will review your request and provide you with the best prices within 24 hours.
          </p>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cartItems.map(item => (
            <div key={item.medicine_id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>

                <button
                  onClick={() => removeFromCart(item.medicine_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.medicine_id, Math.max(1, item.quantity - 1))}
                    className="btn-secondary p-2"
                  >
                    <FaMinus />
                  </button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                    className="btn-secondary p-2"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Item Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special requirements for this item (optional):
                </label>
                <textarea
                  value={itemNotes[item.medicine_id] || ''}
                  onChange={(e) => handleItemNoteChange(item.medicine_id, e.target.value)}
                  placeholder="E.g., Need urgently, prefer specific brand, etc."
                  className="input-field"
                  rows="2"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Global Notes */}
        <div className="card p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional notes for your quote request (optional):
          </label>
          <textarea
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Any additional information you'd like to share..."
            className="input-field"
            rows="4"
          />
        </div>

        {/* Summary */}
        <div className="card p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="font-semibold">{getCartCount()}</span>
            </div>
            <div className="flex justify-between">
              <span>Unique Medicines:</span>
              <span className="font-semibold">{cartItems.length}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            💰 <strong>Price:</strong> Admin will provide pricing based on your requirements and current market rates.
          </p>

          <button
            onClick={handleSubmitQuoteRequest}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Submitting...' : '📤 Submit Quote Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestCart;
