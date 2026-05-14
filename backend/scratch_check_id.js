import mongoose from 'mongoose';
import Plantation from './models/Plantation.js';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const id = '6a04b49d4b93d4a4730a5c04';
    const p = await Plantation.findById(id);
    if (!p) {
      console.log('Plantation not found by _id');
      const p2 = await Plantation.findOne({ plantationId: id });
      if (p2) {
        console.log('Found by plantationId:', p2.plantationId);
      } else {
        console.log('Not found by plantationId either');
      }
    } else {
      console.log('Found by _id!');
      console.log('plantationId:', p.plantationId);
      console.log('Status:', p.status);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
