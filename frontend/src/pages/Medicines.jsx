import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FaSearch, FaShoppingCart, FaPrescription, FaQuoteLeft } from 'react-icons/fa';
import QuantityModal from '../components/QuantityModal';

// Toggle between quote mode and regular mode
const QUOTE_MODE = true; // Set to true to enable quote-based system

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const { addToCart } = useCart();

  const categories = ['All', 'Pain Relief', 'Antibiotics', 'Diabetes', 'Gastric', 'Allergy', 'Vitamins', 'First Aid', 'Surgical'];

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    fetchMedicines();
  }, [searchParams]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/medicines');
      setMedicines(response.data.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (medicine.description && medicine.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (medicine) => {
    setSelectedMedicine(medicine);
    setShowQuantityModal(true);
  };

  const handleConfirmAddToCart = (medicine, quantity) => {
    addToCart(medicine, quantity);
    alert(`${quantity} x ${medicine.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-xl">Loading medicines...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Browse Medicines</h1>
      <p className="text-gray-600 mb-6">
        {QUOTE_MODE ? 'Add medicines and request a quote from admin' : 'Find the medicines you need'}
      </p>

      {/* Quote Mode Banner */}
      {QUOTE_MODE && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <FaQuoteLeft className="text-blue-500 mt-1 mr-3" />
            <div>
              <h3 className="text-blue-800 font-semibold mb-1">Quote-Based Pricing</h3>
              <p className="text-blue-700 text-sm">
                Add medicines to your cart and submit a quote request. Our admin will review your requirements
                and provide the best prices based on current market rates within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
              className={`px-4 py-2 rounded-lg transition ${
                (selectedCategory === category || (selectedCategory === '' && category === 'All'))
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Showing {filteredMedicines.length} medicine(s)
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No medicines found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedicines.map(medicine => (
            <div key={medicine.medicine_id} className="card hover:shadow-xl transition">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{medicine.name}</h3>
                <span className="badge-info text-xs">{medicine.category}</span>
              </div>

              {medicine.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{medicine.description}</p>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  {QUOTE_MODE ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <FaQuoteLeft />
                      <span className="font-semibold">Price on Request</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-primary-600">₹{medicine.price}</span>
                  )}
                  {medicine.requires_prescription && (
                    <span className="badge-warning text-xs flex items-center gap-1">
                      <FaPrescription /> Rx
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Stock: <span className={medicine.stock_quantity > 10 ? 'text-green-600' : 'text-orange-600'}>
                    {medicine.stock_quantity} units
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(medicine)}
                disabled={medicine.stock_quantity === 0}
                className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg transition ${
                  medicine.stock_quantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {QUOTE_MODE ? (
                  <>
                    <FaQuoteLeft />
                    <span>{medicine.stock_quantity === 0 ? 'Out of Stock' : 'Add to Quote Request'}</span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    <span>{medicine.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quantity Modal */}
      {showQuantityModal && selectedMedicine && (
        <QuantityModal
          medicine={selectedMedicine}
          onConfirm={handleConfirmAddToCart}
          onClose={() => setShowQuantityModal(false)}
        />
      )}
    </div>
  );
};

export default Medicines;

