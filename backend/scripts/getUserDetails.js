const ExcelHandler = require('../utils/excelHandler');

const usersDB = new ExcelHandler('users.xlsx');

// Get all users
const users = usersDB.readData();

console.log('\n=== ALL USERS IN DATABASE ===\n');

users.forEach(user => {
  console.log('-----------------------------------');
  console.log(`Name: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Phone: ${user.phone}`);
  console.log(`Role: ${user.role}`);
  console.log(`User ID: ${user.user_id}`);
  console.log(`Created: ${user.created_at}`);
  console.log('-----------------------------------\n');
});

console.log(`\nTotal Users: ${users.length}\n`);
console.log('NOTE: Passwords are hashed for security and cannot be retrieved.');
console.log('If you forgot your password, you need to register a new account or reset it.\n');

