/**
 * Test MongoDB Connection
 * Run this script to test if MongoDB connection is working
 * Usage: node scripts/test-db.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testDatabase = async () => {
  console.log('🧪 Testing MongoDB Connection...\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/signup_db';
  console.log('MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ SUCCESS! MongoDB connected successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);

    // Test TempUser model
    const TempUser = (await import('../models/TempUser.js')).default;
    console.log('\n✅ TempUser model loaded');

    // Test User model
    const User = (await import('../models/User.js')).default;
    console.log('✅ User model loaded');

    await mongoose.disconnect();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ FAILED to connect to MongoDB');
    console.error('Error:', error.message);

    if (error.name === 'MongoServerError') {
      console.error('\n🔐 Authentication Error:');
      console.error('Check your MongoDB credentials in MONGODB_URI');
    } else if (error.name === 'MongoNetworkError') {
      console.error('\n🌐 Network Error:');
      console.error('Cannot reach MongoDB server. Check:');
      console.error('1. MongoDB is running (if local)');
      console.error('2. MONGODB_URI is correct');
      console.error('3. Network/firewall allows connection');
    } else {
      console.error('\nFull error details:', error);
    }

    process.exit(1);
  }
};

testDatabase();
