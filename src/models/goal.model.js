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
  duration: {
    type: String, // e.g. "3 months"
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Goal', goalSchema);
