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

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SECURITY: Authenticated File Access
const uploadsPath = path.join(process.cwd(), config.uploads.path);
app.get('/api/uploads/:folder/:filename', protect, authorizeFileAccess, (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(uploadsPath, folder, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Check root as fallback
    const rootPath = path.join(uploadsPath, filename);
    if (fs.existsSync(rootPath)) {
      res.sendFile(rootPath);
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  }
});

// Routes
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
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB Connection
// MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(config.mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Only listen if not on Vercel
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });
}

export default app;
