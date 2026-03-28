import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some medicines to get started</p>
        <Link to="/medicines" className="btn-primary">
          Browse Medicines
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button onClick={clearCart} className="text-red-600 hover:text-red-700 text-sm">
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.medicine_id} className="card flex items-center space-x-4">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                <p className="text-primary-600 font-bold">₹{item.price} per unit</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)}
                  className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition"
                >
                  <FaMinus className="text-sm" />
                </button>
                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock_quantity}
                  className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.medicine_id)}
                  className="text-red-600 hover:text-red-700 text-sm mt-2 flex items-center space-x-1"
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary-600">₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full mb-3">
              Proceed to Checkout
            </button>
            
            <Link to="/medicines" className="btn-secondary w-full block text-center">
              Continue Shopping
            </Link>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Prescription medicines require valid prescription upload during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

