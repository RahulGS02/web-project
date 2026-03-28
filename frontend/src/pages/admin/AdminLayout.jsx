import { Link, Outlet, useLocation } from 'react-router-dom';
import { MdDashboard, MdInventory, MdShoppingCart } from 'react-icons/md';
import { FaHome, FaMoneyBillWave } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/admin/inventory', icon: <MdInventory />, label: 'Inventory' },
    { path: '/admin/orders', icon: <MdShoppingCart />, label: 'Orders' },
    { path: '/admin/finance', icon: <FaMoneyBillWave />, label: 'Finance' }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-primary-700 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">RAJINI PHARMA - Admin Panel</h1>
            <Link to="/" className="flex items-center space-x-2 bg-primary-600 px-4 py-2 rounded hover:bg-primary-500 transition">
              <FaHome />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

