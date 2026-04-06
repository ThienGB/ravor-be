const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  timeframe: {
    type: String, // e.g. "30 days", "3 months"
    required: true,
  },
  startDate: {
    type: String,
  },
  pace: {
    type: String, // e.g. "Casual", "Moderate", "Aggressive"
    default: "Moderate",
  },
  preferences: {
    weekendsOff: { type: Boolean, default: false },
    earlyBird: { type: Boolean, default: true },
    focusFundamentals: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Goal', goalSchema);
