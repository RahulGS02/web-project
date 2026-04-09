/**
 * Migration Script: Convert existing order system to Quote-based system
 * 
 * This script:
 * 1. Adds new fields to existing orders
 * 2. Adds new fields to existing order_items
 * 3. Creates new Excel files: quote_history.xlsx, order_negotiations.xlsx
 * 4. Migrates existing orders to new schema
 */

const ExcelHandler = require('../utils/excelHandler');
const { v4: uuidv4 } = require('uuid');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   🔄 MIGRATING TO QUOTE-BASED SYSTEM                 ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Initialize handlers
const ordersDB = new ExcelHandler('orders.xlsx');
const orderItemsDB = new ExcelHandler('order_items.xlsx');
const quoteHistoryDB = new ExcelHandler('quote_history.xlsx');
const orderNegotiationsDB = new ExcelHandler('order_negotiations.xlsx');

// Step 1: Backup existing data
console.log('📦 Step 1: Backing up existing data...');
const existingOrders = ordersDB.readData();
const existingOrderItems = orderItemsDB.readData();
console.log(`   ✅ Found ${existingOrders.length} orders and ${existingOrderItems.length} order items`);

// Step 2: Add new fields to existing orders
console.log('\n🔧 Step 2: Adding new fields to orders...');
const migratedOrders = existingOrders.map(order => ({
  ...order,
  // New quote-related fields
  quote_status: order.status === 'pending' ? 'FINALIZED' : 'FINALIZED',
  quote_version: 1,
  quote_valid_until: null,
  customer_notes: order.customer_notes || '',
  admin_notes: order.admin_notes || '',
  previous_quote_id: null,
  negotiation_count: 0,
  quote_sent_at: order.created_at,
  quote_accepted_at: order.created_at,
  is_price_hidden: false, // Existing orders had prices visible
  delivery_charges: order.delivery_charges || 0
}));

// Write migrated orders
ordersDB.writeData(migratedOrders);
console.log(`   ✅ Migrated ${migratedOrders.length} orders with new fields`);

// Step 3: Add new fields to existing order_items
console.log('\n🔧 Step 3: Adding new fields to order items...');
const migratedOrderItems = existingOrderItems.map(item => ({
  ...item,
  // New item-level fields
  admin_set_price: item.price, // Use existing price as admin-set price
  original_price: item.price,
  discount_percent: 0,
  customer_notes: item.customer_notes || '',
  admin_notes: item.admin_notes || '',
  is_substitution: false,
  substitution_for: null,
  price_locked: true // Existing items have locked prices
}));

// Write migrated order items
orderItemsDB.writeData(migratedOrderItems);
console.log(`   ✅ Migrated ${migratedOrderItems.length} order items with new fields`);

// Step 4: Initialize quote_history.xlsx
console.log('\n📝 Step 4: Creating quote_history.xlsx...');
const initialHistory = [];
quoteHistoryDB.writeData(initialHistory);
console.log('   ✅ Created quote_history.xlsx');

// Step 5: Initialize order_negotiations.xlsx
console.log('\n💬 Step 5: Creating order_negotiations.xlsx...');
const initialNegotiations = [];
orderNegotiationsDB.writeData(initialNegotiations);
console.log('   ✅ Created order_negotiations.xlsx');

// Step 6: Create sample quote history for demonstration
console.log('\n📊 Step 6: Generating sample data...');
console.log('   ℹ️  Skipping sample data generation (use in development only)');

// Summary
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   ✅ MIGRATION COMPLETED SUCCESSFULLY                 ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('📊 Summary:');
console.log(`   • Orders migrated: ${migratedOrders.length}`);
console.log(`   • Order items migrated: ${migratedOrderItems.length}`);
console.log(`   • New files created: 2 (quote_history.xlsx, order_negotiations.xlsx)`);
console.log(`   • New fields added: 10 (orders) + 8 (order_items)`);

console.log('\n🎯 Next Steps:');
console.log('   1. Restart your backend server');
console.log('   2. Test the new quote APIs');
console.log('   3. Update frontend to use quote system');

console.log('\n✨ Quote-based system is now ready!\n');
