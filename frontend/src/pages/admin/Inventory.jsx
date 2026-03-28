import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaDownload } from 'react-icons/fa';

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock_quantity: '',
    requires_prescription: false,
    expiry_date: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('/api/medicines');
      setMedicines(response.data.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMedicine) {
        await axios.put(`/api/medicines/${editingMedicine.medicine_id}`, formData);
        alert('Medicine updated successfully');
      } else {
        await axios.post('/api/medicines', formData);
        alert('Medicine added successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchMedicines();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      description: medicine.description || '',
      price: medicine.price,
      stock_quantity: medicine.stock_quantity,
      requires_prescription: medicine.requires_prescription,
      expiry_date: medicine.expiry_date || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    
    try {
      await axios.delete(`/api/medicines/${id}`);
      alert('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      alert('Failed to delete medicine');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      stock_quantity: '',
      requires_prescription: false,
      expiry_date: ''
    });
    setEditingMedicine(null);
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/inventory/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Import completed: ${response.data.data.importedCount} imported, ${response.data.data.updatedCount} updated`);
      fetchMedicines();
    } catch (error) {
      alert('Excel import failed');
    }
  };

  const handleExcelExport = async () => {
    try {
      const response = await axios.get('/api/inventory/export-excel', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'medicines_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Excel export failed');
    }
  };

  if (loading) {
    return <div className="text-center py-16">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex space-x-3">
          <label className="btn-secondary cursor-pointer flex items-center space-x-2">
            <FaUpload />
            <span>Import Excel</span>
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelImport} className="hidden" />
          </label>
          <button onClick={handleExcelExport} className="btn-secondary flex items-center space-x-2">
            <FaDownload />
            <span>Export Excel</span>
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
            <FaPlus />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-right py-3 px-4">Price</th>
              <th className="text-right py-3 px-4">Stock</th>
              <th className="text-center py-3 px-4">Rx</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(medicine => (
              <tr key={medicine.medicine_id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">{medicine.name}</td>
                <td className="py-3 px-4">{medicine.category}</td>
                <td className="text-right py-3 px-4">₹{medicine.price}</td>
                <td className="text-right py-3 px-4">
                  <span className={medicine.stock_quantity < 10 ? 'text-red-600 font-semibold' : ''}>
                    {medicine.stock_quantity}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  {medicine.requires_prescription ? '✓' : '—'}
                </td>
                <td className="text-center py-3 px-4">
                  <button onClick={() => handleEdit(medicine)} className="text-blue-600 hover:text-blue-800 mr-3">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(medicine.medicine_id)} className="text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Medicine Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} className="input-field" />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="requires_prescription" checked={formData.requires_prescription} onChange={handleChange} className="w-4 h-4" />
                    <span className="text-sm font-medium">Requires Prescription</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="input-field" />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingMedicine ? 'Update' : 'Add'} Medicine
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

