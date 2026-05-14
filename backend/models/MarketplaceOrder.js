/**
 * Marketplace Order Model
 * Tracks buy transactions - buyer pays ₹1500/BCC for credits from TOKEN_MINTED plantations.
 */
import mongoose from 'mongoose';

const marketplaceOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plantationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plantation', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    // MODEL B: Identifies if the credit is sold by Government Treasury or Citizen
    sellerType: { type: String, enum: ['CITIZEN', 'GOVERNMENT'], default: 'GOVERNMENT' },
    // Transaction details
    creditsBought: { type: Number, required: true, min: 0.01 },
    pricePerCreditINR: { type: Number, required: true },
    totalAmountINR: { type: Number, required: true },
    // Payment
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentMethod: { type: String, trim: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    // Blockchain settlement
    blockchainTxHash: { type: String },
    blockchainSettled: { type: Boolean, default: false },
    // Timestamps
    paidAt: { type: Date },
    settledAt: { type: Date },
  },
  { timestamps: true }
);

marketplaceOrderSchema.index({ buyerId: 1, createdAt: -1 });
marketplaceOrderSchema.index({ plantationId: 1, paymentStatus: 1 });
marketplaceOrderSchema.index({ sellerId: 1 });

export default mongoose.model('MarketplaceOrder', marketplaceOrderSchema);
