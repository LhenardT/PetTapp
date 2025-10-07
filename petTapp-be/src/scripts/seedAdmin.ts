import { connectDB } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../types/auth.types';
import { config } from '../config/env';

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const adminUser = new User({
      email: 'admin@pettapp.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@pettapp.com');
    console.log('Password: Admin123!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();