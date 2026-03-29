import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const atlasUri = 'mongodb+srv://mohd12221184:Q6xDLB59sIBl25aV@cluster0.rcpg0eg.mongodb.net/blue_carbon_registry?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  console.log('⏳ Attempting to connect to MongoDB Atlas...');
  try {
    await mongoose.connect(atlasUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Success! Successfully connected to your MongoDB Atlas cluster.');
    console.log('Database Name:', mongoose.connection.name);
    console.log('Connection ready state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Error');
    
    await mongoose.connection.close();
    console.log('\n👋 Connection closed. Your cloud database is ready.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error('Error details:', error.message);
    console.error('\n💡 Troubleshooting Tips:');
    console.error('1. Check if "Network Access" in Atlas is set to allow 0.0.0.0/0 (anywhere).');
    console.error('2. Verify the database user password in the connection string.');
    process.exit(1);
  }
}

testConnection();
