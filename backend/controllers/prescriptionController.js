const { v4: uuidv4 } = require('uuid');
const { prescriptionsDB } = require('../config/database');

// @desc    Upload prescription
// @route   POST /api/prescriptions/upload
// @access  Private
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a prescription file'
      });
    }

    const { order_id, notes } = req.body;

    const newPrescription = {
      prescription_id: uuidv4(),
      user_id: req.user.user_id,
      order_id: order_id || '',
      file_path: req.file.path,
      file_name: req.file.filename,
      status: 'pending',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    prescriptionsDB.create(newPrescription);

    res.status(201).json({
      success: true,
      data: newPrescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    let prescriptions;

    if (req.user.role === 'admin') {
      prescriptions = prescriptionsDB.readData();
    } else {
      prescriptions = prescriptionsDB.findAll({ user_id: req.user.user_id });
    }

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id
// @access  Private/Admin
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (admin_notes) {
      updateData.admin_notes = admin_notes;
    }

    const success = prescriptionsDB.update(
      req.params.id,
      updateData,
      'prescription_id'
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    const updatedPrescription = prescriptionsDB.findById(req.params.id, 'prescription_id');

    res.status(200).json({
      success: true,
      data: updatedPrescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

