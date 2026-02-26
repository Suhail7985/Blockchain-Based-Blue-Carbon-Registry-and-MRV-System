import mongoose from 'mongoose';
import { PLANTATION_STATUS } from '../constants/plantationStatus.js';

const gpsSchema = new mongoose.Schema(
  { lat: { type: Number }, lng: { type: Number } },
  { _id: false }
);

const panchayatVerificationSchema = new mongoose.Schema(
  {
    panchayatId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decision: { type: String, enum: ['approved', 'rejected'] },
    timestamp: { type: Date },
    remarks: { type: String },
  },
  { _id: false }
);

const nccrVerificationSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decision: { type: String, enum: ['approved', 'rejected'] },
    timestamp: { type: Date },
    notes: { type: String },
  },
  { _id: false }
);

const carbonCalculationSchema = new mongoose.Schema(
  {
    biomass: { type: Number },
    carbon: { type: Number },
    co2eq: { type: Number },
    tokens: { type: Number },
    avgBiomassPerTree: { type: Number },
  },
  { _id: false }
);

const plantationSchema = new mongoose.Schema(
  {
    plantationId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landId: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
    speciesName: { type: String, required: true, trim: true },
    treeCount: { type: Number, required: true, min: 1 },
    areaHectares: { type: Number, required: true, min: 0 },
    plantationDate: { type: Date, required: true },
    gpsCoordinates: { type: gpsSchema },
    imagePaths: [{ type: String }],
    declarationAccepted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(PLANTATION_STATUS),
      default: PLANTATION_STATUS.PENDING_PANCHAYAT,
    },
    submissionTimestamp: { type: Date, default: Date.now },
    panchayatVerification: { type: panchayatVerificationSchema },
    nccrVerification: { type: nccrVerificationSchema },
    carbonCalculation: { type: carbonCalculationSchema },
    blockchainHash: { type: String },
    blockchainTxHash: { type: String },
    tokenTxHash: { type: String },
    auditLog: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { timestamps: true }
);

plantationSchema.index({ userId: 1, status: 1 });
plantationSchema.index({ landId: 1, plantationDate: 1 });

export default mongoose.model('Plantation', plantationSchema);
