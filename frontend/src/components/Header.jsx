import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHome, FaPills } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <FaPills className="text-primary-600 text-3xl" />
            <div>
              <h1 className="text-xl font-bold text-primary-700">RAJINI PHARMA</h1>
              <p className="text-xs text-gray-600">Generic Common & Surgicals</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition">
              <FaHome />
              <span>Home</span>
            </Link>
            <Link to="/medicines" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition">
              <FaPills />
              <span>Medicines</span>
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition">
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition font-semibold">
                <MdDashboard />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <FaShoppingCart className="text-2xl text-gray-700 hover:text-primary-600 transition" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition"
                >
                  <FaSignOutAlt />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center">
            📍 No. 153/1A1A1, Periyasavalai Main Road, Anna Nagar, Thirukoilur - 605757 | 📞 Contact: Available at store
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;

