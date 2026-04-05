import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcert');
    console.log('Connected to MongoDB');
    const existingAdmin = await User.findOne({ email: 'admin@smartcert.edu' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@smartcert.edu',
      password: hashedPassword,
      role: 'Admin',
      department: 'Administration'
    });
    await adminUser.save();
    console.log('✅ Master Admin account successfully seeded!');
    console.log('Email: admin@smartcert.edu');
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};
seedAdmin();
