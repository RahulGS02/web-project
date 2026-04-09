import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import Cart from './pages/Cart';
import CheckoutWithPayment from './pages/CheckoutWithPayment';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import PaymentSuccess from './pages/PaymentSuccess';
import QuoteRequestCart from './pages/QuoteRequestCart';
import MyQuotes from './pages/MyQuotes';
import QuoteDetail from './pages/QuoteDetail';
import ModifyQuote from './pages/ModifyQuote';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import AdminOrders from './pages/admin/AdminOrders';
import FinanceDashboard from './pages/admin/FinanceDashboard';
import AdminQuoteRequests from './pages/admin/AdminQuoteRequests';
import SetQuotePrices from './pages/admin/SetQuotePrices';
import AdminQuoteDetail from './pages/admin/AdminQuoteDetail';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes with Layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/medicines" element={<Layout><Medicines /></Layout>} />
            <Route path="/cart" element={<Layout><QuoteRequestCart /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Customer Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Layout><CheckoutWithPayment /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout><Orders /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <Layout><PaymentSuccess /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-quotes"
              element={
                <ProtectedRoute>
                  <Layout><MyQuotes /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quote/:orderId"
              element={
                <ProtectedRoute>
                  <Layout><QuoteDetail /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quote/:orderId/modify"
              element={
                <ProtectedRoute>
                  <Layout><ModifyQuote /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="finance" element={<FinanceDashboard />} />
              <Route path="quote-requests" element={<AdminQuoteRequests />} />
              <Route path="quote/:orderId" element={<AdminQuoteDetail />} />
              <Route path="quote/:orderId/set-prices" element={<SetQuotePrices />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Layout><div className="container mx-auto px-4 py-16 text-center"><h1 className="text-4xl font-bold">404 - Page Not Found</h1></div></Layout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

