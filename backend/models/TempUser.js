import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups
tempUserSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model('TempUser', tempUserSchema);
