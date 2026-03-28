const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getMedicines)
  .post(protect, authorize('admin'), createMedicine);

router.route('/:id')
  .get(getMedicine)
  .put(protect, authorize('admin'), updateMedicine)
  .delete(protect, authorize('admin'), deleteMedicine);

module.exports = router;

