import mongoose from 'mongoose';
import User from '../models/User.js';
import Plantation from '../models/Plantation.js';

async function check() {
  await mongoose.connect('mongodb://localhost:27017/blue_carbon_db');
  
  const panchayats = await User.find({ role: 'panchayat' }).select('name district state panchayatName').lean();
  console.log('PANCHAYATS:', JSON.stringify(panchayats, null, 2));

  const users = await User.find({ role: 'citizen' }).select('name accountStatus district state').lean();
  console.log('CITIZENS:', JSON.stringify(users, null, 2));

  const plantations = await Plantation.find().select('status district state panchayatName').lean();
  console.log('PLANTATIONS:', JSON.stringify(plantations, null, 2));

  mongoose.disconnect();
}
check();
