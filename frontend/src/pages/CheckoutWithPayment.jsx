import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';

// Indian States and major cities
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

const MAJOR_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur', 'Other'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belgaum', 'Other'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Other'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Other'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', 'Ajmer', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Other'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Rohtak', 'Other'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Other'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Other']
};

const CheckoutWithPayment = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [formData, setFormData] = useState({
    // Shipping Address
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
    shipping_phone: user?.phone || '',
    shipping_country: 'India',

    // Billing Address
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_pincode: '',
    billing_phone: user?.phone || '',
    billing_country: 'India',

    // Same as shipping checkbox
    billing_same_as_shipping: true,

    payment_method: 'online'
  });

  const [availableCities, setAvailableCities] = useState([]);

  // Update available cities when state changes
  useEffect(() => {
    if (formData.shipping_state && MAJOR_CITIES[formData.shipping_state]) {
      setAvailableCities(MAJOR_CITIES[formData.shipping_state]);
    } else {
      setAvailableCities([]);
    }
  }, [formData.shipping_state]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Calculate financials
  useEffect(() => {
    if (cartItems.length > 0) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const gstRate = 0.12;
      const platformFeeRate = 0.01;
      const gstAmount = subtotal * gstRate;
      const platformFee = subtotal * platformFeeRate;
      const totalAmount = subtotal + gstAmount + platformFee;

      setFinancials({
        subtotal: subtotal.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        gstRate: (gstRate * 100).toFixed(0),
        platformFee: platformFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2)
      });
    }
  }, [cartItems]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Validate pincode (6 digits)
  const validatePincode = (pincode) => {
    return /^\d{6}$/.test(pincode);
  };

  // Validate Indian phone number (10 digits, starts with 6-9)
  const validatePhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handleRazorpayPayment = async (orderId) => {
    try {
      // Create Razorpay order
      const { data } = await axios.post('/api/payment/create-order', {
        order_id: orderId
      });

      const options = {
        key: data.data.key_id,
        amount: data.data.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'RAJINI PHARMA',
        description: 'Medicine Purchase',
        order_id: data.data.razorpay_order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId
            });

            if (verifyResponse.data.success) {
              clearCart();
              alert('Payment successful! Your order has been placed.');
              navigate(`/orders`);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#1976D2'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate shipping address
    if (!formData.shipping_address_line1 || !formData.shipping_city ||
        !formData.shipping_state || !formData.shipping_pincode || !formData.shipping_phone) {
      alert('Please fill all shipping address fields including phone number');
      return;
    }

    if (!validatePincode(formData.shipping_pincode)) {
      alert('Shipping pincode must be exactly 6 digits');
      return;
    }

    if (!validatePhone(formData.shipping_phone)) {
      alert('Shipping phone number must be exactly 10 digits and start with 6, 7, 8, or 9');
      return;
    }

    // Validate billing address if different
    if (!formData.billing_same_as_shipping) {
      if (!formData.billing_address_line1 || !formData.billing_city ||
          !formData.billing_state || !formData.billing_pincode) {
        alert('Please fill all billing address fields');
        return;
      }

      if (!validatePincode(formData.billing_pincode)) {
        alert('Billing pincode must be 6 digits');
        return;
      }
    }

    setLoading(true);

    try {
      // Construct full addresses with phone
      const shippingAddress = `${formData.shipping_address_line1}, ${formData.shipping_address_line2 ? formData.shipping_address_line2 + ', ' : ''}${formData.shipping_city}, ${formData.shipping_state}, ${formData.shipping_country} - ${formData.shipping_pincode}, Phone: ${formData.shipping_phone}`;

      const billingAddress = formData.billing_same_as_shipping
        ? shippingAddress
        : `${formData.billing_address_line1}, ${formData.billing_address_line2 ? formData.billing_address_line2 + ', ' : ''}${formData.billing_city}, ${formData.billing_state}, ${formData.billing_country} - ${formData.billing_pincode}, Phone: ${formData.billing_phone || formData.shipping_phone}`;

      const orderData = {
        items: cartItems.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity
        })),
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: formData.payment_method
      };

      const response = await axios.post('/api/orders', orderData);
      
      if (response.data.success) {
        const orderId = response.data.data.order_id;
        
        if (formData.payment_method === 'online') {
          // Initiate Razorpay payment
          await handleRazorpayPayment(orderId);
        } else {
          // Cash on delivery
          clearCart();
          alert('Order placed successfully!');
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="input-field bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="shipping_address_line1"
                    value={formData.shipping_address_line1}
                    onChange={handleChange}
                    placeholder="House/Flat No., Building Name, Street"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address Line 2</label>
                  <input
                    type="text"
                    name="shipping_address_line2"
                    value={formData.shipping_address_line2}
                    onChange={handleChange}
                    placeholder="Landmark, Area (Optional)"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Country <span className="text-red-500">*</span></label>
                    <select
                      name="shipping_country"
                      value={formData.shipping_country}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State <span className="text-red-500">*</span></label>
                    <select
                      name="shipping_state"
                      value={formData.shipping_state}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City <span className="text-red-500">*</span></label>
                    {availableCities.length > 0 ? (
                      <select
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <option value="">Select City</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="shipping_city"
                        value={formData.shipping_city}
                        onChange={handleChange}
                        placeholder="Enter City"
                        className="input-field"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="shipping_pincode"
                      value={formData.shipping_pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      pattern="\d{6}"
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 6-digit pincode</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="shipping_phone"
                    value={formData.shipping_phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    pattern="[6-9]\d{9}"
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number starting with 6, 7, 8, or 9</p>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Billing Address</h2>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="billing_same_as_shipping"
                    checked={formData.billing_same_as_shipping}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-sm font-medium">Same as shipping address</span>
                </label>
              </div>

              {!formData.billing_same_as_shipping && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="billing_address_line1"
                      value={formData.billing_address_line1}
                      onChange={handleChange}
                      placeholder="House/Flat No., Building Name, Street"
                      className="input-field"
                      required={!formData.billing_same_as_shipping}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2</label>
                    <input
                      type="text"
                      name="billing_address_line2"
                      value={formData.billing_address_line2}
                      onChange={handleChange}
                      placeholder="Landmark, Area (Optional)"
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="billing_city"
                        value={formData.billing_city}
                        onChange={handleChange}
                        placeholder="City"
                        className="input-field"
                        required={!formData.billing_same_as_shipping}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">State <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="billing_state"
                        value={formData.billing_state}
                        onChange={handleChange}
                        placeholder="State"
                        className="input-field"
                        required={!formData.billing_same_as_shipping}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="billing_pincode"
                      value={formData.billing_pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      pattern="\d{6}"
                      className="input-field"
                      required={!formData.billing_same_as_shipping}
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 6-digit pincode</p>
                  </div>
                </div>
              )}

              {formData.billing_same_as_shipping && (
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                  Billing address will be same as shipping address
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={formData.payment_method === 'online'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <FaCreditCard className="text-2xl text-blue-600 mr-3" />
                  <div>
                    <div className="font-semibold">Online Payment</div>
                    <div className="text-sm text-gray-600">Pay securely via UPI, Card, or Net Banking</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={formData.payment_method === 'cash_on_delivery'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <FaMoneyBillWave className="text-2xl text-green-600 mr-3" />
                  <div>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive</div>
                  </div>
                </label>
              </div>

              {formData.payment_method === 'online' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start">
                  <FaShieldAlt className="text-blue-600 mr-3 mt-1" />
                  <div className="text-sm text-gray-700">
                    <strong>Secure Payment:</strong> Your payment is processed securely through Razorpay.
                    We support UPI, Credit/Debit Cards, and Net Banking.
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? 'Processing...' : formData.payment_method === 'online' ? 'Proceed to Payment' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.medicine_id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{financials?.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST ({financials?.gstRate}%)</span>
                <span>₹{financials?.gstAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee</span>
                <span>₹{financials?.platformFee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">₹{financials?.totalAmount}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-800">
              <strong>Note:</strong> All prices include applicable taxes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWithPayment;

