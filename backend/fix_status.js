import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function fix() {
  console.log('Connecting to database...');
  await mongoose.connect(uri);
  
  const result = await mongoose.connection.collection('plantations').updateMany(
    { status: 'PENDING_NCCR' },
    { $set: { status: 'PENDING_PANCHAYAT' } }
  );
  
  console.log(`Fixed ${result.modifiedCount} stuck plantations! You can now re-approve them in the admin portal.`);
  process.exit(0);
}

fix().catch(console.error);
