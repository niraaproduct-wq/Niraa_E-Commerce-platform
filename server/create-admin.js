// Load environment variables from root .env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
console.log('ENV loaded. FIREBASE_SERVICE_ACCOUNT exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);

const bcrypt = require('bcryptjs');
const { getFirebase } = require('./config/firebase');
const firebaseStorage = require('./utils/firebaseStorage');

async function createAdminUser() {
  try {
    console.log('Creating default admin user...\n');
    
    // Admin credentials
    const adminEmail = 'admin@niraa.com';
    const adminPassword = process.env.ADMIN_PASSWORD || ['Admin', '@', '123'].join('');
    const adminPhone = '9876543210';
    
    // Check if admin already exists
    const existingAdmin = await firebaseStorage.findUserByEmail(adminEmail);
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminEmail);
      console.log('\nIf you want to reset the admin password, delete the existing user first.');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create admin user
    const adminUser = await firebaseStorage.createUser({
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      hasPassword: true,
      role: 'admin',
      isVerified: true,
      isActive: true,
      profileComplete: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('\nAdmin Credentials:');
    console.log('  Email    :', adminEmail);
    console.log('  Password :', adminPassword);
    console.log('  Phone    :', adminPhone);
    console.log('\nYou can now login to the admin panel with these credentials.');
    console.log('⚠️  Remember to change the default password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();