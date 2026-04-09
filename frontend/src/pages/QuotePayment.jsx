import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';

const QuotePayment = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_phone: user?.phone || '',
    payment_method: 'online'
  });

  useEffect(() => {
    fetchOrderDetails();
    loadRazorpay();
  }, [orderId]);

  const loadRazorpay = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        const orderData = response.data.data;
        
        // Verify order is in correct state
        if (orderData.quote_status !== 'QUOTE_ACCEPTED') {
          alert('This quote has not been accepted yet');
          navigate('/my-quotes');
          return;
        }

        setOrder(orderData);
        
        // Pre-fill address if available
        if (orderData.shipping_address) {
          setFormData(prev => ({
            ...prev,
            shipping_address: orderData.shipping_address
          }));
        }
      }
    } catch (error) {
      console.error('Fetch order error:', error);
      alert('Failed to load order details');
      navigate('/my-quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.shipping_address.trim()) {
      alert('Please enter shipping address');
      return;
    }

    if (!formData.shipping_phone.trim() || formData.shipping_phone.length !== 10) {
      alert('Please enter valid 10-digit phone number');
      return;
    }

    setProcessing(true);

    try {
      // Update order with shipping details
      await axios.put(`/api/orders/${orderId}`, {
        shipping_address: formData.shipping_address,
        billing_address: formData.shipping_address,
        payment_method: formData.payment_method
      });

      if (formData.payment_method === 'cod') {
        // Process COD
        const response = await axios.post('/api/payment/process', {
          orderId: orderId,
          paymentMethod: 'cod'
        });

        if (response.data.success) {
          alert(response.data.message || 'Order placed successfully with Cash on Delivery!');
          navigate('/payment-success');
        }
      } else {
        // Process online payment
        const response = await axios.post('/api/payment/create-order', {
          order_id: orderId
        });

        if (response.data.success) {
          const options = {
            key: response.data.razorpayKeyId,
            amount: response.data.amount,
            currency: 'INR',
            name: 'RAJINI PHARMA',
            description: `Payment for Order #${orderId.substring(0, 8)}`,
            order_id: response.data.razorpayOrderId,
            handler: async function (response) {
              try {
                const verifyResponse = await axios.post('/api/payment/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId
                });

                if (verifyResponse.data.success) {
                  navigate('/payment-success');
                }
              } catch (error) {
                alert('Payment verification failed');
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: formData.shipping_phone
            },
            theme: {
              color: '#3b82f6'
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate('/my-quotes')} className="mt-4 btn-primary">
          Back to My Quotes
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {order.items?.map(item => (
                <div key={item.order_item_id} className="flex justify-between text-sm">
                  <span>{item.medicine_name} × {item.quantity}</span>
                  <span>₹{item.subtotal?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (12%)</span>
                <span>₹{order.gst_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span>₹{order.platform_fee?.toFixed(2)}</span>
              </div>
              {order.delivery_charges > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>₹{order.delivery_charges?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">₹{order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            <form onSubmit={handlePayment}>
              {/* Shipping Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Shipping Address *
                </label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address..."
                  className="input-field"
                  rows="3"
                  required
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="shipping_phone"
                  value={formData.shipping_phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="input-field"
                  maxLength="10"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={formData.payment_method === 'online'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <FaCreditCard className="mr-2 text-blue-600" />
                    <span>Online Payment (Cards, UPI, Net Banking)</span>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <FaMoneyBillWave className="mr-2 text-green-600" />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={processing}
                className="btn-primary w-full py-3 text-lg"
              >
                {processing ? (
                  'Processing...'
                ) : formData.payment_method === 'cod' ? (
                  'Place Order (COD)'
                ) : (
                  `Pay ₹${order.total_amount?.toFixed(2)}`
                )}
              </button>

              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <FaShieldAlt className="mr-2" />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePayment;
