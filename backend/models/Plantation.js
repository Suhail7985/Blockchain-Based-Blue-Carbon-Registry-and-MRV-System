const mongoose = require('mongoose');
const { CARBON_SEQUESTRATION_RATE } = require('../utils/constants');

const plantationSchema = new mongoose.Schema({
  plantationName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  plantedDate: {
    type: Date,
    required: true
  },
  treeCount: {
    type: Number,
    required: true,
    min: 0
  },
  mangrovePercentage: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  carbonSequestered: {
    type: Number,
    default: function() {
      return (this.area || 0) * CARBON_SEQUESTRATION_RATE;
    }
  },
  verificationNote: {
    type: String,
    default: ''
  },
  verifiedAt: {
    type: Date
  },
  userId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plantation', plantationSchema);

