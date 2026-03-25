import mongoose from 'mongoose';

const speciesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  scientificName: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Mangrove', 'Seagrass', 'Salt Marsh', 'Kelp Forest', 'Other'],
    required: true,
  },
  avgBiomassPerTreeKg: {
    type: Number,
    required: true,
    default: 50,
  },
  carbonFraction: {
    type: Number,
    default: 0.48,
  },
  co2eqFactor: {
    type: Number,
    default: 3.67,
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.model('Species', speciesSchema);
