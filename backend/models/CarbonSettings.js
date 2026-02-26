import mongoose from 'mongoose';

const carbonSettingsSchema = new mongoose.Schema({
  avgBiomassPerTreeKg: { type: Number, default: 50 },
  carbonFraction: { type: Number, default: 0.48 },
  co2eqFactor: { type: Number, default: 3.67 },
  tokenRule: { type: String, default: '1_token_per_ton' },
  autoMintEnabled: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('CarbonSettings', carbonSettingsSchema);

