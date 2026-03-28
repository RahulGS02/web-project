const bcrypt = require('bcryptjs');
const ExcelHandler = require('../utils/excelHandler');

const usersDB = new ExcelHandler('users.xlsx');

// Configuration
const email = 'rahul30@gmail.com';
const newPassword = 'Admin@123';  // Change this to your desired password

async function resetPassword() {
  try {
    // Find user
    const users = usersDB.readData();
    const user = users.find(u => u.email === email);

    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    usersDB.update(user.user_id, { password_hash: hashedPassword }, 'user_id');

    console.log('\n=== PASSWORD RESET SUCCESSFUL ===\n');
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    console.log(`Role: ${user.role}`);
    console.log('\nYou can now login with these credentials!\n');
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

resetPassword();

