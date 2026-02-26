import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';

const statusTimelineSchema = new mongoose.Schema({
  step: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  notes: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    match: [
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      'Please add a valid phone number',
    ],
  },
  role: {
    type: String,
    enum: ['citizen', 'ngo', 'community', 'panchayat', 'admin', 'verifier'],
    default: 'citizen',
  },
  accountStatus: {
    type: String,
    enum: Object.values(ACCOUNT_STATUS),
    default: ACCOUNT_STATUS.PROFILE_INCOMPLETE,
  },
  referenceId: {
    type: String,
    unique: true,
    sparse: true,
  },
  // Panchayat identifier (assigned by NCCR)
  panchayatId: {
    type: String,
    unique: true,
    sparse: true,
  },
  // Personal Details
  dateOfBirth: { type: Date },
  address: { type: String, trim: true },
  state: { type: String, trim: true },
  district: { type: String, trim: true },
  // Organization
  ngoName: { type: String, trim: true },
  ngoRegistrationNumber: { type: String, trim: true },
  // Aadhaar - SECURITY: Store last 4 digits only, never full number
  aadhaarLast4: { type: String, maxlength: 4 },
  aadhaarDocumentPath: { type: String }, // Encrypted/stored path, not full Aadhaar
  aadhaarUploadedAt: { type: Date },
  aadhaarNameMatch: { type: Boolean },
  aadhaarDobMatch: { type: Boolean },
  identityVerifiedAt: { type: Date },
  manualReview: {
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
    reason: { type: String },
    requestedAt: { type: Date },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedByRole: { type: String },
    notes: { type: String },
  },
  // Land Ownership
  ownershipType: {
    type: String,
    enum: ['private', 'community', ''],
  },
  landDocumentPath: { type: String },
  landDocumentUploadedAt: { type: Date },
  landAreaHectares: { type: Number, min: 0 },
  idProofUrl: { type: String },
  // Declaration
  declarationAccepted: { type: Boolean, default: false },
  declarationAcceptedAt: { type: Date },
  // Verification metadata
  rejectionReason: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  panchayatApprovedAt: { type: Date },
  nccrApprovedAt: { type: Date },
  statusTimeline: {
    type: [statusTimelineSchema],
    default: () => [
      { step: 'Email Verified', completed: true, completedAt: new Date() },
      { step: 'Identity Verified', completed: false },
      { step: 'Land Verified', completed: false },
      { step: 'Account Activated', completed: false },
    ],
  },
  isEmailVerified: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  walletAddress: { type: String, lowercase: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    this.updatedAt = new Date();
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

userSchema.statics.generateReferenceId = async function () {
  const prefix = 'BCR';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export default mongoose.model('User', userSchema);
