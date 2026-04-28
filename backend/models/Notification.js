import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'plantation_approved',
        'plantation_rejected',
        'token_minted',
        'kyc_approved',
        'kyc_rejected',
        'blockchain_confirmed',
        'general',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Extra context for voice alert / deep-link
    metadata: {
      plantationId: { type: String },
      txHash: { type: String },
      tokens: { type: Number },
      co2eq: { type: Number },
      reason: { type: String },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
