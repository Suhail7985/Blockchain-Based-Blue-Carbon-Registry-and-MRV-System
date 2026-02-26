import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    plantationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plantation' },
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    previousStatus: { type: String },
    newStatus: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

auditLogSchema.index({ plantationId: 1, timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);

