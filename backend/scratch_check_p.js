import mongoose from 'mongoose';
import Plantation from './models/Plantation.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const p = await Plantation.findOne({ plantationId: 'BCR-PLT-MP4C1WGD-ZX7C4B' });
    if (!p) {
      console.log('Plantation not found');
    } else {
      console.log('Status:', p.status);
      console.log('PanchayatData:', JSON.stringify(p.panchayatData, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
