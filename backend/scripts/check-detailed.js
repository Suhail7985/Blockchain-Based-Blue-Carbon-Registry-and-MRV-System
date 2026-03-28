import mongoose from 'mongoose';
import User from '../models/User.js';
import Plantation from '../models/Plantation.js';

async function check() {
  await mongoose.connect('mongodb://localhost:27017/blue_carbon_db');
  
  const panchayat = await User.findOne({ name: 'KapurthalaLocalPanchayat' }).lean();
  console.log('PANCHAYAT FULL:', JSON.stringify(panchayat, null, 2));

  const samplePlantation = await Plantation.findOne({ district: 'kapurthala', status: 'PENDING_PANCHAYAT' }).lean();
  console.log('PLANTATION SAMPLE:', JSON.stringify(samplePlantation, null, 2));

  mongoose.disconnect();
}
check();
