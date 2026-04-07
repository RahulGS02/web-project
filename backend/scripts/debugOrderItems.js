const ExcelHandler = require('../utils/excelHandler');

// Initialize handlers
const orderItemsDB = new ExcelHandler('order_items.xlsx');
const ordersDB = new ExcelHandler('orders.xlsx');
const medicinesDB = new ExcelHandler('medicines.xlsx');

console.log('\n=== 🔍 DEBUG: ORDER ITEMS ANALYSIS ===\n');

// Get all orders
const orders = ordersDB.readData();
console.log(`📦 Total orders in database: ${orders.length}\n`);

// Get the most recent order
const recentOrders = orders
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .slice(0, 3);

console.log('📋 Last 3 orders:\n');
recentOrders.forEach((order, idx) => {
  console.log(`${idx + 1}. Order ID: ${order.order_id}`);
  console.log(`   Created: ${order.created_at}`);
  console.log(`   Total: ₹${order.total_amount}`);
  console.log(`   Status: ${order.status}`);
  
  // Get items for this order
  const items = orderItemsDB.findAll({ order_id: order.order_id });
  console.log(`   Items found: ${items.length}`);
  
  if (items.length > 0) {
    items.forEach((item, itemIdx) => {
      console.log(`      ${itemIdx + 1}. ${item.medicine_name} x ${item.quantity} = ₹${item.subtotal}`);
      console.log(`         Medicine ID: ${item.medicine_id}`);
      console.log(`         Order Item ID: ${item.order_item_id}`);
    });
  } else {
    console.log('      ⚠️ NO ITEMS FOUND!');
  }
  console.log('');
});

// Check all order items
console.log('\n=== 📦 ALL ORDER ITEMS IN DATABASE ===\n');
const allOrderItems = orderItemsDB.readData();
console.log(`Total order items: ${allOrderItems.length}\n`);

// Group by medicine name
const itemsByMedicine = {};
allOrderItems.forEach(item => {
  if (!itemsByMedicine[item.medicine_name]) {
    itemsByMedicine[item.medicine_name] = 0;
  }
  itemsByMedicine[item.medicine_name]++;
});

console.log('Items grouped by medicine name:');
Object.entries(itemsByMedicine).forEach(([name, count]) => {
  console.log(`  - ${name}: ${count} order items`);
});

// Check medicines database
console.log('\n=== 💊 MEDICINES IN DATABASE ===\n');
const medicines = medicinesDB.readData();
console.log(`Total medicines: ${medicines.length}\n`);

// Find Paracetamol and Multivitamin
const paracetamol = medicines.find(m => m.name.includes('Paracetamol'));
const multivitamin = medicines.find(m => m.name.includes('Multivitamin'));

if (paracetamol) {
  console.log('Paracetamol found:');
  console.log(`  ID: ${paracetamol.medicine_id}`);
  console.log(`  Name: ${paracetamol.name}`);
  console.log(`  Price: ₹${paracetamol.price}`);
} else {
  console.log('⚠️ Paracetamol NOT FOUND');
}

console.log('');

if (multivitamin) {
  console.log('Multivitamin found:');
  console.log(`  ID: ${multivitamin.medicine_id}`);
  console.log(`  Name: ${multivitamin.name}`);
  console.log(`  Price: ₹${multivitamin.price}`);
} else {
  console.log('⚠️ Multivitamin NOT FOUND');
}

console.log('\n=== 🔍 DEBUG COMPLETE ===\n');

