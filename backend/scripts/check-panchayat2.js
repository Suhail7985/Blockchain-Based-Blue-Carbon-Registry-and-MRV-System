import mongoose from 'mongoose';
import User from '../models/User.js';

async function check() {
  await mongoose.connect('mongodb://localhost:27017/blue_carbon_db');
  
  const panchayat2 = await User.findById('69c5768637434d85bad4f36a').lean();
  console.log('PANCHAYAT 2 FULL:', JSON.stringify(panchayat2, null, 2));

  mongoose.disconnect();
}
check();
