const { v4: uuidv4 } = require('uuid');
const { medicinesDB } = require('../config/database');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
exports.getMedicines = async (req, res) => {
  try {
    const { category, search, requires_prescription } = req.query;
    let medicines = medicinesDB.readData();

    // Filter by category
    if (category) {
      medicines = medicines.filter(m => 
        m.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by prescription requirement
    if (requires_prescription !== undefined) {
      const requiresPrescription = requires_prescription === 'true';
      medicines = medicines.filter(m => m.requires_prescription === requiresPrescription);
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      medicines = medicines.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        (m.description && m.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter out expired medicines
    const currentDate = new Date();
    medicines = medicines.filter(m => {
      if (!m.expiry_date) return true;
      return new Date(m.expiry_date) > currentDate;
    });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicine = async (req, res) => {
  try {
    const medicine = medicinesDB.findById(req.params.id, 'medicine_id');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private/Admin
exports.createMedicine = async (req, res) => {
  try {
    const { name, category, description, price, stock_quantity, requires_prescription, expiry_date } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category and price'
      });
    }

    const newMedicine = {
      medicine_id: uuidv4(),
      name,
      category,
      description: description || '',
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity) || 0,
      requires_prescription: requires_prescription || false,
      expiry_date: expiry_date || '',
      created_at: new Date().toISOString()
    };

    medicinesDB.create(newMedicine);

    res.status(201).json({
      success: true,
      data: newMedicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = medicinesDB.findById(req.params.id, 'medicine_id');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    const updatedData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const success = medicinesDB.update(req.params.id, updatedData, 'medicine_id');

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update medicine'
      });
    }

    const updatedMedicine = medicinesDB.findById(req.params.id, 'medicine_id');

    res.status(200).json({
      success: true,
      data: updatedMedicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
exports.deleteMedicine = async (req, res) => {
  try {
    const success = medicinesDB.delete(req.params.id, 'medicine_id');

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

