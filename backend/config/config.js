import dotenv from 'dotenv';
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blue_carbon_db',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretkey_change_me_in_production',
    expire: process.env.JWT_EXPIRE || '7d',
    cookieExpire: 7, // days
  },

  blockchain: {
    rpcUrl: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    privateKey: process.env.AMOY_PRIVATE_KEY || '',
    nccrPrivateKey: process.env.NCCR_WALLET_PRIVATE_KEY || '',
    explorerUrl: 'https://amoy.polygonscan.com',
    contracts: {
      bccToken: process.env.CARBON_CREDIT_TOKEN_ADDRESS || '',
      registry: process.env.PLANTATION_REGISTRY_ADDRESS || '',
    }
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'no-reply@bluecarbon.registry',
  },

  uploads: {
    path: 'uploads',
    maxSize: 5 * 1024 * 1024, // 5MB
    useCloudinary: process.env.USE_CLOUDINARY === 'true',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    }
  }
};

export default config;
