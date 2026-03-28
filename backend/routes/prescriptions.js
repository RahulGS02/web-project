const express = require('express');
const router = express.Router();
const {
  uploadPrescription,
  getPrescriptions,
  updatePrescriptionStatus
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, upload.single('prescription'), uploadPrescription)
  .get(protect, getPrescriptions);

router.put('/:id', protect, authorize('admin'), updatePrescriptionStatus);

module.exports = router;

