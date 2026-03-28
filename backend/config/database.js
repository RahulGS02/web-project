const ExcelHandler = require('../utils/excelHandler');

// Initialize Excel handlers for each data entity
const medicinesDB = new ExcelHandler('medicines.xlsx');
const usersDB = new ExcelHandler('users.xlsx');
const ordersDB = new ExcelHandler('orders.xlsx');
const orderItemsDB = new ExcelHandler('order_items.xlsx');
const prescriptionsDB = new ExcelHandler('prescriptions.xlsx');
const paymentsDB = new ExcelHandler('payments.xlsx');

module.exports = {
  medicinesDB,
  usersDB,
  ordersDB,
  orderItemsDB,
  prescriptionsDB,
  paymentsDB
};

