const { v4: uuidv4 } = require('uuid');
const ExcelHandler = require('../utils/excelHandler');

const medicinesDB = new ExcelHandler('medicines.xlsx');

console.log('\n=== 🔧 FIXING MEDICINE IDs ===\n');

// Read all medicines
const medicines = medicinesDB.readData();
console.log(`Found ${medicines.length} medicines\n`);

// Check current state
console.log('Current medicine IDs:');
medicines.forEach((med, idx) => {
  console.log(`${idx + 1}. ${med.name}: medicine_id = ${med.medicine_id || 'MISSING!'}`);
});

// Ask for confirmation
console.log('\n⚠️ This will assign new UUIDs to all medicines without medicine_id');
console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

setTimeout(() => {
  let fixedCount = 0;
  
  medicines.forEach((medicine, idx) => {
    if (!medicine.medicine_id || medicine.medicine_id === 'undefined' || medicine.medicine_id === '') {
      // Generate new ID
      const newId = uuidv4();
      medicine.medicine_id = newId;
      fixedCount++;
      console.log(`✅ Fixed: ${medicine.name} -> ${newId}`);
    }
  });
  
  if (fixedCount > 0) {
    // Write back to database
    medicinesDB.writeData(medicines);
    console.log(`\n✅ Fixed ${fixedCount} medicines`);
    console.log('✅ Database updated successfully!');
  } else {
    console.log('\n✅ All medicines already have valid IDs');
  }
  
  console.log('\n=== 🎉 DONE ===\n');
}, 3000);

