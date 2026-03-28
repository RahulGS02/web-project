const express = require('express');
const router = express.Router();
const {
  getInventory,
  importExcel,
  exportExcel
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, authorize('admin'), getInventory);
router.post('/import-excel', protect, authorize('admin'), upload.single('file'), importExcel);
router.get('/export-excel', protect, authorize('admin'), exportExcel);

module.exports = router;

