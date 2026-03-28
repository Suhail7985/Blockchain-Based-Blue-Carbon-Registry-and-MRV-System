import mongoose from 'mongoose';
import User from '../models/User.js';

async function activate() {
  await mongoose.connect('mongodb://localhost:27017/blue_carbon_db');
  
  const res = await User.updateMany(
    { role: 'panchayat' },
    { $set: { accountStatus: 'ACTIVE' } }
  );
  console.log('Activated Panchayats:', res);

  mongoose.disconnect();
}
activate();
