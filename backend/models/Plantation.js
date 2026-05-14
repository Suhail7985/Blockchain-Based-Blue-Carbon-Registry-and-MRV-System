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

const healthCheckSchema = new mongoose.Schema(
  {
    checkType: {
      type: String,
      enum: ['initial_verification', 'survival_check', 'carbon_recalculation'],
      required: true,
    },
    scheduledYear: { type: Number, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedByRole: { type: String, enum: ['panchayat', 'admin', 'ngo'] },
    performedAt: { type: Date, default: Date.now },
    result: { type: String, enum: ['pass', 'fail', 'recalculated'], required: true },
    survivalRate: { type: Number, min: 0, max: 100 },
    survivingTrees: { type: Number },
    updatedCO2: { type: Number },
    notes: { type: String },
    evidenceImages: [{ type: String }],
  },
  { _id: true }
);

const plantationDetailsSchema = new mongoose.Schema(
  {
    phaseNumber: { type: String, trim: true },
    speciesDetails: [
      {
        speciesName: { type: String },
        count: { type: Number },
      },
    ],
    plantingMethod: { type: String, trim: true },
    seedSource: { type: String, trim: true },
    nurseryPartner: { type: String, trim: true },
    financials: {
      labourCost: { type: Number, min: 0 },
      materialCost: { type: Number, min: 0 },
      supervisionCost: { type: Number, min: 0 },
    },
    communityInvolvement: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very_High'],
    },
    technicalPartner: { type: String, trim: true },
    trainingProvided: { type: Boolean, default: false },
  },
  { _id: false }
);

const panchayatDataSchema = new mongoose.Schema(
  {
    mgnrega: {
      personDays: { type: Number, min: 0 },
      wageRate: { type: Number, min: 0 },
    },
    survivalRate: { type: Number, min: 0, max: 100 },
    mortalityCauses: { type: String, trim: true },
    nextPlantationDate: { type: Date },
    certificationBody: { type: String, trim: true },
    localTrainingProvided: { type: Boolean, default: false },
  },
  { _id: false }
);

const mrvDataSchema = new mongoose.Schema(
  {
    monitoringSeason: { type: String, trim: true },
    monitoringMethod: { type: String, trim: true },
    technologyUsed: { type: String, trim: true },
    biomass: {
      aboveGround: { type: Number, min: 0 },
      belowGround: { type: Number, min: 0 },
      soilOrganicCarbon0_30: { type: Number, min: 0 },
      soilOrganicCarbon30_100: { type: Number, min: 0 },
      deadWood: { type: Number, min: 0 },
      litter: { type: Number, min: 0 },
    },
    auditTrail: {
      technologyUsed: { type: String },
      satelliteSource: { type: String },
      droneSpecs: { type: String },
      gpsAccuracy: { type: Number },
      weatherConditions: { type: String },
      accessibilityRating: { type: String },
      communityParticipation: { type: Number },
      dataQualityScore: { type: Number },
    },
    verification: {
      verifierName: { type: String },
      verifierType: { type: String },
      verifierCredential: { type: String },
      reportHash: { type: String },
      ipfsHash: { type: String },
      complianceStandard: { type: String },
      labCertification: { type: String },
      institutionalApprovalStatus: { type: String },
    },
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
    latitude: { type: Number },
    longitude: { type: Number },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    panchayatName: { type: String, trim: true },
    imagePaths: [{ type: String }],
    declarationAccepted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(PLANTATION_STATUS),
      default: PLANTATION_STATUS.PENDING_PANCHAYAT,
    },
    submissionTimestamp: { type: Date, default: Date.now },

    // Role-Based Detailed Data
    plantationDetails: { type: plantationDetailsSchema },
    panchayatData: { type: panchayatDataSchema },
    mrvData: { type: mrvDataSchema },

    panchayatVerification: { type: panchayatVerificationSchema },
    nccrVerification: { type: nccrVerificationSchema },
    carbonCalculation: { type: carbonCalculationSchema },
    blockchainHash: { type: String },
    blockchainTxHash: { type: String },
    tokenTxHash: { type: String },
    // Model B: Government subsidy payment to citizen
    subsidyRecord: {
      amountPaid: { type: Number },        // e.g. 0.05 MATIC
      currency: { type: String, default: 'MATIC' },
      txHash: { type: String },            // Blockchain tx proof
      blockNumber: { type: Number },
      paidAt: { type: Date },
      rate: { type: Number },              // MATIC per BCC at time of payment
      bccGenerated: { type: Number },      // How many BCC were minted to treasury
    },
    auditLog: [{ type: mongoose.Schema.Types.Mixed }],
    healthChecks: [{ type: healthCheckSchema }],
    rejectionHistory: [
      {
        previousStatus: String,
        reason: String,
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);


plantationSchema.index({ userId: 1, status: 1 });
plantationSchema.index({ landId: 1, plantationDate: 1 });

export default mongoose.model('Plantation', plantationSchema);
