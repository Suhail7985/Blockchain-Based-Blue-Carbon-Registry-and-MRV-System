import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected.');

    const demoUsers = [
      {
        name: 'NCCR National Admin',
        email: 'nccr.admin@test.gov.in',
        password: 'Admin@1234',
        role: 'admin',
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        isEmailVerified: true,
        referenceId: 'REF-ADMIN-NCCR-001'
      },
      {
        name: 'Panchayat Local Officer',
        email: 'panchayat.local@test.gov.in',
        password: 'Test@1234',
        role: 'panchayat',
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        isEmailVerified: true,
        district: 'South 24 Parganas',
        state: 'West Bengal',
        panchayatName: 'Sundarbans Gram Panchayat',
        referenceId: 'REF-PAN-LOC-001'
      }
    ];

    for (const uData of demoUsers) {
      const exists = await User.findOne({ email: uData.email });
      if (exists) {
        console.log(`User ${uData.email} already exists. Skipping.`);
        continue;
      }

      const user = new User(uData);
      // Password hashing is handled by pre-save hook in User model
      await user.save();
      console.log(`✅ Created ${uData.role}: ${uData.email}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
