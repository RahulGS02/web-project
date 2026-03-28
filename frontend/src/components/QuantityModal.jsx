import { useState } from 'react';
import { FaMinus, FaPlus, FaTimes } from 'react-icons/fa';

const QuantityModal = ({ medicine, onConfirm, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    if (quantity < medicine.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleConfirm = () => {
    onConfirm(medicine, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{medicine.name}</h3>
            <p className="text-sm text-gray-600">{medicine.category}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Price */}
        <div className="mb-6">
          <p className="text-2xl font-bold text-primary-600">Rs. {medicine.price}</p>
          <p className="text-sm text-gray-600">Available: {medicine.stock_quantity} units</p>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Quantity
          </label>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMinus size={16} />
            </button>
            
            <div className="text-center">
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (val >= 1 && val <= medicine.stock_quantity) {
                    setQuantity(val);
                  }
                }}
                min="1"
                max={medicine.stock_quantity}
                className="w-20 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Quantity</p>
            </div>
            
            <button
              onClick={handleIncrease}
              disabled={quantity >= medicine.stock_quantity}
              className="bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus size={16} />
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Total Price:</span>
            <span className="text-2xl font-bold text-primary-600">
              Rs. {(medicine.price * quantity).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Prescription Warning */}
        {medicine.requires_prescription && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This medicine requires a valid prescription. You will need to upload it during checkout.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;

