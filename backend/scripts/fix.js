import mongoose from 'mongoose';
import Plantation from '../models/Plantation.js';

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/blue_carbon_db');
  await Plantation.updateMany(
    { status: 'BLOCKCHAIN_PENDING' },
    { $set: { status: 'PENDING_PANCHAYAT' }, $unset: { blockchainHash: 1, blockchainTxHash: 1, tokenTxHash: 1, nccrVerification: 1, panchayatVerification: 1, carbonCalculation: 1 } }
  );
  console.log('Fixed stuck plantations');
  mongoose.disconnect();
}
fix();
