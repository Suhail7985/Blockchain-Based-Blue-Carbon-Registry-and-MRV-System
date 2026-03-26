import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import plantationRoutes from './routes/plantation.js';
import carbonRoutes from './routes/carbon.js';
import adminRoutes from './routes/admin.js';
import panchayatRoutes from './routes/panchayat.js';
import ledgerRoutes from './routes/ledger.js';
import ngoRoutes from './routes/ngo.js';
import publicRoutes from './routes/public.js';
import healthRoutes from './routes/health.js';

import config from './config/config.js';
import { protect } from './middleware/auth.js';
import { authorizeFileAccess } from './middleware/fileAuth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.port;

// 1. High-Priority CORS & OPTIONS Handler (Must be at the very top)
const allowedOrigins = [
  'https://carbonsetu.vercel.app',
  'https://carbonsetu-backend.vercel.app',
  'http://localhost:3000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle Preflight (OPTIONS) instantly to prevent 500s
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Enable standard CORS middleware as backup
app.use(cors({
  origin: true,
  credentials: true
}));

// 2. Standard Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SECURITY: Authenticated File Access
const uploadsPath = path.join(process.cwd(), config.uploads.path);
app.get('/api/uploads/:folder/:filename', protect, authorizeFileAccess, (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(uploadsPath, folder, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    const rootPath = path.join(uploadsPath, filename);
    if (fs.existsSync(rootPath)) {
      res.sendFile(rootPath);
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  }
});

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/plantation', plantationRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/panchayat', panchayatRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/health', healthRoutes);

// Server health check
app.get('/api/server-health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CarbonSetu API is running',
    db: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected'
  });
});

// 5. Global Error Handler (Prevents 500 crashes)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 6. Non-Blocking MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(config.mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

  // Only listen if not on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }
}

export default app;
