const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const { medicinesDB } = require('../config/database');

// @desc    Get inventory overview
// @route   GET /api/inventory
// @access  Private/Admin
exports.getInventory = async (req, res) => {
  try {
    const medicines = medicinesDB.readData();
    
    // Calculate statistics
    const totalMedicines = medicines.length;
    const lowStockMedicines = medicines.filter(m => m.stock_quantity < 10);
    const outOfStockMedicines = medicines.filter(m => m.stock_quantity === 0);
    
    // Check for expiring medicines (within 30 days)
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);
    
    const expiringMedicines = medicines.filter(m => {
      if (!m.expiry_date) return false;
      const expiryDate = new Date(m.expiry_date);
      return expiryDate > currentDate && expiryDate <= thirtyDaysFromNow;
    });

    res.status(200).json({
      success: true,
      data: {
        totalMedicines,
        lowStockCount: lowStockMedicines.length,
        outOfStockCount: outOfStockMedicines.length,
        expiringCount: expiringMedicines.length,
        lowStockMedicines,
        outOfStockMedicines,
        expiringMedicines
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Import medicines from Excel
// @route   POST /api/inventory/import-excel
// @access  Private/Admin
exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file'
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.name || !row.category || !row.price) {
          errors.push(`Row skipped: Missing required fields (name, category, or price)`);
          continue;
        }

        // Check if medicine already exists by name
        const existingMedicines = medicinesDB.readData();
        const existingMedicine = existingMedicines.find(m => 
          m.name.toLowerCase() === row.name.toLowerCase()
        );

        if (existingMedicine) {
          // Update existing medicine
          medicinesDB.update(existingMedicine.medicine_id, {
            category: row.category,
            description: row.description || '',
            price: parseFloat(row.price),
            stock_quantity: parseInt(row.stock_quantity) || 0,
            requires_prescription: row.requires_prescription || false,
            expiry_date: row.expiry_date || '',
            updated_at: new Date().toISOString()
          }, 'medicine_id');
          updatedCount++;
        } else {
          // Create new medicine
          const newMedicine = {
            medicine_id: uuidv4(),
            name: row.name,
            category: row.category,
            description: row.description || '',
            price: parseFloat(row.price),
            stock_quantity: parseInt(row.stock_quantity) || 0,
            requires_prescription: row.requires_prescription || false,
            expiry_date: row.expiry_date || '',
            created_at: new Date().toISOString()
          };
          medicinesDB.create(newMedicine);
          importedCount++;
        }
      } catch (error) {
        errors.push(`Error processing row: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Excel import completed',
      data: {
        importedCount,
        updatedCount,
        totalProcessed: importedCount + updatedCount,
        errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export medicines to Excel
// @route   GET /api/inventory/export-excel
// @access  Private/Admin
exports.exportExcel = async (req, res) => {
  try {
    const medicines = medicinesDB.readData();

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(medicines);
    XLSX.utils.book_append_sheet(wb, ws, 'Medicines');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=medicines_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Fix medicine IDs (one-time migration)
// @route   POST /api/inventory/fix-medicine-ids
// @access  Private/Admin
exports.fixMedicineIds = async (req, res) => {
  try {
    const medicines = medicinesDB.readData();
    let fixedCount = 0;
    const fixes = [];

    medicines.forEach((medicine) => {
      if (!medicine.medicine_id || medicine.medicine_id === 'undefined' || medicine.medicine_id === '') {
        const newId = uuidv4();
        medicine.medicine_id = newId;
        fixedCount++;
        fixes.push({
          name: medicine.name,
          newId: newId
        });
      }
    });

    if (fixedCount > 0) {
      medicinesDB.writeData(medicines);
      res.status(200).json({
        success: true,
        message: `Fixed ${fixedCount} medicines`,
        data: {
          fixedCount,
          fixes
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'All medicines already have valid IDs',
        data: {
          fixedCount: 0
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// @desc    Fix medicine IDs (one-time migration)
// @route   POST /api/inventory/fix-medicine-ids
// @access  Private/Admin
exports.fixMedicineIds = async (req, res) => {
  try {
    const medicines = medicinesDB.readData();
    let fixedCount = 0;
    const fixes = [];

    medicines.forEach((medicine) => {
      if (!medicine.medicine_id || medicine.medicine_id === 'undefined' || medicine.medicine_id === '') {
        const newId = uuidv4();
        medicine.medicine_id = newId;
        fixedCount++;
        fixes.push({
          name: medicine.name,
          newId: newId
        });
      }
    });

    if (fixedCount > 0) {
      medicinesDB.writeData(medicines);
      res.status(200).json({
        success: true,
        message: `Fixed ${fixedCount} medicines`,
        data: {
          fixedCount,
          fixes
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'All medicines already have valid IDs',
        data: {
          fixedCount: 0
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

