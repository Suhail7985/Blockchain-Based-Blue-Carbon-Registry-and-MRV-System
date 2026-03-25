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
      bccToken: process.env.BCC_TOKEN_ADDRESS || '',
      registry: process.env.REGISTRY_CONTRACT_ADDRESS || '',
    }
  },

  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.FROM_EMAIL || 'no-reply@bluecarbon.registry',
  },

  uploads: {
    path: 'uploads',
    maxSize: 5 * 1024 * 1024, // 5MB
  }
};

export default config;
