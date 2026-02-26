import mongoose from 'mongoose';
import { LAND_STATUS } from '../constants/plantationStatus.js';

const landSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    areaHectares: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(LAND_STATUS),
      default: LAND_STATUS.PENDING_VERIFICATION,
    },
    documentPath: { type: String },
    landReference: { type: String, trim: true },
    verifiedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

landSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Land', landSchema);
