const ExcelHandler = require('../utils/excelHandler');

const usersDB = new ExcelHandler('users.xlsx');

// Find user by email and make them admin
const email = 'rahul30@gmail.com';

const users = usersDB.findAll({ email: email });

if (users.length > 0) {
  const user = users[0];
  usersDB.update(user.user_id, { role: 'admin' }, 'user_id');
  console.log(`✅ User ${user.name} (${email}) is now an admin!`);
  console.log(`User ID: ${user.user_id}`);
} else {
  console.log(`❌ User with email ${email} not found`);
}

