// Generate bcrypt hash for admin password
// Run: node database/generate-admin-hash.js

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'Admin@123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n==============================================');
  console.log('Admin Password Hash Generated');
  console.log('==============================================\n');
  console.log('Password:', password);
  console.log('\nBcrypt Hash:');
  console.log(hash);
  console.log('\n==============================================');
  console.log('Copy the hash above and paste it into:');
  console.log('database/migration_admin_system.sql');
  console.log('Replace: $2b$10$YourBcryptHashHere');
  console.log('==============================================\n');
});
