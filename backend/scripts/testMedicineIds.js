const ExcelHandler = require('../utils/excelHandler');

const medicinesDB = new ExcelHandler('medicines.xlsx');

console.log('\n=== 🧪 TESTING MEDICINE IDs ===\n');

const medicines = medicinesDB.readData();

console.log('Medicine IDs Status:\n');
medicines.forEach((med, idx) => {
  const hasId = med.medicine_id && med.medicine_id !== 'undefined' && med.medicine_id !== '';
  console.log(`${idx + 1}. ${med.name.padEnd(30)} | ID: ${hasId ? '✅ ' + med.medicine_id.substring(0, 8) + '...' : '❌ MISSING'}`);
});

const missingIds = medicines.filter(m => !m.medicine_id || m.medicine_id === 'undefined' || m.medicine_id === '');
const validIds = medicines.filter(m => m.medicine_id && m.medicine_id !== 'undefined' && m.medicine_id !== '');

console.log(`\n📊 Summary:`);
console.log(`   Total medicines: ${medicines.length}`);
console.log(`   ✅ Valid IDs: ${validIds.length}`);
console.log(`   ❌ Missing IDs: ${missingIds.length}`);

if (missingIds.length === 0) {
  console.log('\n✅ All medicines have valid IDs! Cart should work now.');
} else {
  console.log('\n❌ Some medicines are missing IDs! Cart will NOT work correctly.');
  console.log('\nRun: node backend/scripts/fixMedicineIds.js');
}

console.log('\n');
